/**
 * 誰がビュー。住所地（旅券の取得地）×年齢×性別の出国と、滞在期間別の帰国。
 */

import { use, useMemo, useState } from "react";
import { loadStay, loadWho } from "../data/chunks.ts";
import { AreaList } from "../components/AreaList.tsx";
import { SplitBars, SplitLegend } from "../components/SplitBars.tsx";
import { TrendStack, type Panel } from "../components/TrendStack.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const int = new Intl.NumberFormat("ja-JP");
const man = (v: number) => (v >= 10_000 ? `${int.format(Math.round(v / 10_000))}万` : int.format(v));

export function WhoView() {
  const who = use(loadWho());
  const stay = use(loadStay());
  const yearNums = useMemo(() => who.years.map(Number), [who.years]);
  const [area, setArea] = useUrlState<string>("area", "00", (v) => who.areas.some((a) => a.code === v));
  const [year, setYear] = useUrlState<string>("year", who.years.at(-1)!, (v) => who.years.includes(v));
  const [sex, setSex] = useUrlState<string>("sex", "total", (v) => who.sexes.some((s) => s.code === v));
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = who.areas.find((a) => a.code === area)!;
  const total = who.cube.at("pop", { area, sex, age: "total", year });
  const rows = useMemo(
    () =>
      who.areas.map((a) => ({
        area: a,
        values: who.cube.series("pop", "year", { area: a.code, sex, age: "total" }),
      })),
    [who, sex],
  );

  const panels = useMemo((): Panel[] => {
    const values = who.cube.series("pop", "year", { area, sex, age: "total" });
    return [
      {
        key: "pop",
        title: "出国",
        unit: "人",
        format: (v) => int.format(Math.round(v)),
        formatTick: man,
        series: [
          {
            key: "pop",
            label: "",
            points: yearNums.map((y, i) => ({ year: y, value: values[i] ?? null })),
            emphasized: true,
          },
        ],
      },
    ];
  }, [who, area, sex, yearNums]);

  const ages = who.ages.filter((a) => a.code !== "total" && a.code !== "unknown");
  const ageRows = ages.map((a) => ({
    code: a.code,
    label: a.label,
    a: who.cube.at("pop", { area, sex: "male", age: a.code, year }),
    b: who.cube.at("pop", { area, sex: "female", age: a.code, year }),
  }));

  const stayYear = stay.years.includes(year) ? year : stay.years.at(-1)!;
  const stayRows = stay.durations
    .filter((d) => d.code !== "total")
    .map((d) => ({
      code: d.code,
      label: d.label,
      a: stay.cube.at("pop", { duration: d.code, sex: "total", age: "total", year: stayYear }),
      b: null,
    }));

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">住所地</h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <AreaList rows={rows} years={yearNums} selected={area} onSelect={setArea} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          住所地は旅券を取得した場所。今住んでいる都道府県とは限らない。「外国」は海外で旅券を取った人。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">{current.label}</h2>
            <p className="pt-1 text-[12px] text-muted">
              {who.years[0]}–{who.years.at(-1)}年の出国
            </p>
          </div>
          <Segmented
            label="性別"
            value={sex}
            onChange={setSex}
            options={who.sexes.map((s) => ({ value: s.code, label: s.label }))}
          />
        </header>

        <div ref={ref}>
          {width > 0 && (
            <TrendStack
              panels={panels}
              width={width}
              domain={[yearNums[0]!, yearNums.at(-1)!]}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pb-4">
          <p className="text-[12px] text-muted">
            {year}年{" "}
            <span className="tnum font-medium text-ink">{total === null ? "—" : `${int.format(total)}人`}</span>
          </p>
          <YearSelect years={who.years} value={year} onChange={setYear} />
        </div>

        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between px-2 pb-2">
              <h3 className="text-[13px] font-semibold">
                年齢
                <span className="ml-1.5 text-[11px] font-normal text-faint">{year}年</span>
              </h3>
              <SplitLegend a="男" b="女" />
            </div>
            <SplitBars rows={ageRows} />
          </div>
          <div>
            <div className="px-2 pb-2">
              <h3 className="text-[13px] font-semibold">
                滞在期間
                <span className="ml-1.5 text-[11px] font-normal text-faint">{stayYear}年・帰国・全国</span>
              </h3>
            </div>
            <SplitBars rows={stayRows} />
            <p className="px-2 pt-2 text-[10.5px] leading-relaxed text-faint">
              戻ってきた人の、外国にいた長さ。区分は重ならず、合計が帰国の総数になる。「10日以内」は「5日以内」の次の区分。出国の内訳ではなく、住所地でも分かれない。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
