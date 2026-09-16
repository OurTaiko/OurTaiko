#!/usr/bin/env python3
"""Generate ignored application icons from assets/branding/icon.png.

Uses Pillow on all CI platforms, with macOS sips as a local fallback.
Only resize the supplied artwork; never crop or redraw the logo.
"""
import argparse
import base64
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ensure", action="store_true", help="Skip unchanged, complete outputs")
    args = parser.parse_args()
    source = ROOT / "assets/branding/icon.png"
    stamp = ROOT / "assets/branding/.generated-icons.json"
    fingerprint = hashlib.sha256(source.read_bytes() + Path(__file__).read_bytes()
                                 + (ROOT / "tools/requirements-icons.txt").read_bytes()).hexdigest()
    if args.ensure and stamp.is_file():
        try:
            previous = json.loads(stamp.read_text())
            if previous["input"] == fingerprint and all(
                (ROOT / name).is_file() and hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest
                for name, digest in previous["outputs"].items()
            ):
                print("Application icons are up to date.")
                return
        except (ValueError, KeyError):
            pass
    try:
        from PIL import Image
    except ImportError:
        Image = None
        if not shutil.which("sips"):
            parser.error("Install icon dependencies: python3 -m pip install -r tools/requirements-icons.txt")
    # The canonical logo is a square PNG; reject accidental replacement with a
    # non-square image instead of silently stretching the artwork.
    width, height = struct.unpack_from(">II", source.read_bytes(), 16)
    if width != height:
        parser.error("assets/branding/icon.png must be square")
    original = Image.open(source).convert("RGB") if Image else None
    outputs = {}
    with tempfile.TemporaryDirectory() as temp:
        cache = {}

        def png(size):
            if size not in cache:
                if original is not None:
                    buffer = io.BytesIO()
                    original.resize((size, size), Image.Resampling.LANCZOS).save(buffer, format="PNG")
                    cache[size] = buffer.getvalue()
                else:
                    target = Path(temp) / f"{size}.png"
                    subprocess.run(["sips", "-z", str(size), str(size), str(source),
                                    "--out", str(target)], check=True, stdout=subprocess.DEVNULL)
                    cache[size] = target.read_bytes()
            return cache[size]

        def write(path, data):
            outputs[path.relative_to(ROOT).as_posix()] = hashlib.sha256(data).hexdigest()
            if path.is_file() and path.read_bytes() == data:
                return
            path.parent.mkdir(parents=True, exist_ok=True)
            # CMake and Gradle may request icons concurrently; readers must never
            # see partially written PNGs, catalogs or the completion stamp.
            with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as output:
                output.write(data)
                temporary = output.name
            os.chmod(temporary, 0o644)
            os.replace(temporary, path)

        def ico(sizes):
            offset = 6 + 16 * len(sizes)
            entries, images = [], []
            for size in sizes:
                data = png(size)
                entries.append(struct.pack("<BBBBHHII", size % 256, size % 256,
                                           0, 0, 1, 32, len(data), offset))
                images.append(data)
                offset += len(data)
            return struct.pack("<HHH", 0, 1, len(sizes)) + b"".join(entries + images)

        write(ROOT / "assets/branding/icon-256.png", png(256))
        write(ROOT / "windows/OurTaiko.ico", ico([16, 24, 32, 48, 64, 128, 256]))
        chunks = []
        for kind, size in [("icp4", 16), ("icp5", 32), ("icp6", 64), ("ic07", 128),
                           ("ic08", 256), ("ic09", 512), ("ic10", 1024),
                           ("ic11", 32), ("ic12", 64), ("ic13", 256), ("ic14", 512)]:
            data = png(size)
            chunks.append(kind.encode() + struct.pack(">I", len(data) + 8) + data)
        data = b"".join(chunks)
        write(ROOT / "macos/OurTaiko.icns", b"icns" + struct.pack(">I", len(data) + 8) + data)

        catalog = ROOT / "ios/Assets.xcassets"
        write(catalog / "Contents.json", b'{"info":{"author":"xcode","version":1}}\n')
        appicon = catalog / "AppIcon.appiconset"
        images = []
        for idiom, points, scales in [
            ("iphone", 20, [2, 3]), ("iphone", 29, [2, 3]),
            ("iphone", 40, [2, 3]), ("iphone", 60, [2, 3]),
            ("ipad", 20, [1, 2]), ("ipad", 29, [1, 2]),
            ("ipad", 40, [1, 2]), ("ipad", 76, [1, 2]),
            ("ipad", 83.5, [2]), ("ios-marketing", 1024, [1]),
        ]:
            for scale in scales:
                size = int(points * scale)
                name = f"icon-{size}.png"
                write(appicon / name, png(size))
                images.append({"idiom": idiom, "size": f"{points}x{points}",
                               "scale": f"{scale}x", "filename": name})
        write(appicon / "Contents.json", (json.dumps({"images": images,
              "info": {"author": "xcode", "version": 1}}, indent=2) + "\n").encode())

        res = ROOT / "android/app/src/main/res"
        for density, size in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96),
                              ("xxhdpi", 144), ("xxxhdpi", 192)]:
            write(res / f"mipmap-{density}/ic_launcher.png", png(size))
        write(res / "drawable-nodpi/ic_launcher_logo.png", png(432))

        # The Emscripten shell keeps its standard UI; pre-js supplies its favicon.
        uri = "data:image/png;base64," + base64.b64encode(png(48)).decode()
        write(ROOT / "assets/branding/web-icon.js", (
            "// Generated by tools/generate_icons.py.\n"
            "if (typeof document !== 'undefined') {\n"
            "  var ourTaikoIcon = document.createElement('link');\n"
            "  ourTaikoIcon.rel = 'icon';\n"
            "  ourTaikoIcon.type = 'image/png';\n"
            f"  ourTaikoIcon.href = '{uri}';\n"
            "  document.head.appendChild(ourTaikoIcon);\n}\n").encode())

        write(stamp, (json.dumps({"input": fingerprint, "outputs": outputs}, indent=2) + "\n").encode())
        print("Generated application icons.")


if __name__ == "__main__":
    main()
