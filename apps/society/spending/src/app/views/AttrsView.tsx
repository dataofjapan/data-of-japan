/**
 * 属性ビュー。世帯主年齢×費目の支出と構成比。
 */

import { use, useMemo, useState } from "react";
import { loadAttrs } from "../data/chunks.ts";
import { AgeList } from "../components/AgeList.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { ATTRS_YEAR_FROM, YEAR_TO } from "../../lib/data/labels.ts";

const yenFmt = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: YEAR_TO - ATTRS_YEAR_FROM + 1 }, (_, i) => ({
    year: ATTRS_YEAR_FROM + i,
    value: byYear.get(ATTRS_YEAR_FROM + i) ?? null,
  }));
}

export function AttrsView() {
  const { ages, items, cube, years } = use(loadAttrs());
  const yearLabels = useMemo(() => [...years].map(String).reverse(), [years]);

  const [age, setAge] = useUrlState<string>("age", "avg", (v) =>
    ages.some((a) => a.code === v),
  );
  const [item, setItem] = useUrlState<string>(
    "item",
    items.find((i) => i.code === "education")?.code ?? items[0]!.code,
    (v) => items.some((i) => i.code === v),
  );
  const [snapYear, setSnapYear] = useUrlState(
    "year",
    String(years.at(-1)!),
    (v) => years.includes(Number(v)),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const currentAge = ages.find((a) => a.code === age)!;
  const currentItem = items.find((i) => i.code === item)!;

  const ageRows = useMemo(
    () =>
      ages.map((a) => ({
        code: a.code,
        label: a.label,
        share: cube.at("share", { age: a.code, item, year: snapYear }),
        group: (a.parent === "summary" ? "summary" : "band") as "summary" | "band",
      })),
    [ages, cube, item, snapYear],
  );

  const panels = useMemo((): Panel[] => {
    const series = (measure: string) =>
      cube.series(measure, "year", { age, item });

    return [
      {
        key: "yen",
        title: "月平均支出",
        unit: "円/月",
        format: (v) => `${yenFmt.format(v)} 円`,
        formatTick: (v) => yenFmt.format(v),
        series: [
          {
            key: "yen",
            label: "",
            points: dense(years, series("yen")),
            emphasized: true,
          },
        ],
      },
      {
        key: "share",
        title: "消費支出に占める割合",
        unit: "%",
        format: (v) => `${pctFmt.format(v * 100)}%`,
        formatTick: (v) => `${pctFmt.format(v * 100)}%`,
        series: [
          {
            key: "share",
            label: "",
            points: dense(years, series("share")),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, age, item, years]);

  const yenNow = cube.at("yen", { age, item, year: snapYear });
  const shareNow = cube.at("share", { age, item, year: snapYear });

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">
            世帯主の年齢
          </h2>
          <YearSelect years={yearLabels} value={snapYear} onChange={setSnapYear} />
        </div>
        <AgeList rows={ageRows} selected={age} onSelect={setAge} />
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          バーは選択年・選択費目の構成比。上段は平均と高齢合算。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-[19px] font-semibold tracking-tight">
                {currentAge.label}
                <span className="ml-2 text-[15px] font-medium text-muted">
                  {currentItem.label}
                </span>
              </h1>
              <p
                className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
              >
                {hoverYear ?? YEAR_TO}年
              </p>
            </div>
            <p className="mt-1 tnum text-[12px] text-muted">
              {snapYear}年スナップ
              {yenNow !== null && <> · {yenFmt.format(yenNow)} 円</>}
              {shareNow !== null && <> · {pctFmt.format(shareNow * 100)}%</>}
            </p>
          </div>
        </header>

        <div
          role="radiogroup"
          aria-label="費目"
          className="mb-4 flex flex-wrap gap-1"
        >
          {items.map((i) => {
            const selected = i.code === item;
            return (
              <button
                key={i.code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setItem(i.code)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[12px] transition-colors duration-150 ${
                  selected
                    ? "bg-ink/[0.08] font-semibold text-ink"
                    : "text-muted hover:bg-ink/[0.04] hover:text-ink"
                }`}
              >
                {i.label}
              </button>
            );
          })}
        </div>

        <div ref={ref} className="min-h-[420px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[ATTRS_YEAR_FROM, YEAR_TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          教育は子育て世代で大きく、保健医療は高齢層で相対的に重い。二人以上世帯・2000年以降。
        </p>
      </main>
    </div>
  );
}
