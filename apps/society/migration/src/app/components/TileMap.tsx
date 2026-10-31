/**
 * 都道府県のタイル地図。転入超過（または転入・転出）を升目に書く。
 * 転入超過は 0 中心の発散色。転入・転出は量の濃淡。
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

/** 転入超過の色尺度（人）。端はクランプ。 */
const NET_ABS = 40_000;

export interface Tile {
  code: string;
  label: string;
  /** 表示・着色に使う値（転入超過なら signed）。 */
  value: number | null;
  /** 塗るかどうか。差が小さいセルは塗らない。 */
  certain: boolean;
  /** net のとき発散、in/out のとき単色濃淡。 */
  mode: "net" | "flow";
}

function short(label: string): string {
  return label.replace(/[都府県]$/, "");
}

const int = new Intl.NumberFormat("ja-JP");

const netColor = scaleLinear<string>()
  .domain([-NET_ABS, 0, NET_ABS])
  .range([BELOW, MIDDLE, ABOVE])
  .clamp(true);

const flowColor = scaleLinear<string>()
  .domain([0, 80_000, 200_000])
  .range([MIDDLE, "#e8d3ce", ABOVE])
  .clamp(true);

function formatTile(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10_000) return `${value > 0 ? "+" : "−"}${int.format(Math.round(abs / 1000))}千`;
  if (value > 0) return `+${int.format(Math.round(value))}`;
  if (value < 0) return `−${int.format(Math.round(abs))}`;
  return "0";
}

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
  const mode = tiles[0]?.mode ?? "net";

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
        <div
          className="flex flex-col justify-start pt-1"
          style={{ gridColumn: "1 / 8", gridRow: "1 / 6" }}
        >
          <Legend mode={mode} />
        </div>
        {LAYOUT.flatMap((row, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const prefix = row.slice(c * 2, c * 2 + 2);
            const tile = prefix === ".." ? undefined : byPrefix.get(prefix);
            if (tile === undefined) return null;
            const isPinned = tile.code === pinned;
            const bg =
              tile.value === null || !tile.certain
                ? "var(--color-paper)"
                : tile.mode === "net"
                  ? netColor(tile.value)
                  : flowColor(tile.value);
            return (
              <button
                type="button"
                key={tile.code}
                aria-pressed={isPinned}
                onClick={() => onPin(isPinned ? null : tile.code)}
                onMouseEnter={() => onHover(tile.code)}
                onFocus={() => onHover(tile.code)}
                onBlur={() => onHover(null)}
                title={`${tile.label} ${tile.value ?? "—"}`}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-[3px] border transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.97] ${
                  isPinned
                    ? "border-ink shadow-[0_0_0_1.5px_var(--color-ink)]"
                    : tile.code === hovered
                      ? "border-ink"
                      : "border-rule"
                }`}
                style={{
                  gridColumn: c + 1,
                  gridRow: r + 1,
                  backgroundColor: bg,
                }}
              >
                <span className="text-[9.5px] leading-tight text-ink/70">
                  {short(tile.label)}
                </span>
                <span
                  className={`tnum text-[10px] leading-tight ${
                    tile.certain ? "font-medium" : "text-faint"
                  }`}
                >
                  {tile.value === null ? "—" : formatTile(tile.value)}
                </span>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

function Legend({ mode }: { mode: "net" | "flow" }) {
  if (mode === "flow") {
    return (
      <div className="text-[10.5px] leading-relaxed text-muted">
        <p className="pb-1.5">転入・転出の人数</p>
        <div className="flex items-center gap-2">
          <span className="tnum">少</span>
          <span
            className="h-[7px] flex-1 rounded-full border border-rule"
            style={{
              background: `linear-gradient(to right, ${MIDDLE}, ${ABOVE})`,
            }}
          />
          <span className="tnum">多</span>
        </div>
      </div>
    );
  }
  return (
    <div className="text-[10.5px] leading-relaxed text-muted">
      <p className="pb-1.5">転入超過（人）</p>
      <div className="flex items-center gap-2">
        <span className="tnum">転出超過</span>
        <span
          className="h-[7px] flex-1 rounded-full border border-rule"
          style={{
            background: `linear-gradient(to right, ${BELOW}, ${MIDDLE}, ${ABOVE})`,
          }}
        />
        <span className="tnum">転入超過</span>
      </div>
      <p className="pt-1 text-faint">±4万人で端の色。小さい差は塗らない。</p>
    </div>
  );
}

if (import.meta.env.DEV) {
  const codes = LAYOUT.flatMap((row) => row.match(/../g) ?? []).filter((s) => s !== "..");
  if (new Set(codes).size !== 47) {
    throw new Error(`タイル配置の県が ${new Set(codes).size} 個しかない`);
  }
  if (LAYOUT.some((row) => row.length !== COLS * 2)) {
    throw new Error(`タイル配置の行の長さが ${COLS * 2} 文字でない`);
  }
}
