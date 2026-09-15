#!/usr/bin/env bash
set -e

EMSDK="${EMSDK:-$HOME/Documents/GitHub/emsdk}"
export PATH="$EMSDK:$EMSDK/upstream/emscripten:$PATH"

BUILD_DIR="build-em"

emcmake cmake -S . -B "$BUILD_DIR" -G Ninja
cmake --build "$BUILD_DIR" -- -j"${JOBS:-$(( $(nproc) / 2 ))}"

cp "$BUILD_DIR/bin/OurTaiko.html" "$BUILD_DIR/bin/OurTaiko.js" \
   "$BUILD_DIR/bin/OurTaiko.wasm" "$BUILD_DIR/bin/OurTaiko.data" .

echo "Build complete: OurTaiko.html"
