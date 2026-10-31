#!/usr/bin/env bash
# 犯罪白書の Excel を data/raw/hakusyo に置く。API キーは不要。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HAKUSYO="$ROOT/data/raw/hakusyo"
mkdir -p "$HAKUSYO"

for f in \
  3-2-3-2.xlsx \
  3-2-3-4.xlsx \
  3-2-4-1.xlsx \
  3-2-4-2.xlsx \
  3-2-4-3.xlsx
do
  echo "fetch hakusyo $f"
  curl -fsSL -A "Mozilla/5.0" -o "$HAKUSYO/$f" \
    "https://hakusyo1.moj.go.jp/jp/72/nfm/excel/$f"
done

echo "done"
