/**
 * 費目ビュー。十大費目の消費支出構成比の断面。
 */

import { use, useMemo } from "react";
import { loadItem } from "../data/chunks.ts";
import { TypeRanking, type RankRow } from "../components/TypeRanking.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const yen = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const EMPHASIZE = new Set([
  "food",
  "housing",
  "education",
  "telecom",
  "transport_comm",
  "culture",
]);

export function ItemView() {
  const { items, cube, years } = use(loadItem());

  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));

  const yearIndex = useMemo(() => {
    const ascending = [...years].reverse();
    return ascending.indexOf(year);
  }, [years, year]);

  const rows = useMemo((): RankRow[] => {
    const ascending = [...years].reverse();
    return items
      .map((c) => {
        const amount = cube.at("yen", { item: c.code, year }) ?? 0;
        const share = cube.at("share", { item: c.code, year }) ?? 0;
        const shareByYear = ascending.map(
          (y) => cube.at("share", { item: c.code, year: y }) ?? 0,
        );
        return {
          code: c.code,
          label: c.label,
          households: Math.round(amount),
          share,
          shareByAge: shareByYear,
          emphasize: EMPHASIZE.has(c.code),
        } satisfies RankRow;
      })
      .filter((r) => r.households > 0 || r.share > 0)
      .sort((a, b) => b.share - a.share || b.households - a.households);
  }, [items, cube, year, years]);

  const totalYen = rows.reduce((n, r) => n + r.households, 0);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[280px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-faint">
          見方
        </h2>
        <p className="px-2 text-[10.5px] leading-relaxed text-faint">
          消費支出を十大費目に分けた構成比。分母は消費支出。右端の折れ線は年ごとの構成比。
        </p>
        <p className="mt-4 px-2 text-[10.5px] leading-relaxed text-faint">
          強調行は物語の核（食料・住居・交通通信・教育・教養娯楽）。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">費目構成</h1>
            <p className="tnum shrink-0 text-[13px] text-muted">
              {totalYen > 0 ? `${yen.format(totalYen)} 円` : ""}
              {rows[0] && (
                <span className="ml-2 text-[12px]">
                  首位 {rows[0].label} {pct.format(rows[0].share * 100)}%
                </span>
              )}
            </p>
          </div>
          <YearSelect years={years} value={year} onChange={setYear} />
        </header>

        <p className="pb-2 text-[11px] text-faint">数値は月平均支出（円）と構成比</p>
        <TypeRanking rows={rows} ageIndex={yearIndex >= 0 ? yearIndex : null} />

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          L4 十大費目のみ。外食・通信などの内訳は時代ビューで追う。構成比の合計は消費支出の
          100% に一致する。
        </p>
      </main>
    </div>
  );
}
