#!/usr/bin/env python3
"""Register this portable installation in the current user's application menu."""
import os
from pathlib import Path


def desktop_string(value):
    return str(value).replace("\\", "\\\\").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")


def main():
    game_dir = Path(__file__).resolve().parent
    executable = game_dir / "OurTaiko"
    icon = game_dir / "OurTaiko.png"
    if not executable.is_file() or not icon.is_file():
        raise SystemExit("Run this script beside OurTaiko and OurTaiko.png.")
    # Exec quoting is parsed after desktop-string escaping; % is a field code.
    command = str(executable).replace("%", "%%")
    for char in ['\\', '"', '`', '$']:
        command = command.replace(char, '\\' + char)
    applications = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local/share")) / "applications"
    applications.mkdir(parents=True, exist_ok=True)
    target = applications / "org.ourtaiko.fanmade.desktop"
    target.write_text(
        "[Desktop Entry]\nType=Application\nName=OurTaiko\n"
        f'Exec="{desktop_string(command)}"\n'
        f"Path={desktop_string(game_dir)}\nIcon={desktop_string(icon)}\n"
        "Terminal=false\nCategories=Game;\nStartupWMClass=org.ourtaiko.fanmade\n",
        encoding="utf-8",
    )
    print(f"Installed {target}")


if __name__ == "__main__":
    main()
