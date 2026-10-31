/**
 * 時代ビュー。刑法犯と特別法犯は切り替え、来日とその他を積み上げる。
 */

import { use, useMemo } from "react";
import { GROUP_COLORS } from "../data/colors.ts";
import { change, exact, pct, tickCount, type Unit } from "../data/format.ts";
import { loadCrime } from "../data/load.ts";
import { Segmented } from "../components/Segmented.tsx";
import { CHARTS, Streamgraph, type Chart } from "../components/Streamgraph.tsx";
import { StackedYears, type Column, type Measure } from "../components/StackedYears.tsx";
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

export function EraView() {
  const d = use(loadCrime());
  const last = d.years.at(-1)!;
  const [yearParam, setYearParam] = useUrlState<string>("y", String(last), (v) => d.years.includes(Number(v)));
  const year = Number(yearParam);
  const yi = d.years.indexOf(year);
  const [law, setLaw] = useUrlState<LawId>("law", "penal", (v) => d.laws.some((item) => item.id === v));
  const [unit, setUnit] = useUrlState<Unit>("unit", "cases", (v) => v === "cases" || v === "people");
  const [measure, setMeasure] = useUrlState<Measure>("measure", "count", (v) => v === "count" || v === "share");
  const [chart, setChart] = useUrlState<Chart>("chart", "bars", (v) => CHARTS.some((c) => c.value === v));
  const [picked, setPicked] = useUrlState<string>("g", "", (v) => d.groups.includes(v as (typeof d.groups)[number]));
  const Years = chart === "stream" ? Streamgraph : StackedYears;
  const li = d.laws.findIndex((item) => item.id === law);
  const lawMeta = d.laws[li]!;
  const grid = unit === "cases" ? d.cases : d.people;

  const columns = useMemo(
    (): Column[] =>
      d.years.map((yr, k) => ({
        year: yr,
        total: d.groups.reduce((acc, _, g) => acc + grid[li]![g]![k]!, 0),
        segments: d.groups.map((group, g) => ({
          key: group,
          value: grid[li]![g]![k]!,
          color: GROUP_COLORS[group],
        })),
      })),
    [d, grid, li],
  );

  const total = columns[yi]!.total;
  const prev = yi > 0 ? columns[yi - 1]!.total : null;
  const formatValue = (n: number) => exact(n, unit);

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold">来日と、その他</h2>
            <Segmented options={d.laws.map((item) => ({ value: item.id, label: item.label }))} value={law} onChange={setLaw} label="法令" />
          </div>
          <p className="tnum mt-1 text-[12px] text-muted">
            {year}年 · {exact(total, unit)}
            {prev !== null && <span className="ml-2 text-faint">前年比 {change(total, prev)}</span>}
            <span className="ml-2 text-faint">{lawMeta.note}</span>
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
        label={`${lawMeta.label}の${unit === "cases" ? "検挙件数" : "検挙人員"}`}
        formatTick={tickCount}
        formatValue={formatValue}
      />

      <ul className="grid gap-1 sm:grid-cols-2">
        {d.groups.map((group, g) => {
          const value = grid[li]![g]![yi]!;
          const on = picked === group;
          return (
            <li key={group}>
              <button
                type="button"
                onClick={() => setPicked(on ? "" : group)}
                aria-pressed={on}
                className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition-[background-color,transform] duration-150 ease-out active:scale-[0.99] ${
                  on ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
                }`}
              >
                <span aria-hidden className="size-[9px] shrink-0 rounded-[2px]" style={{ backgroundColor: GROUP_COLORS[group] }} />
                <span className={`min-w-0 flex-1 truncate text-[12px] ${on ? "font-semibold" : "text-muted"}`}>{group}</span>
                <span className="tnum text-[12px]">{exact(value, unit)}</span>
                <span className="tnum w-12 text-right text-[11px] text-faint">{pct(value / total)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
