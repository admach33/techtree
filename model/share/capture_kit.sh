#!/bin/zsh
# Render the share kit to PNGs with headless Chrome (the Anatomy skill's capture script).
# Needs the "share" preview server on :8766 serving share/site. Usage: zsh share/capture_kit.sh  (from model/)
set -e
OUT="$PWD/share/kit"
CAP="$HOME/.claude/skills/anatomy/scripts/capture.mjs"
mkdir -p "$OUT"
# --zoom clips the exact box (the plain clip pads 12 px of page background).
shot() { node "$CAP" "http://localhost:8766/kit.html?only=$1" --select "#$1" --zoom "0,0,$3" --zoom-scale 1 --out "$OUT/$2.png" --width 1300 --height 1500 --scale 1 --wait 2500 | grep -v '^saved' || true; }
shot poster two-clocks-poster-1080x1350 1080,1350
shot social two-clocks-social-1200x675 1200,675
shot tree45 two-clocks-tree-1080x1350 1080,1350
shot tree169 two-clocks-tree-1600x900 1600,900
[ $# -eq 0 ] && set -- 1 2 3 4 5 6 7
for i in "$@"; do [ "$i" = none ] || shot "card-$i" "two-clocks-unlock-$i" 1080,1350; done
