#!/usr/bin/env bash
# Builds ../index.html from the files in this folder. Run: bash src/build.sh
set -euo pipefail
cd "$(dirname "$0")"
{
  echo '<!doctype html>'
  echo '<html lang="en">'
  echo '<head>'
  cat meta.html head.html
  echo '</head>'
  echo '<body>'
  cat body.html
  echo '<script>'
  echo '(() => {'
  cat seed.js core.js strings.js samples.js floor.js map.js ui.js admin.js
  echo '})();'
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > ../index.html
echo "Built $(cd .. && pwd)/index.html"
