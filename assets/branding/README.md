# Application icon

`icon.png` is the original OurTaiko logo supplied by the maintainer. All icons
retain its complete artwork, wordmark and background.

Only the original PNG, generator and platform configuration files are tracked.
Resized PNGs, ICO, ICNS, iOS icon catalogs, embedded web icon script and the
generation stamp are ignored by Git. CI generates them before building on every
platform; CMake configuration and Android `preBuild` also ensure they exist.

To regenerate manually on Windows, macOS or Linux:

```sh
python3 -m pip install -r tools/requirements-icons.txt
python3 tools/generate_icons.py
```

Use a Python virtual environment if your system Python is externally managed.
macOS can use its built-in `sips` without installing Pillow. CI uses the pinned
Pillow version in `tools/requirements-icons.txt` on all platforms. `--ensure`
skips generation only when the source, generator, dependencies and every output
are unchanged. For Android, `-PiconPython=/path/to/python` selects an interpreter.

Fanmade and OurTaikoWiki are independent repositories. Each tracks its own copy
of `assets/branding/icon.png` and uses `pnpm icons` to generate ignored web icons;
their `pnpm dev` and `pnpm build` commands run this step automatically.

- Windows: multi-resolution `windows/OurTaiko.ico` is embedded by the RC file.
- Windows/macOS/Linux: a 256 px PNG is embedded in the executable for the window,
  taskbar or Dock through raylib/SDL.
- macOS: `OurTaiko.app` contains an ICNS icon and launches the adjacent portable
  executable. Build/rebuild scripts and release archives include the launcher.
- Linux: the package includes `OurTaiko.png` and an optional per-user desktop
  entry installer. The window icon works without installing a desktop entry.
- Android: density-specific legacy PNGs and an adaptive icon are configured in
  the application manifest. Insets keep the whole logo inside launcher masks.
- iOS: `Assets.xcassets/AppIcon.appiconset` covers iPhone, iPad and the App Store;
  the Xcode asset compiler generates the bundle's icon metadata.
- Emscripten: generated pre-JS adds the icon to the standard web build shell.

Desktop release/update packages carry the launcher assets as well as the binary.
