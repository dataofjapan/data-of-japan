/**
 * 属性ビュー。年齢×性の就業率・失業率・非正規比率。
 */

import { use, useMemo, useState } from "react";
import { loadAttrs, type Sex } from "../data/chunks.ts";
import { AgeList } from "../components/AgeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const SEXES = [
  { value: "total", label: "総数" },
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const satisfies readonly { value: Sex; label: string }[];

const FROM = 1953;
const TO = 2025;

const SUMMARY = new Set(["00", "27", "18"]);

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: TO - FROM + 1 }, (_, i) => ({
    year: FROM + i,
    value: byYear.get(FROM + i) ?? null,
  }));
}

export function AttrsView() {
  const { ages, cube, years } = use(loadAttrs());
  const yearLabels = useMemo(
    () => [...years].map(String).reverse(),
    [years],
  );

  const [age, setAge] = useUrlState<string>("age", "00", (v) => ages.some((a) => a.code === v));
  const [sex, setSex] = useUrlState<Sex>("sex", "female", (v) =>
    SEXES.some((s) => s.value === v),
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
        empRate: cube.at("empRate", { age: a.code, sex, year: snapYear }),
        group: SUMMARY.has(a.code) ? ("summary" as const) : ("band" as const),
      })),
    [ages, cube, sex, snapYear],
  );

  const panels = useMemo((): Panel[] => {
    const series = (measure: string) =>
      cube.series(measure, "year", { age, sex });

    const panels: Panel[] = [
      {
        key: "emp",
        title: "就業率",
        unit: "%",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
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
      {
        key: "nr",
        title: "非正規比率",
        unit: "役員を除く雇用者に占める割合（2013年〜）",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "nr",
            label: "",
            points: dense(years, series("nonregularShare")),
            emphasized: true,
          },
        ],
      },
    ];
    return panels;
  }, [cube, age, sex, years]);

  const empNow = cube.at("empRate", { age, sex, year: snapYear });
  const nrNow = cube.at("nonregularShare", { age, sex, year: snapYear });
  const regNow = cube.at("regular", { age, sex, year: snapYear });
  const nonregNow = cube.at("nonregular", { age, sex, year: snapYear });

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">
            年齢階級（就業率）
          </h2>
          <YearSelect years={yearLabels} value={snapYear} onChange={setSnapYear} />
        </div>
        <AgeList rows={ageRows} selected={age} onSelect={setAge} />
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          バーは選択年の就業率。上段は合算（15歳以上・15–64・65歳以上）。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-[19px] font-semibold tracking-tight">
                {current.label}
              </h1>
              <p
                className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
              >
                {hoverYear ?? TO}年
              </p>
            </div>
            <p className="mt-1 tnum text-[12px] text-muted">
              {snapYear}年スナップ
              {empNow !== null && <> · 就業率 {pct.format(empNow * 100)}%</>}
              {nrNow !== null && <> · 非正規 {pct.format(nrNow * 100)}%</>}
              {regNow !== null && nonregNow !== null && (
                <>
                  {" "}
                  · 正規 {one.format(regNow)} / 非正規 {one.format(nonregNow)} 万人
                </>
              )}
            </p>
          </div>
          <Segmented options={SEXES} value={sex} onChange={setSex} label="性別" />
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

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          女性の就業と65歳以上の就業率の長期上昇、若年・高齢での非正規比率の高さが読み取れる。就業率は1968年〜、非正規比率は2013年〜。
        </p>
      </main>
    </div>
  );
}
