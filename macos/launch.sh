#!/bin/sh
# This app stays beside the portable executable, Skins, Songs and lib directory.
set -eu
game_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../../.." && pwd)
cd "$game_dir"
exec "$game_dir/OurTaiko" "$@"
