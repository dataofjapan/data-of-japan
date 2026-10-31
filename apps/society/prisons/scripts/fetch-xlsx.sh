#!/usr/bin/env bash
# 犯罪白書の Excel を data/raw/hakusyo に置く。API キーは不要。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HAKUSYO="$ROOT/data/raw/hakusyo"
mkdir -p "$HAKUSYO"

for f in \
  2-4-2-1.xlsx \
  2-4-2-2.xlsx \
  2-4-2-4.xlsx \
  2-4-2-5.xlsx \
  2-5-2-1.xlsx \
  5-3-1.xlsx \
  shiryo2-5.xlsx \
  shiryo2-9.xlsx
do
  echo "fetch hakusyo $f"
  curl -fsSL -A "Mozilla/5.0" -o "$HAKUSYO/$f" \
    "https://hakusyo1.moj.go.jp/jp/72/nfm/excel/$f"
done

echo "done"
