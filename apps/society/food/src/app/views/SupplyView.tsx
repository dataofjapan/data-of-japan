/**
 * 供給ビュー。総合自給率と主要品目の重量ベース自給率。
 */

import { use, useMemo, useState } from "react";
import { loadSupply } from "../data/chunks.ts";
import { listMetrics } from "../data/hierarchy.ts";
import { NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { YEAR_FROM, YEAR_TO } from "../../lib/data/labels.ts";

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => ({
    year: YEAR_FROM + i,
    value: byYear.get(YEAR_FROM + i) ?? null,
  }));
}

export function SupplyView() {
  const { metrics, cube, years } = use(loadSupply());
  const selectable = useMemo(() => listMetrics(metrics), [metrics]);
  const defaultMetric =
    selectable.find((m) => m.code === "calorie_ssr")?.code ?? selectable[0]!.code;

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
        values: cube.series("rate", "year", { metric: c.code }),
      })),
    [selectable, cube],
  );

  const panels = useMemo((): Panel[] => {
    const rates = cube.series("rate", "year", { metric });
    return [
      {
        key: "rate",
        title: "自給率",
        unit: current.parent === "総合" ? "総合・国産率" : "重量ベース",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "rate",
            label: "",
            points: dense(years, rates),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, metric, years, current.parent]);

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
          上段が総合・国産率、下段が品目別（重量ベース）。飼料自給率は含まない。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? YEAR_TO}年度
            </p>
          </div>
        </header>

        <div ref={ref} className="min-h-[280px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[YEAR_FROM, YEAR_TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <section className="mt-6 border-t border-rule pt-4">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">注記</h2>
          <dl className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {NOTES.filter((n) => n.term === "自給率" || n.term === "出典").map((n) => (
              <div key={n.term}>
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
