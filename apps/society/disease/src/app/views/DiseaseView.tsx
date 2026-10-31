/**
 * 疾病ビュー。令和5年断面の傷病 × 年齢階級 × 性。
 * 問いは「その傷病はどの年齢で受療されているか」。
 */

import { use, useMemo } from "react";
import { loadDisease } from "../data/chunks.ts";
import { listChapters } from "../data/hierarchy.ts";
import { TypePicker, type PickerRow } from "../components/TypePicker.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const SEXES = [
  { value: "total", label: "総数" },
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const;

const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function DiseaseView() {
  const { diseases, ages, cube, surveyYear } = use(loadDisease());
  const selectable = useMemo(() => listChapters(diseases), [diseases]);
  const defaultDisease = selectable.find((d) => d.code === "01")?.code ?? selectable[0]!.code;

  const [disease, setDisease] = useUrlState<string>("disease", defaultDisease, (v) =>
    selectable.some((c) => c.code === v),
  );
  const [sex, setSex] = useUrlState<string>("sex", "total", (v) =>
    SEXES.some((s) => s.value === v),
  );

  const current = selectable.find((c) => c.code === disease)!;
  const byAge = cube.series("patients", "age", { sex, disease });
  const totalPatients = byAge.reduce<number>((n, v) => n + (v ?? 0), 0);
  const maxAge = Math.max(...byAge.map((v) => v ?? 0), 1);

  const picker = useMemo((): PickerRow[] => {
    return selectable.map((d) => {
      const series = cube.series("patients", "age", { sex, disease: d.code });
      const sum = series.reduce<number>((n, v) => n + (v ?? 0), 0);
      return {
        code: d.code,
        label: d.label,
        households: Math.round(sum * 10),
        display: `${one.format(sum)}千人`,
      };
    });
  }, [selectable, cube, sex]);

  const peakIdx = byAge.reduce<number>(
    (best, v, i) => ((v ?? 0) > (byAge[best] ?? 0) ? i : best),
    0,
  );
  const peakValue = byAge[peakIdx] ?? 0;
  const peak = ages[peakIdx];

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100dvh-3rem)] lg:flex-col lg:self-start">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          傷病分類
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TypePicker rows={picker} selected={disease} onSelect={setDisease} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p className="text-[11px] text-muted">
              令和{surveyYear === "2023" ? "5" : surveyYear}年・推計患者数（千人）の年齢分布
            </p>
          </div>
          <Segmented
            label="性別"
            value={sex}
            onChange={setSex}
            options={SEXES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </header>

        <p className="pb-4 text-[13px] text-muted">
          合計{" "}
          <span className="tnum font-semibold text-ink">{one.format(totalPatients)}千人</span>
          {peak && totalPatients > 0 && (
            <>
              {" ／ ピークは "}
              <span className="font-semibold text-ink">{peak.label}</span>
              {"（"}
              <span className="tnum">{one.format(peakValue)}</span>
              {"千人）"}
            </>
          )}
        </p>

        <ol className="flex flex-col">
          {ages.map((a, i) => {
            const v = byAge[i] ?? 0;
            const share = totalPatients === 0 ? 0 : v / totalPatients;
            return (
              <li
                key={a.code}
                className="flex items-center gap-3 rounded px-2 py-[3px] transition-colors duration-150 hover:bg-ink/[0.03]"
              >
                <span className="w-[5.5rem] shrink-0 text-[12.5px]" title={a.label}>
                  {a.label}
                </span>
                <span className="h-[10px] min-w-0 flex-1 bg-ink/[0.05]">
                  <span
                    className="block h-full bg-accent/70"
                    style={{ width: `${(v / maxAge) * 100}%` }}
                  />
                </span>
                <span className="tnum w-[4.5rem] shrink-0 text-right text-[11px] text-muted">
                  {one.format(v)}
                </span>
                <span className="tnum w-[3.2rem] shrink-0 text-right text-[11px] text-faint">
                  {pct.format(share * 100)}%
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 border-t border-rule pt-4 text-[11.5px] leading-relaxed text-faint">
          病院・一般診療所の合計。入院と外来の区別はない（全国編第9表）。単位は千人。
        </p>
      </main>
    </div>
  );
}
