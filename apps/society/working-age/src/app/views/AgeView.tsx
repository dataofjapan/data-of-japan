/**
 * 年齢ビュー。選択年の年齢別就業率プロファイル。
 */

import { use, useMemo } from "react";
import { loadRates, type Sex } from "../data/chunks.ts";
import { BAND_AGE_CODES, SEX_OPTIONS } from "../../lib/data/labels.ts";
import { AgeProfile } from "../components/AgeProfile.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function AgeView() {
  const { ages, cube, years } = use(loadRates());
  const yearLabels = useMemo(() => [...years].map(String).reverse(), [years]);
  const compareCandidates = useMemo(
    () => years.filter((y) => y <= 2000 || y === years[0]),
    [years],
  );
  const defaultCompare = String(
    compareCandidates.includes(2000) ? 2000 : (compareCandidates[0] ?? years[0]!),
  );

  const [snapYear, setSnapYear] = useUrlState(
    "year",
    String(years.at(-1)!),
    (v) => years.includes(Number(v)),
  );
  const [compareYear, setCompareYear] = useUrlState(
    "compare",
    defaultCompare,
    (v) => years.includes(Number(v)),
  );
  const [sex, setSex] = useUrlState<Sex>("sex", "total", (v) =>
    SEX_OPTIONS.some((s) => s.value === v),
  );
  const [ref, width] = useWidth<HTMLDivElement>();

  const bandAges = useMemo(
    () => ages.filter((a) => (BAND_AGE_CODES as readonly string[]).includes(a.code)),
    [ages],
  );

  const rows = useMemo(
    () =>
      bandAges.map((a) => ({
        code: a.code,
        label: a.label,
        value: cube.at("empRate", { age: a.code, sex, year: snapYear }),
        compare: cube.at("empRate", { age: a.code, sex, year: compareYear }),
      })),
    [bandAges, cube, sex, snapYear, compareYear],
  );

  const elderlyNow = cube.at("empRate", { age: "18", sex, year: snapYear });
  const elderlyThen = cube.at("empRate", { age: "18", sex, year: compareYear });
  const lateNow = cube.at("empRate", { age: "17", sex, year: snapYear });

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col">
      <aside className="w-[220px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-faint">
          年次
        </h2>
        <div className="flex flex-col gap-3 px-2">
          <label className="block text-[11px] text-muted">
            表示年
            <div className="mt-1">
              <YearSelect years={yearLabels} value={snapYear} onChange={setSnapYear} />
            </div>
          </label>
          <label className="block text-[11px] text-muted">
            比較年（淡色）
            <div className="mt-1">
              <YearSelect
                years={yearLabels}
                value={compareYear}
                onChange={setCompareYear}
              />
            </div>
          </label>
          <Segmented options={[...SEX_OPTIONS]} value={sex} onChange={setSex} label="性別" />
        </div>
        <p className="px-2 pt-4 text-[10.5px] leading-relaxed text-faint">
          5歳階級の就業率。合算階級は含めない。比較年を重ねて曲線の変化を見る。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="pb-4">
          <h1 className="text-[19px] font-semibold tracking-tight">年齢別就業率</h1>
          <p className="mt-1 tnum text-[12px] text-muted">
            {snapYear}年
            {elderlyNow !== null && <> · 65歳以上 {pct.format(elderlyNow * 100)}%</>}
            {lateNow !== null && <> · 60–64歳 {pct.format(lateNow * 100)}%</>}
            {elderlyThen !== null && (
              <>
                {" "}
                · 比較 {compareYear}年 65歳以上 {pct.format(elderlyThen * 100)}%
              </>
            )}
          </p>
        </header>

        <div ref={ref} className="min-h-[420px]">
          {width > 0 && (
            <AgeProfile
              rows={rows}
              width={width}
              compareLabel={`${compareYear}年`}
            />
          )}
        </div>

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          若年で高く、60歳前後で下がり始める曲線が、高齢側へどれだけ押し上がったかを見る。
          就業率は1968年〜。
        </p>
      </main>
    </div>
  );
}
