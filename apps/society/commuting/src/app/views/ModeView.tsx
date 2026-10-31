/**
 * 手段ビュー。調査年ごとの利用交通手段ランキング。
 */

import { use, useMemo } from "react";
import { loadMode } from "../data/chunks.ts";
import { TypeRanking, type RankRow } from "../components/TypeRanking.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const int = new Intl.NumberFormat("ja-JP");
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function ModeView() {
  const { codes, cube, years } = use(loadMode());

  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));

  const rows = useMemo((): RankRow[] => {
    return codes
      .map((c) => {
        const people = cube.at("people", { code: c.code, year });
        const share = cube.at("share", { code: c.code, year });
        const shareByYear = cube.series("share", "year", { code: c.code });
        return {
          code: c.code,
          label: c.label,
          households: people ?? 0,
          share: share ?? 0,
          shareByAge: shareByYear.map((v) => v ?? 0),
          emphasize: ["rail", "car", "bicycle", "walk"].includes(c.code),
        } satisfies RankRow;
      })
      .filter((r) => r.households > 0 || r.share > 0)
      .sort((a, b) => b.share - a.share || b.households - a.households);
  }, [codes, cube, year]);

  const total = rows.reduce((n, r) => n + r.households, 0);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="text-[19px] font-semibold tracking-tight">利用交通手段</h1>
          <p className="tnum shrink-0 text-[13px] text-muted">
            {total > 0 ? `${int.format(total)}人（単一手段の合計）` : ""}
            {rows[0] && (
              <span className="ml-2 text-[12px]">
                首位 {rows[0].label} {pct.format(rows[0].share * 100)}%
              </span>
            )}
          </p>
        </div>
        <YearSelect years={years} value={year} onChange={setYear} />
      </header>

      <TypeRanking rows={rows} ageIndex={null} />

      <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
        単一手段のみ。複合（例: 鉄道＋自転車）は総数側に残り、ここには含まれない。右端の折れ線は調査年ごとの構成比。
      </p>
    </div>
  );
}
