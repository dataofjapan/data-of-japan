/**
 * 年齢・初再婚ビュー。年齢5歳階級 × 初婚/再婚 × 夫/妻。
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
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const SEX_OPTS = [
  { value: "husband", label: "夫" },
  { value: "wife", label: "妻" },
] as const;

const MEASURE_OPTS = [
  { value: "count", label: "件数" },
  { value: "rate", label: "率" },
] as const;

type Sex = (typeof SEX_OPTS)[number]["value"];
type Measure = (typeof MEASURE_OPTS)[number]["value"];

const sum = (xs: (number | null)[]) => xs.reduce<number>((n, v) => n + (v ?? 0), 0);

function yearPoints(yearsAsc: number[], values: (number | null)[]): Point[] {
  return yearsAsc.map((year, i) => ({ year, value: values[i] ?? null }));
}

export function AgeView() {
  const { ages, types, cube, years } = use(loadAge());
  const yearsAsc = useMemo(() => [...years].map(Number).sort((a, b) => a - b), [years]);
  const domain: [number, number] = [yearsAsc[0]!, yearsAsc.at(-1)!];

  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));
  const [sex, setSex] = useUrlState<Sex>("sex", "wife", (v) =>
    SEX_OPTS.some((s) => s.value === v),
  );
  const [measure, setMeasure] = useUrlState<Measure>("measure", "count", (v) =>
    MEASURE_OPTS.some((m) => m.value === v),
  );
  const [age, setAge] = useUrlState<string>("age", ALL, (v) =>
    v === ALL || ages.some((a) => a.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const firstByAge = cube.series(measure, "age", { sex, type: "first", year });
  const remByAge = cube.series(measure, "age", { sex, type: "remarriage", year });

  const ageRows = useMemo((): AgeRow[] => {
    // 左リストは常に件数で規模感を出す
    const countFirst = cube.series("count", "age", { sex, type: "first", year });
    const countRem = cube.series("count", "age", { sex, type: "remarriage", year });
    const countBands = ages.map((a, i) => ({
      code: a.code,
      label: a.label,
      count: Math.round((countFirst[i] ?? 0) + (countRem[i] ?? 0)),
    }));
    return [
      { code: ALL, label: "全年齢", count: sum(countBands.map((b) => b.count)) },
      ...countBands,
    ];
  }, [ages, cube, sex, year]);

  const ageIndex = age === ALL ? null : ages.findIndex((a) => a.code === age);
  const label = ageIndex === null ? "全年齢" : ages[ageIndex]!.label;

  const firstNow = ageIndex === null ? sum(firstByAge) : (firstByAge[ageIndex] ?? 0);
  const remNow = ageIndex === null ? sum(remByAge) : (remByAge[ageIndex] ?? 0);
  const totalNow = firstNow + remNow;

  const panels = useMemo((): Panel[] => {
    const seriesFor = (type: "first" | "remarriage"): (number | null)[] => {
      if (ageIndex === null) {
        return yearsAsc.map((y) =>
          sum(
            ages.map((a) =>
              cube.at(measure, {
                age: a.code,
                sex,
                type,
                year: String(y),
              }),
            ),
          ),
        );
      }
      return yearsAsc.map(
        (y) =>
          cube.at(measure, {
            age: ages[ageIndex]!.code,
            sex,
            type,
            year: String(y),
          }) ?? null,
      );
    };

    const isRate = measure === "rate";
    return [
      {
        key: "trend",
        title: isRate ? "婚姻率（人口千対）" : "婚姻件数",
        unit: isRate ? "‰" : "件",
        format: (v) => (isRate ? `${one.format(v)}‰` : int.format(Math.round(v))),
        formatTick: (v) =>
          isRate
            ? one.format(v)
            : v >= 10_000
              ? `${int.format(Math.round(v / 10_000))}万`
              : int.format(v),
        series: [
          {
            key: "first",
            label: "初婚",
            points: yearPoints(yearsAsc, seriesFor("first")),
            emphasized: true,
            markSparseSamples: true,
          },
          {
            key: "remarriage",
            label: "再婚",
            points: yearPoints(yearsAsc, seriesFor("remarriage")),
            emphasized: false,
            markSparseSamples: true,
          },
        ],
      },
    ];
  }, [ageIndex, ages, cube, measure, sex, yearsAsc]);

  const sexLabel = SEX_OPTS.find((s) => s.value === sex)!.label;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          年齢階級
        </h2>
        <AgeList rows={ageRows} selected={age} onSelect={setAge} />
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          バーは初婚＋再婚の件数。率表示中でも規模感は件数のまま。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">
              {label} · {sexLabel}
            </h1>
            <p className="tnum text-[13px] text-muted">
              {measure === "rate"
                ? `初婚 ${one.format(firstNow)}‰ / 再婚 ${one.format(remNow)}‰`
                : `${int.format(Math.round(totalNow))}件（初婚 ${pct.format(totalNow === 0 ? 0 : (firstNow / totalNow) * 100)}%）`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <YearSelect years={years} value={year} onChange={setYear} />
            <Segmented options={SEX_OPTS} value={sex} onChange={setSex} label="夫妻" />
            <Segmented
              options={MEASURE_OPTS}
              value={measure}
              onChange={setMeasure}
              label="指標"
            />
          </div>
        </header>

        <p className="pb-3 text-[12.5px] text-muted">
          {types.map((t) => t.label).join(" / ")}の推移。濃い線が初婚、淡い線が再婚。
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
          結婚生活に入ったときの年齢（5歳階級）。「各届出年に結婚生活に入り届け出たもの」。
          率は人口千対。全年齢の率は各階級の単純合算のため参考値。
        </p>
      </main>
    </div>
  );
}
