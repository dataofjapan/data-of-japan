/**
 * 被害ビュー。状態別・年齢層別の死傷構成。
 */

import { use, useMemo } from "react";
import { loadHarm } from "../data/chunks.ts";
import { codesForDim } from "../data/hierarchy.ts";
import { TypeRanking, type RankRow } from "../components/TypeRanking.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const int = new Intl.NumberFormat("ja-JP");
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const DIMS = [
  { value: "state_death", label: "状態・死者" },
  { value: "state_injury", label: "状態・負傷者" },
  { value: "age_death", label: "年齢・死者" },
  { value: "age_injury", label: "年齢・負傷者" },
] as const;

type DimId = (typeof DIMS)[number]["value"];

export function HarmView() {
  const { formDims, codes, cube, years } = use(loadHarm());

  const [dim, setDim] = useUrlState<DimId>("dim", "state_death", (v) =>
    DIMS.some((d) => d.value === v),
  );
  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));

  const dimCodes = useMemo(() => codesForDim(codes, dim), [codes, dim]);

  const rows = useMemo((): RankRow[] => {
    return dimCodes
      .map((c) => {
        const people = cube.at("people", { dim, code: c.code, year });
        const share = cube.at("share", { dim, code: c.code, year });
        const shareByYear = cube.series("share", "year", { dim, code: c.code });
        return {
          code: c.code,
          label: c.label,
          households: people ?? 0,
          share: share ?? 0,
          shareByAge: shareByYear.map((v) => v ?? 0),
        } satisfies RankRow;
      })
      .filter((r) => r.households > 0 || r.share > 0)
      .sort((a, b) => b.share - a.share || b.households - a.households);
  }, [dimCodes, cube, dim, year]);

  const total = rows.reduce((n, r) => n + r.households, 0);
  const dimLabel = formDims.find((d) => d.code === dim)?.label ?? dim;
  const unit = dim.includes("injury") ? "人（負傷）" : "人（死亡）";

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[280px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-faint">
          切り口
        </h2>
        <Segmented
          label="被害の切り口"
          options={DIMS.map((d) => ({ value: d.value, label: d.label }))}
          value={dim}
          onChange={setDim}
        />
        <p className="mt-4 px-2 text-[10.5px] leading-relaxed text-faint">
          {dim.startsWith("state")
            ? "当事者の状態別構成。計・二輪計は除く。"
            : "年齢層別構成。全年齢層・再掲は除く。"}
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{dimLabel}</h1>
            <p className="tnum shrink-0 text-[13px] text-muted">
              {total > 0 ? `${int.format(total)}${unit}` : ""}
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
          右端の折れ線は年次ごとの構成比。内訳は e-Stat
          DBが揃う2005–2018年。死者は24時間以内。
        </p>
      </main>
    </div>
  );
}
