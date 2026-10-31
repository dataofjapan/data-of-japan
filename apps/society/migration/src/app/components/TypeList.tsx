/**
 * 家族類型の一覧。項目ごとにスパークラインを添えて、選ぶ前に形が見えるようにする。
 * 高さは行ごとに正規化するので、項目間の大小は比べられない。
 * 転入超過のように負値がある系列は 0 を中央に置く。
 */

import { line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import type { DictEntry } from "../data/cube.ts";

const W = 68;
const H = 20;

export interface TypeRow {
  type: DictEntry;
  values: (number | null)[];
}

export function TypeList({
  rows,
  years,
  selected,
  onSelect,
}: {
  rows: TypeRow[];
  years: number[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  const x = scaleLinear()
    .domain([years[0]!, years.at(-1)!])
    .range([1, W - 1]);

  return (
    <ul className="flex flex-col">
      {rows.map(({ type, values }) => {
        const nums = values.filter((v): v is number => v !== null);
        const lo = Math.min(0, ...nums, 0);
        const hi = Math.max(0, ...nums, 0);
        const pad = lo < 0 ? Math.max(-lo, hi) || 1 : hi || 1;
        const y = scaleLinear()
          .domain(lo < 0 ? [-pad, pad] : [0, pad])
          .range([H - 2, 2]);
        const path = line<number | null>()
          .defined((v) => v !== null)
          .x((_, i) => x(years[i]!))
          .y((v) => y(v!));
        const isSelected = type.code === selected;
        const zeroY = lo < 0 ? y(0) : null;

        return (
          <li key={type.code}>
            <button
              type="button"
              onClick={() => onSelect(type.code)}
              aria-pressed={isSelected}
              className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1 text-left transition-colors duration-150 ${
                isSelected ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
              }`}
            >
              <span
                className={`flex-1 truncate text-[12px] leading-tight ${
                  isSelected ? "font-semibold text-ink" : "text-muted"
                }`}
                title={type.label}
              >
                {type.label}
              </span>
              <svg width={W} height={H} className="shrink-0" aria-hidden>
                {zeroY !== null && (
                  <line
                    x1={1}
                    x2={W - 1}
                    y1={zeroY}
                    y2={zeroY}
                    className="stroke-rule"
                    strokeWidth={1}
                  />
                )}
                <path
                  d={path(values) ?? undefined}
                  fill="none"
                  className={isSelected ? "stroke-accent" : "stroke-faint"}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
