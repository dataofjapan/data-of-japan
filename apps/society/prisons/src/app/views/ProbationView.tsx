/**
 * 保護ビュー。仮釈放と執行猶予の保護観察。
 */

import { use, useMemo, useState } from "react";
import { loadProbation } from "../data/chunks.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { ERA_TO, PROBATION_FROM, PROBATION_METRICS } from "../../lib/data/labels.ts";

const int = new Intl.NumberFormat("ja-JP");
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: ERA_TO - PROBATION_FROM + 1 }, (_, i) => ({
    year: PROBATION_FROM + i,
    value: byYear.get(PROBATION_FROM + i) ?? null,
  }));
}

function metricKind(code: string): "persons" | "rate" {
  const def = PROBATION_METRICS.find((m) => m.code === code);
  return def?.kind === "rate" ? "rate" : "persons";
}

export function ProbationView() {
  const { metrics, cube, years } = use(loadProbation());
  const defaultMetric =
    metrics.find((m) => m.code === "parole")?.code ?? metrics[0]!.code;

  const [metric, setMetric] = useUrlState<string>("metric", defaultMetric, (v) =>
    metrics.some((c) => c.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = metrics.find((c) => c.code === metric)!;
  const kind = metricKind(metric);

  const rows = useMemo(
    () =>
      metrics.map((c) => {
        const k = metricKind(c.code);
        return {
          type: c,
          values: cube.series(k === "persons" ? "persons" : "rate", "year", { metric: c.code }),
        };
      }),
    [metrics, cube],
  );

  const panels = useMemo((): Panel[] => {
    if (kind === "persons") {
      return [
        {
          key: "persons",
          title: current.label,
          unit: "人",
          format: (v) => `${int.format(Math.round(v))}人`,
          formatTick: (v) =>
            v >= 10_000 ? `${int.format(Math.round(v / 10_000))}万` : int.format(Math.round(v)),
          series: [
            {
              key: "persons",
              label: "",
              points: dense(years, cube.series("persons", "year", { metric })),
              emphasized: true,
            },
          ],
        },
      ];
    }

    return [
      {
        key: "rate",
        title: current.label,
        unit: "％",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "rate",
            label: "",
            points: dense(years, cube.series("rate", "year", { metric })),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, metric, years, kind, current.label]);

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
          少年の保護観察は別コンテンツ。執行猶予の保護観察率は1957年から。2016年以降は一部執行猶予を含む。
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
              domain={[PROBATION_FROM, ERA_TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          仮釈放で出た人は保護観察に付く。全部執行猶予のうち保護観察が付く割合は、近年は1割を切っている。
        </p>
      </main>
    </div>
  );
}
