#!/bin/bash

# OurTaiko Debug Build Script
# Builds the project in Debug mode with sanitizers and copies the executable to root

set -e  # Exit on error

echo "Building OurTaiko (Debug)..."
echo ""

# Clean and build
rm -rf build
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug \
  $(command -v ccache &>/dev/null && echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache")
cmake --build build -j"${JOBS:-$(( $(nproc) / 2 ))}"

# Copy executable to root directory
if [ -f build/bin/OurTaiko ]; then
    echo ""
    echo "Copying executable to root directory..."
    cp build/bin/OurTaiko ./OurTaiko
    cp build/bin/LICENSE build/bin/NOTICE .
    chmod +x ./OurTaiko
    echo "Build complete! Executable is ready at ./OurTaiko"
else
    echo "Error: Executable not found at build/bin/OurTaiko"
    exit 1
fi
