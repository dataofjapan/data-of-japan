/**
 * 男女ビュー。進学率の性別差。
 */

import { use, useMemo, useState } from "react";
import { loadGender } from "../data/chunks.ts";
import { listMetrics } from "../data/hierarchy.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { RATE_FROM, RATE_TO } from "../../lib/data/labels.ts";

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const signedPct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: RATE_TO - RATE_FROM + 1 }, (_, i) => ({
    year: RATE_FROM + i,
    value: byYear.get(RATE_FROM + i) ?? null,
  }));
}

export function GenderView() {
  const { metrics, cube, years } = use(loadGender());
  const selectable = useMemo(() => listMetrics(metrics), [metrics]);
  const defaultMetric =
    selectable.find((m) => m.code === "univ")?.code ?? selectable[0]!.code;

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
        values: cube.series("gap", "year", { metric: c.code, sex: "total" }),
      })),
    [selectable, cube],
  );

  const panels = useMemo((): Panel[] => {
    const male = cube.series("rate", "year", { metric, sex: "male" });
    const female = cube.series("rate", "year", { metric, sex: "female" });
    const gap = cube.series("gap", "year", { metric, sex: "total" });

    return [
      {
        key: "rate",
        title: "進学率（男女）",
        unit: "％",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "male",
            label: "男",
            points: dense(years, male),
            emphasized: false,
          },
          {
            key: "female",
            label: "女",
            points: dense(years, female),
            emphasized: true,
          },
        ],
      },
      {
        key: "gap",
        title: "差（女 − 男）",
        unit: "ポイント",
        format: (v) => `${signedPct.format(v * 100)}pt`,
        formatTick: (v) => `${signedPct.format(v * 100)}`,
        series: [
          {
            key: "gap",
            label: "",
            points: dense(years, gap),
            emphasized: true,
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
          左のスパークは男女差（女−男）の推移。プラスは女性が高い。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? RATE_TO}年
            </p>
          </div>
        </header>

        <div ref={ref} className="min-h-[420px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[RATE_FROM, RATE_TO]}
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
