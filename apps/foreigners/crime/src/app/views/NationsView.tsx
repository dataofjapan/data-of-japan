/**
 * 国・地域ビュー。来日外国人だけを、上位8か国で積み上げる。
 * 刑法犯と特別法犯は混ぜない。
 */

import { use, useMemo } from "react";
import { PICK_COLOR, RANK_COLORS, REST_COLOR } from "../data/colors.ts";
import { exact, pct, tickCount, type Unit } from "../data/format.ts";
import { loadCrime } from "../data/load.ts";
import { RankList, type RankRow } from "../components/RankList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { CHARTS, Streamgraph, type Chart } from "../components/Streamgraph.tsx";
import { StackedYears, type Column, type Measure } from "../components/StackedYears.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";
import type { LawId } from "../../lib/data/labels.ts";

const MEASURES = [
  { value: "count", label: "数" },
  { value: "share", label: "構成比" },
] as const;

const UNITS = [
  { value: "cases", label: "件数" },
  { value: "people", label: "人員" },
] as const;

const REST = "そのほか";

export function NationsView() {
  const d = use(loadCrime());
  const last = d.years.at(-1)!;
  const latest = d.years.length - 1;
  const [yearParam, setYearParam] = useUrlState<string>("y", String(last), (v) => d.years.includes(Number(v)));
  const year = Number(yearParam);
  const yi = d.years.indexOf(year);
  const [law, setLaw] = useUrlState<LawId>("law", "penal", (v) => d.laws.some((item) => item.id === v));
  const [unit, setUnit] = useUrlState<Unit>("unit", "cases", (v) => v === "cases" || v === "people");
  const [measure, setMeasure] = useUrlState<Measure>("measure", "count", (v) => v === "count" || v === "share");
  const [chart, setChart] = useUrlState<Chart>("chart", "bars", (v) => CHARTS.some((c) => c.value === v));
  const Years = chart === "stream" ? Streamgraph : StackedYears;
  const [picked, setPicked] = useUrlState<string>("n", "", (v) => d.nations.includes(v));
  const li = d.laws.findIndex((item) => item.id === law);
  const lawMeta = d.laws[li]!;
  const grid = unit === "cases" ? d.nationCases : d.nationPeople;
  const visit = (unit === "cases" ? d.cases : d.people)[li]![0]!;

  const top = d.nations
    .map((name, index) => ({ name, index, value: d.nationCases[li]![index]![latest]! }))
    .sort((a, b) => b.value - a.value)
    .slice(0, RANK_COLORS.length);
  const colorOf = (name: string) => {
    const index = top.findIndex((row) => row.name === name);
    if (index >= 0) return RANK_COLORS[index]!;
    return name === picked ? PICK_COLOR : REST_COLOR;
  };

  const columns = useMemo((): Column[] => {
    const keys = top.map((row) => row.name);
    if (picked !== "" && !keys.includes(picked)) keys.push(picked);
    return d.years.map((yr, k) => {
      const total = visit[k]!;
      let named = 0;
      const segments = keys.map((name) => {
        const value = grid[li]![d.nations.indexOf(name)]![k]!;
        named += value;
        return { key: name, value, color: colorOf(name) };
      });
      const rest = total - named;
      if (rest > 0) segments.push({ key: REST, value: rest, color: REST_COLOR });
      return { year: yr, total, segments };
    });
  }, [d, grid, li, picked, top, visit]);

  const rows = useMemo((): RankRow[] => {
    return d.nations
      .map((name, index) => ({ name, value: grid[li]![index]![yi]! }))
      .sort((a, b) => b.value - a.value)
      .map((row) => ({
        name: row.name,
        value: row.value,
        label: exact(row.value, unit),
        indent: 0,
        color: colorOf(row.name),
      }));
  }, [d, grid, li, unit, yi, picked]);

  const total = visit[yi]!;
  const pickedIndex = d.nations.indexOf(picked);
  const pickedValue = pickedIndex < 0 ? null : grid[li]![pickedIndex]![yi]!;
  const formatValue = (n: number) => exact(n, unit);
  const legend = [
    ...top.map((row) => ({ name: row.name, color: colorOf(row.name) })),
    ...(picked !== "" && !top.some((row) => row.name === picked) ? [{ name: picked, color: PICK_COLOR }] : []),
    { name: REST, color: REST_COLOR },
  ];

  return (
    <main className="mx-auto grid w-full max-w-[1240px] gap-8 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold">国籍</h2>
          <YearSelect years={d.years} value={year} onChange={(yr) => setYearParam(String(yr))} />
        </div>
        <RankList rows={rows} selected={picked} onSelect={setPicked} />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Segmented options={d.laws.map((item) => ({ value: item.id, label: item.label }))} value={law} onChange={setLaw} label="法令" />
            <p className="tnum mt-1 text-[12px] text-muted">
              {year}年 · 来日 {exact(total, unit)}
              <span className="ml-2 text-faint">{lawMeta.note}</span>
              {picked !== "" && pickedValue !== null && (
                <span className="ml-2">
                  {picked} {exact(pickedValue, unit)}（{pct(pickedValue / total)}）
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Segmented options={CHARTS} value={chart} onChange={setChart} label="グラフ" />
            <Segmented options={UNITS} value={unit} onChange={setUnit} label="件数と人員" />
            <Segmented options={MEASURES} value={measure} onChange={setMeasure} label="数と構成比" />
          </div>
        </div>
        <Years
          columns={columns}
          measure={measure}
          highlighted={picked}
          focused={year}
          onFocus={(yr) => setYearParam(String(yr))}
          label={`${lawMeta.label}の国籍別${unit === "cases" ? "検挙件数" : "検挙人員"}`}
          formatTick={tickCount}
          formatValue={formatValue}
        />
        <Legend items={legend} />
        <p className="text-[11px] leading-relaxed text-muted">
          色のついた{RANK_COLORS.length}か国は{last}年の件数が多い順。「{REST}」はその{RANK_COLORS.length}か国以外で、国の行になっていない州のその他、アフリカ州、オセアニア州、無国籍、国籍不明もここに入る。
        </p>
      </section>
    </main>
  );
}

function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 pl-[46px] text-[11px] text-muted">
      {items.map((it) => (
        <li key={it.name} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-[9px] rounded-[2px]" style={{ backgroundColor: it.color }} />
          {it.name}
        </li>
      ))}
    </ul>
  );
}
