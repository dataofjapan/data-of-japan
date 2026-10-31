/**
 * 母親年齢ビュー。年齢5歳階級 × 出生数/出生率。
 */

import { use, useMemo, useState } from "react";
import { loadAge } from "../data/chunks.ts";
import { AgeList, type AgeRow } from "../components/AgeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";
import { useWidth } from "../hooks/useWidth.ts";

const ALL = "all";

const int = new Intl.NumberFormat("ja-JP");
const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const MEASURE_OPTS = [
  { value: "count", label: "件数" },
  { value: "rate", label: "率" },
] as const;

type Measure = (typeof MEASURE_OPTS)[number]["value"];

const sum = (xs: (number | null)[]) => xs.reduce<number>((n, v) => n + (v ?? 0), 0);

function yearPoints(yearsAsc: number[], values: (number | null)[]): Point[] {
  return yearsAsc.map((year, i) => ({ year, value: values[i] ?? null }));
}

export function AgeView() {
  const { ages, cube, years } = use(loadAge());
  const yearsAsc = useMemo(() => [...years].map(Number).sort((a, b) => a - b), [years]);
  const domain: [number, number] = [yearsAsc[0]!, yearsAsc.at(-1)!];

  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));
  const [measure, setMeasure] = useUrlState<Measure>("measure", "count", (v) =>
    MEASURE_OPTS.some((m) => m.value === v),
  );
  const [age, setAge] = useUrlState<string>("age", ALL, (v) =>
    v === ALL || ages.some((a) => a.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const byAge = cube.series(measure, "age", { year });

  const ageRows = useMemo((): AgeRow[] => {
    const countByAge = cube.series("count", "age", { year });
    const countBands = ages.map((a, i) => ({
      code: a.code,
      label: a.label,
      count: Math.round(countByAge[i] ?? 0),
    }));
    return [
      { code: ALL, label: "全年齢", count: sum(countBands.map((b) => b.count)) },
      ...countBands,
    ];
  }, [ages, cube, year]);

  const ageIndex = age === ALL ? null : ages.findIndex((a) => a.code === age);
  const label = ageIndex === null ? "全年齢（15〜49歳）" : ages[ageIndex]!.label;

  const now =
    ageIndex === null ? sum(byAge) : (byAge[ageIndex] ?? 0);

  const panels = useMemo((): Panel[] => {
    const series: (number | null)[] =
      ageIndex === null
        ? yearsAsc.map((y) =>
            sum(
              ages.map((a) =>
                cube.at(measure, {
                  age: a.code,
                  year: String(y),
                }),
              ),
            ),
          )
        : yearsAsc.map(
            (y) =>
              cube.at(measure, {
                age: ages[ageIndex]!.code,
                year: String(y),
              }) ?? null,
          );

    const isRate = measure === "rate";
    return [
      {
        key: "trend",
        title: isRate ? "出生率（女性人口千対）" : "出生数",
        unit: isRate ? "‰" : "人",
        format: (v) => (isRate ? `${one.format(v)}‰` : int.format(Math.round(v))),
        formatTick: (v) =>
          isRate
            ? one.format(v)
            : v >= 10_000
              ? `${int.format(Math.round(v / 10_000))}万`
              : int.format(v),
        series: [
          {
            key: "value",
            label: "",
            points: yearPoints(yearsAsc, series),
            emphasized: true,
            markSparseSamples: true,
          },
        ],
      },
    ];
  }, [ageIndex, ages, cube, measure, yearsAsc]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          母親の年齢
        </h2>
        <AgeList rows={ageRows} selected={age} onSelect={setAge} />
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          バーは出生数。率表示中でも規模感は件数のまま。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{label}</h1>
            <p className="tnum text-[13px] text-muted">
              {measure === "rate"
                ? `${one.format(now)}‰`
                : `${int.format(Math.round(now))}人`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <YearSelect years={years} value={year} onChange={setYear} />
            <Segmented
              options={MEASURE_OPTS}
              value={measure}
              onChange={setMeasure}
              label="指標"
            />
          </div>
        </header>

        <p className="pb-3 text-[12.5px] text-muted">
          母の年齢5歳階級別の推移。
          {hoverYear !== null && (
            <span className="tnum text-ink"> {hoverYear}年を表示中。</span>
          )}
        </p>

        <div ref={ref} className="min-h-[220px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={domain}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <p className="mt-4 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          母の年齢（5歳階級）。率は女性人口千対。全年齢は15〜49歳の合算（率は参考値）。
          14歳以下・50歳以上・不詳は初期スコープ外。
        </p>
      </main>
    </div>
  );
}
