#!/usr/bin/env python3
"""Create an OurTaiko release keystore outside Git, or upload it to Actions."""
import argparse
import base64
import json
import os
from pathlib import Path
import secrets
import subprocess


def run(args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)


def create(directory, keytool):
    # Refuse to replace a signing identity, even if a previous setup was partial.
    if directory.exists():
        raise SystemExit(f"Directory already exists; no signing key was replaced: {directory}")
    run([keytool, "-help"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    directory.mkdir(mode=0o700, parents=True, exist_ok=False)
    password = directory / "password.txt"
    password.write_text(secrets.token_urlsafe(32) + "\n")
    keystore = directory / "ourtaiko-release.jks"
    common = ["-keystore", str(keystore), "-storepass:file", str(password),
              "-alias", "ourtaiko"]
    run([keytool, "-genkeypair", *common, "-keypass:file", str(password),
         "-storetype", "JKS", "-keyalg", "RSA", "-keysize", "3072",
         "-sigalg", "SHA256withRSA", "-validity", "10000",
         "-dname", "CN=OurTaiko, OU=OurTaiko, O=OurTaiko"])
    run([keytool, "-exportcert", *common, "-rfc", "-file",
         str(directory / "certificate.pem")])
    result = run([keytool, "-list", *common, "-v"], capture_output=True, text=True)
    (directory / "certificate-info.txt").write_text(result.stdout)
    (directory / "README.txt").write_text(
        "OurTaiko Android release signing identity\n\n"
        "Keystore: ourtaiko-release.jks (JKS)\n"
        "Alias: ourtaiko\n"
        "Keystore and key password: password.txt\n"
        "Public certificate: certificate.pem\n"
        "Certificate details: certificate-info.txt\n\n"
        "Keep an independent secure backup of this entire directory.\n"
        "Use the same key for future org.ourtaiko.fanmade APK updates.\n"
        "Do not commit the keystore or password to Git.\n"
        "GitHub Secrets are not a downloadable backup.\n"
    )
    print(f"Created signing identity in {directory}")
    print("Alias: ourtaiko. Password was saved locally and was not printed.")


def upload(directory, repo, replace_existing):
    password = (directory / "password.txt").read_text().rstrip("\r\n")
    values = {
        "ANDROID_KEYSTORE_BASE64": base64.b64encode(
            (directory / "ourtaiko-release.jks").read_bytes()).decode("ascii"),
        "ANDROID_KEYSTORE_PASSWORD": password,
        "ANDROID_KEY_ALIAS": "ourtaiko",
        "ANDROID_KEY_PASSWORD": password,
    }
    result = run(["gh", "secret", "list", "--repo", repo, "--json", "name"],
                 capture_output=True, text=True)
    existing = {item["name"] for item in json.loads(result.stdout)} & values.keys()
    if existing and not replace_existing:
        raise SystemExit("Signing secrets already exist. To intentionally upload this "
                         "same backup again, pass --replace-existing.")
    for name, value in values.items():
        # Send secret values via stdin, never command arguments or console output.
        run(["gh", "secret", "set", name, "--repo", repo],
            input=value, text=True, stdout=subprocess.DEVNULL)
        print(f"Configured {name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["create", "upload"])
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--keytool", default="keytool")
    parser.add_argument("--repo")
    parser.add_argument("--replace-existing", action="store_true")
    args = parser.parse_args()
    directory = args.directory.expanduser().resolve()
    repo_root = Path(__file__).resolve().parents[1]
    if directory == repo_root or repo_root in directory.parents:
        parser.error("Store signing keys outside the project repository.")
    os.umask(0o077)
    if args.command == "create":
        create(directory, args.keytool)
    else:
        if not args.repo:
            parser.error("upload requires --repo OWNER/REPO")
        upload(directory, args.repo, args.replace_existing)


if __name__ == "__main__":
    main()
