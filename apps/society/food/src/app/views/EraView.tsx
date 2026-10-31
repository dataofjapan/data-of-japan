/**
 * 時代ビュー。主要品目の1人当たり供給（kg・kcal）の長期推移。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { listItems } from "../data/hierarchy.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { YEAR_FROM, YEAR_TO } from "../../lib/data/labels.ts";

const kgFmt = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const kcalFmt = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => ({
    year: YEAR_FROM + i,
    value: byYear.get(YEAR_FROM + i) ?? null,
  }));
}

export function EraView() {
  const { items, cube, years } = use(loadEra());
  const selectable = useMemo(() => listItems(items), [items]);
  const defaultItem = selectable.find((m) => m.code === "rice")?.code ?? selectable[0]!.code;

  const [item, setItem] = useUrlState<string>("item", defaultItem, (v) =>
    selectable.some((c) => c.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = selectable.find((c) => c.code === item)!;

  const rows = useMemo(
    () =>
      selectable.map((c) => ({
        type: c,
        values: cube.series("kg", "year", { item: c.code }),
      })),
    [selectable, cube],
  );

  const panels = useMemo((): Panel[] => {
    const at = (measure: string) => cube.series(measure, "year", { item });
    return [
      {
        key: "kg",
        title: "供給純食料",
        unit: "kg/人・年",
        format: (v) => `${kgFmt.format(v)} kg`,
        formatTick: (v) => kgFmt.format(v),
        series: [
          {
            key: "kg",
            label: "",
            points: dense(years, at("kg")),
            emphasized: true,
          },
        ],
      },
      {
        key: "kcal",
        title: "供給熱量",
        unit: "kcal/人・日",
        format: (v) => `${kcalFmt.format(v)} kcal`,
        formatTick: (v) => kcalFmt.format(v),
        series: [
          {
            key: "kcal",
            label: "",
            points: dense(years, at("kcal")),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, item, years]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          品目
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={item} onSelect={setItem} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          折れ線は供給純食料（kg）の推移。高さは項目ごとに正規化してある。
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

        <div ref={ref} className="min-h-[420px]">
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
