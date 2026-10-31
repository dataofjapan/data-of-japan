/**
 * 時代ビュー。年齢階級ごとの就業率・労働力人口比率の長期推移。
 */

import { use, useMemo, useState } from "react";
import { loadRates, type Sex } from "../data/chunks.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { isSummaryAge } from "../data/hierarchy.ts";
import { DEFAULT_AGE, SEX_OPTIONS } from "../../lib/data/labels.ts";
import { TypeList } from "../components/TypeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const FROM = 1953;
const TO = 2025;

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

export function EraView() {
  const { ages, cube, years } = use(loadRates());

  const [age, setAge] = useUrlState<string>("age", DEFAULT_AGE, (v) =>
    ages.some((a) => a.code === v),
  );
  const [sex, setSex] = useUrlState<Sex>("sex", "total", (v) =>
    SEX_OPTIONS.some((s) => s.value === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = ages.find((a) => a.code === age)!;

  const rows = useMemo(
    () =>
      ages.map((a) => ({
        type: {
          ...a,
          parent: isSummaryAge(a.code) ? "summary" : "band",
        },
        values: cube.series("empRate", "year", { age: a.code, sex }),
      })),
    [ages, cube, sex],
  );

  const panels = useMemo((): Panel[] => {
    const series = (measure: string) => cube.series(measure, "year", { age, sex });
    return [
      {
        key: "emp",
        title: "就業率",
        unit: "%",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        coverage: "1968年〜",
        series: [
          {
            key: "emp",
            label: "",
            points: dense(years, series("empRate")),
            emphasized: true,
          },
        ],
      },
      {
        key: "lfpr",
        title: "労働力人口比率",
        unit: "%",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "lfpr",
            label: "",
            points: dense(years, series("lfpr")),
            emphasized: true,
          },
        ],
      },
      {
        key: "unemp",
        title: "完全失業率",
        unit: "%",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "unemp",
            label: "",
            points: dense(years, series("unempRate")),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, age, sex, years]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          年齢階級
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={age} onSelect={setAge} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          スパークは就業率の推移。高さは項目ごとに正規化。上段は合算階級。
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
          <Segmented options={[...SEX_OPTIONS]} value={sex} onChange={setSex} label="性別" />
        </header>

        <div ref={ref} className="min-h-[480px]">
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
