# Difficulty selection regression checks

Run the shared selection rules without starting graphics or audio:

```sh
clang++ -std=c++20 -fsanitize=address,undefined -I.cmake-deps/tomlplusplus-src/include -I.cmake-deps/spdlog-src/include -I.cmake-deps/raylib-src/src tests/song_select/difficulty_selection.cpp -o /tmp/ourtaiko-difficulty-test
/tmp/ourtaiko-difficulty-test
```

Coverage includes Edit alone, Easy + Edit, Oni + Edit, sparse courses, stale Ura
mode on a song without Edit, empty metadata, and all 32 ordinary course subsets
with both display modes and every remembered difficulty.

In-game regression: for Edit-only and Easy + Edit songs, verify Edit is visible
on entering course select, move left/right through options and all available
courses, and confirm Edit enters gameplay. With Oni + Edit, press right ten
times on Oni to switch, then move left and right; repeat with lower courses
missing. Back out and re-enter, then select a song without Edit. Repeat in 2P,
including having either player select the song and toggle the shared column.
Check both a Lua skin and the C++ fallback for Edit's level and crown.
