/**
 * 時代ビュー。国内移動と三大都市圏の長期推移。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { listMetrics } from "../data/hierarchy.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { ERA_FROM, ERA_TO } from "../../lib/data/labels.ts";

const int = new Intl.NumberFormat("ja-JP");

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: ERA_TO - ERA_FROM + 1 }, (_, i) => ({
    year: ERA_FROM + i,
    value: byYear.get(ERA_FROM + i) ?? null,
  }));
}

function formatPeople(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 10_000) return `${sign}${int.format(Math.round(abs / 10_000))}万人`;
  return `${sign}${int.format(Math.round(abs))}人`;
}

function formatTick(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 10_000) return `${sign}${int.format(Math.round(abs / 10_000))}万`;
  return `${sign}${int.format(Math.round(abs))}`;
}

export function EraView() {
  const { metrics, cube, years } = use(loadEra());
  const selectable = useMemo(() => listMetrics(metrics), [metrics]);
  const defaultMetric =
    selectable.find((m) => m.code === "tokyo_net")?.code ?? selectable[0]!.code;

  const [metric, setMetric] = useUrlState<string>("metric", defaultMetric, (v) =>
    selectable.some((c) => c.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = selectable.find((c) => c.code === metric)!;

  const rows = useMemo(
    () =>
      selectable.map((c) => ({
        type: c,
        values: cube.series("people", "year", { metric: c.code }),
      })),
    [selectable, cube],
  );

  const panels = useMemo((): Panel[] => {
    const at = cube.series("people", "year", { metric });
    const signed = metric.endsWith("_net");
    return [
      {
        key: "people",
        title: current.label,
        unit: "人",
        format: formatPeople,
        formatTick,
        series: [
          {
            key: "people",
            label: "",
            points: dense(years, at),
            emphasized: true,
          },
        ],
        coverage: signed ? "転入超過は正、転出超過は負" : undefined,
      },
    ];
  }, [cube, metric, years, current.label]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          指標
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={metric} onSelect={setMetric} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          1954年以降の日本人移動者。東京圏の転入超過が物語の主線。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? ERA_TO}年
            </p>
          </div>
        </header>

        <div ref={ref} className="min-h-[280px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[ERA_FROM, ERA_TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <section className="mt-6 border-t border-rule pt-4">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">注記</h2>
          <dl className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              ...MARKS.map((m) => ({
                key: String(m.year),
                term: `${m.year}年 · ${m.label}`,
                detail: m.detail,
              })),
              ...NOTES.map((n) => ({
                key: n.term,
                term: n.term,
                detail: n.detail,
              })),
            ].map((n) => (
              <div key={n.key}>
                <dt className="tnum text-[12px] font-semibold">{n.term}</dt>
                <dd className="text-[11.5px] leading-relaxed text-muted">{n.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
