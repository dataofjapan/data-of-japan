/**
 * 時代ビュー。傷病別の受療率・推計患者数の長期推移（1996–2023）。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { listChapters } from "../data/hierarchy.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const FROM = 1996;
const TO = 2023;

const SETTINGS = [
  { value: "total", label: "総数" },
  { value: "inpatient", label: "入院" },
  { value: "outpatient", label: "外来" },
] as const;

const int = new Intl.NumberFormat("ja-JP");
const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: TO - FROM + 1 }, (_, i) => ({
    year: FROM + i,
    value: byYear.get(FROM + i) ?? null,
  }));
}

export function EraView() {
  const { diseases, cube, years } = use(loadEra());
  const selectable = useMemo(() => listChapters(diseases), [diseases]);
  const defaultDisease = selectable.find((d) => d.code === "01")?.code ?? selectable[0]!.code;

  const [disease, setDisease] = useUrlState<string>("disease", defaultDisease, (v) =>
    selectable.some((c) => c.code === v),
  );
  const [setting, setSetting] = useUrlState<string>("setting", "total", (v) =>
    SETTINGS.some((s) => s.value === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = selectable.find((c) => c.code === disease)!;

  const rows = useMemo(
    () =>
      selectable.map((c) => ({
        type: c,
        values: cube.series("rate", "year", { setting, disease: c.code }),
      })),
    [selectable, cube, setting],
  );

  const panels = useMemo((): Panel[] => {
    const at = (measure: string) => cube.series(measure, "year", { setting, disease });

    return [
      {
        key: "rate",
        title: "受療率",
        unit: "人口10万対",
        format: (v) => one.format(v),
        formatTick: (v) => (v >= 1000 ? int.format(Math.round(v)) : one.format(v)),
        series: [
          {
            key: "rate",
            label: "",
            points: dense(years, at("rate")),
            emphasized: true,
            markSparseSamples: true,
          },
        ],
      },
      {
        key: "patients",
        title: "推計患者数",
        unit: "千人",
        format: (v) => `${one.format(v)}千人`,
        formatTick: (v) => one.format(v),
        series: [
          {
            key: "patients",
            label: "",
            points: dense(years, at("patients")),
            emphasized: true,
            markSparseSamples: true,
          },
        ],
      },
    ];
  }, [cube, setting, disease, years]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          傷病分類
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={disease} onSelect={setDisease} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          折れ線は受療率の推移。高さは項目ごとに正規化してある。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? TO}年
            </p>
          </div>
          <Segmented
            label="入院・外来"
            value={setting}
            onChange={setSetting}
            options={SETTINGS.map((s) => ({ value: s.value, label: s.label }))}
          />
        </header>

        <div ref={ref} className="min-h-[420px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[FROM, TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <section className="mt-6 border-t border-rule pt-4">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">注記</h2>
          <dl className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              ...MARKS.map((m) => ({
                key: String(m.year),
                term: `${m.year}年 · ${m.label}`,
                detail: m.detail,
              })),
              ...NOTES.map((n) => ({
                key: n.term,
                term: n.term,
                detail: n.detail,
              })),
            ].map((n) => (
              <div key={n.key}>
                <dt className="tnum text-[12px] font-semibold">{n.term}</dt>
                <dd className="text-[11.5px] leading-relaxed text-muted">{n.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
