/**
 * 年齢階級の就業率プロファイル（横棒）。
 */

import { scaleBand, scaleLinear } from "d3-scale";

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export interface ProfileRow {
  code: string;
  label: string;
  value: number | null;
  /** 比較年など。淡色で重ねる。 */
  compare?: number | null;
}

const M = { left: 72, right: 52, top: 8, bottom: 28 };

export function AgeProfile({
  rows,
  width,
  height = 420,
  compareLabel,
}: {
  rows: ProfileRow[];
  width: number;
  height?: number;
  compareLabel?: string;
}) {
  const innerH = height - M.top - M.bottom;
  const y = scaleBand()
    .domain(rows.map((r) => r.code))
    .range([M.top, M.top + innerH])
    .padding(0.22);
  const max = Math.max(
    ...rows.flatMap((r) => [r.value ?? 0, r.compare ?? 0]),
    0.01,
  );
  const nice = Math.min(1, Math.ceil(max * 10) / 10);
  const x = scaleLinear()
    .domain([0, nice])
    .range([M.left, width - M.right]);

  const ticks = [0, nice / 2, nice];

  return (
    <svg width={width} height={height} className="block select-none">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={M.top}
            y2={M.top + innerH}
            className="stroke-rule"
            strokeWidth={1}
          />
          <text
            x={x(t)}
            y={height - 8}
            textAnchor="middle"
            className="tnum fill-faint text-[10px]"
          >
            {`${pct.format(t * 100)}%`}
          </text>
        </g>
      ))}

      {rows.map((row) => {
        const cy = y(row.code)!;
        const bh = y.bandwidth();
        return (
          <g key={row.code}>
            <text
              x={M.left - 8}
              y={cy + bh / 2 + 3.5}
              textAnchor="end"
              className="fill-muted text-[11px]"
            >
              {row.label}
            </text>
            {row.compare !== null && row.compare !== undefined && (
              <rect
                x={M.left}
                y={cy}
                width={Math.max(0, x(row.compare) - M.left)}
                height={bh}
                className="fill-ink/15"
              />
            )}
            {row.value !== null && (
              <rect
                x={M.left}
                y={cy + (row.compare != null ? bh * 0.15 : 0)}
                width={Math.max(0, x(row.value) - M.left)}
                height={row.compare != null ? bh * 0.7 : bh}
                className="fill-accent"
              />
            )}
            <text
              x={row.value === null ? M.left + 4 : x(row.value) + 6}
              y={cy + bh / 2 + 3.5}
              className="tnum fill-ink text-[11px] font-medium"
            >
              {row.value === null ? "—" : `${pct.format(row.value * 100)}%`}
            </text>
          </g>
        );
      })}

      {compareLabel !== undefined && (
        <text x={M.left} y={14} className="fill-faint text-[10px]">
          淡色: {compareLabel}
        </text>
      )}
    </svg>
  );
}
