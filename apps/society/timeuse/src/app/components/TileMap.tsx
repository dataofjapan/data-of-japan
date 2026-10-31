/**
 * 都道府県のタイル地図。行動時間の全国比（relative）を升目に書く。
 */

import { scaleLinear } from "d3-scale";

const LAYOUT = [
  "........................01",
  "........................02",
  "......................0503",
  "......................0604",
  "....................1507..",
  "..............171620100908",
  "..............1821..111312",
  "....3231..2625..23221914..",
  "..35343328272924..........",
  "404438373630..............",
  "4143..39..................",
  "424645....................",
  "..........................",
  "47........................",
];

const COLS = 13;
const BELOW = "#8fb4cc";
const MIDDLE = "#ffffff";
const ABOVE = "#dd9583";

export interface Tile {
  code: string;
  label: string;
  relative: number | null;
  minutes: number | null;
}

function short(label: string): string {
  return label.replace(/[都府県]$/, "");
}

const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const RATIO = 1.5;
const color = scaleLinear<string>()
  .domain([-Math.log(RATIO), 0, Math.log(RATIO)])
  .range([BELOW, MIDDLE, ABOVE])
  .clamp(true);

export function TileMap({
  tiles,
  hovered,
  onHover,
  pinned,
  onPin,
}: {
  tiles: Tile[];
  hovered: string | null;
  onHover: (code: string | null) => void;
  pinned: string | null;
  onPin: (code: string | null) => void;
}) {
  const byPrefix = new Map(tiles.map((t) => [t.code.slice(0, 2), t]));

  return (
    <div className="mx-[-0.5rem] overflow-x-auto px-2">
      <div
        className="grid aspect-[13/14] max-w-[700px] min-w-[560px] gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${LAYOUT.length}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => onHover(null)}
      >
        <div className="col-span-full row-span-full contents">
          {LAYOUT.flatMap((row, ri) =>
            Array.from({ length: COLS }, (_, ci) => {
              const cell = row.slice(ci * 2, ci * 2 + 2);
              if (!cell || cell === ".." || cell.trim() === "") {
                return (
                  <div
                    key={`${ri}-${ci}`}
                    style={{ gridColumn: ci + 1, gridRow: ri + 1 }}
                  />
                );
              }
              const tile = byPrefix.get(cell);
              if (!tile) {
                return (
                  <div
                    key={`${ri}-${ci}`}
                    style={{ gridColumn: ci + 1, gridRow: ri + 1 }}
                    className="rounded-[3px] bg-ink/[0.03]"
                  />
                );
              }
              const active = pinned === tile.code || hovered === tile.code;
              const fill =
                tile.relative !== null && tile.relative > 0
                  ? color(Math.log(tile.relative))
                  : "#ece8e1";
              return (
                <button
                  key={tile.code}
                  type="button"
                  style={{
                    gridColumn: ci + 1,
                    gridRow: ri + 1,
                    backgroundColor: fill,
                  }}
                  className={`cursor-pointer rounded-[3px] border text-left transition-[box-shadow,transform] duration-150 ${
                    active
                      ? "z-10 scale-[1.04] border-ink/40 shadow-sm"
                      : "border-transparent hover:border-ink/20"
                  }`}
                  onMouseEnter={() => onHover(tile.code)}
                  onFocus={() => onHover(tile.code)}
                  onClick={() => onPin(pinned === tile.code ? null : tile.code)}
                  aria-pressed={pinned === tile.code}
                  aria-label={`${tile.label} 全国比 ${
                    tile.relative !== null ? one.format(tile.relative) : "—"
                  }`}
                >
                  <span className="block px-0.5 pt-0.5 text-[9px] leading-none text-ink/80">
                    {short(tile.label)}
                  </span>
                  <span className="tnum block px-0.5 text-[10px] font-medium leading-tight text-ink">
                    {tile.relative !== null ? one.format(tile.relative) : "—"}
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-faint">
        色は全国比（青=短い、赤=長い）。升目の数字も全国比。
      </p>
    </div>
  );
}
