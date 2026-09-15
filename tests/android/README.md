# Android bundled game data checks

Run the real installer on a temporary directory with small in-memory assets:

```sh
javac --release 11 -d /tmp/ourtaiko-android-tests \
  android/app/src/main/java/org/ourtaiko/fanmade/GameDataInstaller.java \
  tests/android/GameDataInstallerTest.java
java -cp /tmp/ourtaiko-android-tests org.ourtaiko.fanmade.GameDataInstallerTest
```

Covers first install, config/skin recovery after deletion, preservation of edited
settings/skins and custom songs, skipping reads of existing large assets,
interrupted copy cleanup and retry, and cancellation. Only its own generated
temporary directory is removed.

With Android SDK/NDK and the skin submodules available, check Gradle packaging:

```sh
cd android
./gradlew :app:copyGameAssets :app:mergeDebugAssets :app:compileDebugJavaWithJavac
```

Inspect `app/build/generated/game_assets/GameData`: all three skin directories,
Songs, config.toml, LICENSE and NOTICE should be present, with no `.git` metadata.
The packaged config must enable touch input and VSync; the repository config must
stay unchanged. Removing an input asset and rerunning `copyGameAssets` should
remove it from the generated tree (Gradle Sync), without touching device data.

Device checks (Android 10 and Android 11+):

1. Fresh install: deny storage access. The game must not start or crash; the
   launcher explains the permission and offers Retry/Close.
2. Grant access and return: resource preparation runs off the UI thread, then
   starts the game. Inspect `/sdcard/OurTaiko/config.toml` and `Skins/`.
3. Edit config/skin files, add a song and restart: custom content is preserved.
4. Fully close the game, delete config.toml and a bundled skin file, then launch:
   both are restored from the APK.
5. Interrupt preparation or run out of storage: retry after resolving the issue;
   partially copied files must not be treated as complete.
6. Background the launcher while preparing files: it starts the game only after
   returning to the foreground. The older `/sdcard/YataiDON` directory is unused.
