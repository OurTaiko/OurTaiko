# Configuration recovery checks

Compile the real settings implementation for desktop, Android, and iOS using the
host dependencies. Mobile tests exercise their actual preprocessor branches;
iOS system preferences alone are stubbed. These are not device/UI tests.

Run from the repository root:

```sh
python3 - <<'PYTEST'
import subprocess, tempfile
common = ['clang++', '-std=c++20',
          '-I.cmake-deps/tomlplusplus-src/include',
          '-I.cmake-deps/spdlog-src/include',
          '-I.cmake-deps/raylib-src/src', '-I.cmake-deps/sdl3-src/include']
for platform, defines in [('desktop', []), ('android', ['-DPLATFORM_ANDROID']),
                          ('ios', ['-DOURTAIKO_PLATFORM_IOS'])]:
    output = '/tmp/ourtaiko-recovery-' + platform
    subprocess.run(common + defines + ['tests/config/recovery.cpp',
                   'src/libs/config.cpp', '-o', output], check=True)
    with tempfile.TemporaryDirectory(prefix='ourtaiko-config-') as directory:
        subprocess.run([output, directory], check=True)
PYTEST
```

Checks missing settings creation, complete defaults (including mobile touch,
VSync, keyboard/gamepad mappings and Songs), malformed TOML, wrong scalar/array
and server types, invalid keys, discarding partial settings, byte-for-byte backups,
backup collisions, successful reload, explicit touch opt-out, legacy gamepad
settings, and recovery of dev-config.toml without touching config.toml.

Default settings in `default_settings()` mirror the shipped config.toml, with
mobile touch/VSync overrides. Update both when intentionally changing defaults.
The separate [iOS config source tests](../ios/README.md) cover native preference
migration and keep system credentials out of saved TOML files.
