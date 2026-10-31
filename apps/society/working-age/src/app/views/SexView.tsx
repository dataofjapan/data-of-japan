/**
 * 性ビュー。男女の就業率推移を年齢別に比較。
 */

import { use, useMemo, useState } from "react";
import { loadRates } from "../data/chunks.ts";
import { isSummaryAge } from "../data/hierarchy.ts";
import { DEFAULT_AGE } from "../../lib/data/labels.ts";
import { AgeList } from "../components/AgeList.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
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

export function SexView() {
  const { ages, cube, years } = use(loadRates());
  const yearLabels = useMemo(() => [...years].map(String).reverse(), [years]);

  const [age, setAge] = useUrlState<string>("age", DEFAULT_AGE, (v) =>
    ages.some((a) => a.code === v),
  );
  const [snapYear, setSnapYear] = useUrlState(
    "year",
    String(years.at(-1)!),
    (v) => years.includes(Number(v)),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = ages.find((a) => a.code === age)!;

  const ageRows = useMemo(
    () =>
      ages.map((a) => ({
        code: a.code,
        label: a.label,
        empRate: cube.at("empRate", { age: a.code, sex: "total", year: snapYear }),
        group: isSummaryAge(a.code) ? ("summary" as const) : ("band" as const),
      })),
    [ages, cube, snapYear],
  );

  const panels = useMemo((): Panel[] => {
    const fmt = (v: number) => `${pct.format(v * 100)}%`;
    return [
      {
        key: "emp-male",
        title: "就業率 · 男",
        unit: "%",
        format: fmt,
        formatTick: fmt,
        coverage: "1968年〜",
        series: [
          {
            key: "male",
            label: "",
            points: dense(years, cube.series("empRate", "year", { age, sex: "male" })),
            emphasized: true,
          },
          {
            key: "female-ref",
            label: "女",
            points: dense(
              years,
              cube.series("empRate", "year", { age, sex: "female" }),
            ),
            emphasized: false,
          },
        ],
      },
      {
        key: "emp-female",
        title: "就業率 · 女",
        unit: "%",
        format: fmt,
        formatTick: fmt,
        series: [
          {
            key: "female",
            label: "",
            points: dense(
              years,
              cube.series("empRate", "year", { age, sex: "female" }),
            ),
            emphasized: true,
          },
          {
            key: "male-ref",
            label: "男",
            points: dense(years, cube.series("empRate", "year", { age, sex: "male" })),
            emphasized: false,
          },
        ],
      },
      {
        key: "lfpr",
        title: "労働力人口比率 · 男 / 女",
        unit: "%",
        format: fmt,
        formatTick: fmt,
        series: [
          {
            key: "male",
            label: "男",
            points: dense(years, cube.series("lfpr", "year", { age, sex: "male" })),
            emphasized: true,
          },
          {
            key: "female",
            label: "女",
            points: dense(
              years,
              cube.series("lfpr", "year", { age, sex: "female" }),
            ),
            emphasized: false,
          },
        ],
      },
    ];
  }, [cube, age, years]);

  const maleNow = cube.at("empRate", { age, sex: "male", year: snapYear });
  const femaleNow = cube.at("empRate", { age, sex: "female", year: snapYear });
  const gap =
    maleNow !== null && femaleNow !== null ? maleNow - femaleNow : null;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">
            年齢階級（就業率・総数）
          </h2>
          <YearSelect years={yearLabels} value={snapYear} onChange={setSnapYear} />
        </div>
        <AgeList rows={ageRows} selected={age} onSelect={setAge} />
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          バーは選択年・総数の就業率。折れ線は男女の長期推移。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="pb-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? TO}年
            </p>
          </div>
          <p className="mt-1 tnum text-[12px] text-muted">
            {snapYear}年スナップ
            {maleNow !== null && <> · 男 {pct.format(maleNow * 100)}%</>}
            {femaleNow !== null && <> · 女 {pct.format(femaleNow * 100)}%</>}
            {gap !== null && <> · 差 {pct.format(gap * 100)}pt</>}
          </p>
        </header>

        <div ref={ref} className="min-h-[420px]">
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

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          男性の高齢就業と、女性の就業率上昇が年齢帯ごとにどう重なるかを見る。
          就業率は1968年〜。
        </p>
      </main>
    </div>
  );
}
