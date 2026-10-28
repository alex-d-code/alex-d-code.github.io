#!/bin/sh
# Renders the link previews (assets/img/og-<lang>.png), the apple-touch-icon
# and favicon.png from art.html with headless Chrome. Run after changing the
# hero text or the app list; the pages themselves are built by build.mjs.
set -eu
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
IMG="$PWD/../assets/img"
shot() { # size url out
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$1" --virtual-time-budget=5000 --screenshot="$3" "file://$PWD/art.html$2" 2>/dev/null
  echo "$3"
}
for l in en ru uk ro; do shot 1200,630 "?og=$l" "$IMG/og-$l.png"; done
shot 180,180 "?icon=1" "$IMG/apple-touch-icon.png"
shot 64,64 "?icon=1" "$PWD/../favicon.png"
