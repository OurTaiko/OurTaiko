# iOS online settings checks

The Foundation fixture uses a unique NSUserDefaults suite and removes only its
own values. It does not read or modify the game's preference domain. It includes
the real implementation in one translation unit so its internal SettingsStore
can receive that isolated suite and the source Settings.bundle.

```sh
clang++ -std=c++20 -I.cmake-deps/spdlog-src/include -framework Foundation tests/ios/network_settings.mm -o /tmp/ourtaiko-settings-test
/tmp/ourtaiko-settings-test "$PWD/ios/Settings.bundle"
```

`config_source.cpp` compiles the real `config.cpp` for both branches. The iOS
variant stubs only the platform preference accessors; Foundation behavior is
covered by the fixture above. Pass an empty temporary directory as the only
argument; the fixture writes a synthetic config.toml there.

```sh
clang++ -std=c++20 -I.cmake-deps/tomlplusplus-src/include -I.cmake-deps/spdlog-src/include -I.cmake-deps/raylib-src/src tests/ios/config_source.cpp src/libs/config.cpp -o /tmp/ourtaiko-config-desktop-test
clang++ -std=c++20 -DPLATFORM_IOS -I.cmake-deps/tomlplusplus-src/include -I.cmake-deps/spdlog-src/include -I.cmake-deps/raylib-src/src -Ibuild-ios-device/_deps/sdl3-src/include tests/ios/config_source.cpp src/libs/config.cpp -o /tmp/ourtaiko-config-ios-test
python3 - <<'PYTEST'
import subprocess, tempfile
for variant in ('desktop', 'ios'):
    with tempfile.TemporaryDirectory(prefix='ourtaiko-config-') as directory:
        subprocess.run(['/tmp/ourtaiko-config-' + variant + '-test', directory], check=True)
PYTEST
```

Coverage: defaults before visiting Settings.app, five independent slots,
disabled servers, Unicode and exact passwords, empty/custom proxies, one-time
migration, existing system settings taking precedence, all-disabled staying
offline, iOS reading system settings, other platforms reading/writing TOML, and
iOS saves not copying online credentials into TOML.

Device check: build and install without uninstalling the existing app, launch
once, then open Settings → Apps → YataiDON. Verify all five pages, masked password
entry and the imported server. Change an enabled server or account in Settings,
fully restart the game and check the corresponding song folder. Never include
real passwords or preference dumps in committed fixtures or logs.
