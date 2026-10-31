/**
 * 目的別のストリーム。厚さは人数、上下の中央を軸にする（d3 の silhouette）。
 * 合計の線は重ねない。3つの目的が合計そのもの。
 */

import { useRef, type PointerEvent } from "react";
import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX, stack, stackOffsetSilhouette } from "d3-shape";

const M = { left: 16, right: 72, top: 24, bottom: 26 };
const PLOT_H = 168;

export interface StreamLayer {
  key: string;
  label: string;
  values: (number | null)[];
  /** Tailwind の fill クラス。 */
  fill: string;
}

function xTicks(domain: [number, number]): number[] {
  const [from, to] = domain;
  const step = to - from <= 20 ? 5 : 10;
  const start = Math.ceil(from / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= to; t += step) ticks.push(t);
  if (ticks[0] !== from) ticks.unshift(from);
  if (ticks.at(-1) !== to) ticks.push(to);
  return ticks;
}

export function PurposeStream({
  years,
  layers,
  width,
  hoverYear,
  onHoverYear,
  format,
}: {
  years: number[];
  layers: StreamLayer[];
  width: number;
  hoverYear: number | null;
  onHoverYear: (year: number | null) => void;
  format: (value: number) => string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const domain: [number, number] = [years[0]!, years.at(-1)!];
  const rows = years.map((year, i) => {
    const row: { year: number } & Record<string, number> = { year };
    for (const layer of layers) row[layer.key] = layer.values[i] ?? 0;
    return row;
  });
  const stacked = stack<typeof rows[number]>()
    .keys(layers.map((l) => l.key))
    .offset(stackOffsetSilhouette)(rows);

  const lo = Math.min(...stacked.flatMap((s) => s.map((p) => p[0])));
  const hi = Math.max(...stacked.flatMap((s) => s.map((p) => p[1])));
  const height = M.top + PLOT_H + M.bottom;
  const x = scaleLinear().domain(domain).range([M.left, width - M.right]);
  const y = scaleLinear().domain([lo, hi]).range([M.top + PLOT_H, M.top]);
  const areaPath = area<(typeof stacked)[number][number]>()
    .x((d) => x(d.data.year))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(curveMonotoneX);

  const readYear = hoverYear ?? years.at(-1)!;
  const readIndex = Math.max(0, years.indexOf(readYear));

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect === undefined) return;
    const year = Math.round(x.invert(e.clientX - rect.left));
    onHoverYear(Math.min(domain[1], Math.max(domain[0], year)));
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="block touch-none select-none"
      onPointerMove={onMove}
      onPointerLeave={() => onHoverYear(null)}
    >
      <text x={M.left} y={15} className="fill-ink text-[13px] font-semibold">
        延べ旅行者数
        <tspan className="fill-faint font-normal"> 人・目的の内訳</tspan>
      </text>
      <text x={width - M.right} y={15} textAnchor="end" className="tnum fill-ink text-[13px] font-semibold">
        {layers.map((layer, i) => (
          <tspan key={layer.key} dx={i === 0 ? 0 : 12}>
            <tspan className="fill-muted text-[11px] font-normal">{layer.label} </tspan>
            {format(layer.values[readIndex] ?? 0)}
          </tspan>
        ))}
      </text>

      <line
        x1={M.left}
        x2={width - M.right}
        y1={y(0)}
        y2={y(0)}
        className="stroke-rule"
        strokeWidth={1}
      />

      {stacked.map((series) => {
        const layer = layers.find((l) => l.key === series.key)!;
        return <path key={series.key} d={areaPath(series) ?? undefined} className={layer.fill} />;
      })}
      {stacked.map((series) => {
        const layer = layers.find((l) => l.key === series.key)!;
        const last = series.at(-1)!;
        return (
          <text
            key={series.key}
            x={x(last.data.year) + 6}
            y={(y(last[0]) + y(last[1])) / 2 + 3}
            className="fill-muted text-[10px] font-medium"
          >
            {layer.label}
          </text>
        );
      })}

      {hoverYear !== null && (
        <line
          x1={x(hoverYear)}
          x2={x(hoverYear)}
          y1={M.top}
          y2={M.top + PLOT_H}
          className="stroke-ink/35"
          strokeWidth={1}
        />
      )}

      <g transform={`translate(0, ${height - M.bottom})`}>
        <line x1={M.left} x2={width - M.right} className="stroke-rule-strong" strokeWidth={1} />
        {xTicks(domain).map((t) => (
          <text key={t} x={x(t)} y={16} textAnchor="middle" className="tnum fill-muted text-[10px]">
            {t}
          </text>
        ))}
        {hoverYear !== null && (
          <g className="pointer-events-none">
            <rect x={x(hoverYear) - 20} y={3} width={40} height={17} rx={3} className="fill-ink" />
            <text x={x(hoverYear)} y={16} textAnchor="middle" className="tnum fill-paper text-[10px] font-medium">
              {hoverYear}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}
