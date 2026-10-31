/**
 * 時代ビュー。婚姻・離婚・初婚年齢・再婚割合・同居期間の長期推移。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { listMetrics, unitOf } from "../data/hierarchy.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const FROM = 1899;
const TO = 2024;

const int = new Intl.NumberFormat("ja-JP");
const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const two = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: TO - FROM + 1 }, (_, i) => ({
    year: FROM + i,
    value: byYear.get(FROM + i) ?? null,
  }));
}

function formatValue(code: string, v: number): string {
  switch (unitOf(code)) {
    case "count":
      return int.format(Math.round(v));
    case "per_mille":
      return `${one.format(v)}‰`;
    case "years":
      return `${two.format(v)}年`;
    case "share":
      return `${pct.format(v * 100)}%`;
  }
}

function formatTick(code: string, v: number): string {
  switch (unitOf(code)) {
    case "count":
      return v >= 10_000 ? `${int.format(Math.round(v / 10_000))}万` : int.format(v);
    case "per_mille":
      return one.format(v);
    case "years":
      return one.format(v);
    case "share":
      return `${pct.format(v * 100)}%`;
  }
}

function panelTitle(code: string): { title: string; unit: string } {
  switch (unitOf(code)) {
    case "count":
      return { title: "件数", unit: "件" };
    case "per_mille":
      return { title: "人口千対", unit: "‰" };
    case "years":
      return { title: "年", unit: "年" };
    case "share":
      return { title: "割合", unit: "%" };
  }
}

export function EraView() {
  const { metrics, cube, years } = use(loadEra());
  const selectable = useMemo(() => listMetrics(metrics), [metrics]);
  const defaultMetric =
    selectable.find((m) => m.code === "marriage_rate")?.code ?? selectable[0]!.code;

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
        values: cube.series("value", "year", { metric: c.code }),
      })),
    [selectable, cube],
  );

  const panels = useMemo((): Panel[] => {
    const series = cube.series("value", "year", { metric });
    const meta = panelTitle(metric);
    return [
      {
        key: "value",
        title: meta.title,
        unit: meta.unit,
        format: (v) => formatValue(metric, v),
        formatTick: (v) => formatTick(metric, v),
        series: [
          {
            key: "value",
            label: "",
            points: dense(years, series),
            emphasized: true,
            markSparseSamples: true,
          },
        ],
      },
    ];
  }, [cube, metric, years]);

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
          折れ線は指標の推移。高さは項目ごとに正規化してある。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? TO}年
            </p>
          </div>
        </header>

        <div ref={ref} className="min-h-[220px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[FROM, TO]}
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
