/**
 * 入所ビュー。少年院入院者の年齢構成と、直近の非行名。
 */

import { use, useMemo, useState } from "react";
import { loadAge } from "../data/chunks.ts";
import { TypeList } from "../components/TypeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { AGE_FROM, ERA_TO } from "../../lib/data/labels.ts";

const int = new Intl.NumberFormat("ja-JP");
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const MODES = [
  { value: "share", label: "構成比" },
  { value: "persons", label: "人員" },
] as const;

type ModeId = (typeof MODES)[number]["value"];

function dense(yearsAsc: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(yearsAsc.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: ERA_TO - AGE_FROM + 1 }, (_, i) => ({
    year: AGE_FROM + i,
    value: byYear.get(AGE_FROM + i) ?? null,
  }));
}

export function AgeView() {
  const { codes, offenses, cube, years } = use(loadAge());
  const yearsAsc = useMemo(() => cube.codes("year").map(Number), [cube]);

  const [mode, setMode] = useUrlState<ModeId>("mode", "share", (v) =>
    MODES.some((m) => m.value === v),
  );
  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));
  const [code, setCode] = useUrlState<string>("age", "a18", (v) =>
    codes.some((c) => c.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = codes.find((c) => c.code === code) ?? codes[0]!;

  const rows = useMemo(() => {
    const measure = mode === "share" ? "share" : "persons";
    return codes.map((c) => ({
      type: c,
      values: cube.series(measure, "year", { code: c.code }),
    }));
  }, [codes, cube, mode]);

  const yearRank = useMemo(() => {
    return [...codes]
      .map((c) => ({
        code: c.code,
        label: c.label,
        share: cube.at("share", { code: c.code, year }) ?? 0,
        persons: cube.at("persons", { code: c.code, year }) ?? 0,
      }))
      .sort((a, b) => b.share - a.share);
  }, [codes, cube, year]);

  const panels = useMemo((): Panel[] => {
    return [
      {
        key: "share",
        title: "構成比",
        unit: "入院者に占める割合",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "share",
            label: "",
            points: dense(yearsAsc, cube.series("share", "year", { code })),
            emphasized: true,
          },
        ],
      },
      {
        key: "persons",
        title: "人員",
        unit: "人",
        format: (v) => `${int.format(Math.round(v))}人`,
        formatTick: (v) =>
          v >= 10_000 ? `${int.format(Math.round(v / 10_000))}万` : int.format(Math.round(v)),
        series: [
          {
            key: "persons",
            label: "",
            points: dense(yearsAsc, cube.series("persons", "year", { code })),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, code, yearsAsc]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <div className="px-2 pb-3">
          <Segmented options={[...MODES]} value={mode} onChange={setMode} label="表示" />
        </div>
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          年齢
        </h2>
        <div className="max-h-[50vh] overflow-y-auto lg:max-h-[calc(100dvh-14rem)]">
          <TypeList rows={rows} years={yearsAsc} selected={code} onSelect={setCode} />
        </div>
        <div className="mt-3 border-t border-rule px-2 pt-2">
          <p className="pb-1 text-[10.5px] text-faint">{year}年の構成比</p>
          <ul className="flex flex-col gap-0.5 text-[11.5px]">
            {yearRank.map((r) => (
              <li key={r.code} className="flex justify-between gap-2 tnum">
                <span className={r.code === code ? "font-semibold" : "text-muted"}>
                  {r.label}
                </span>
                <span className="text-faint">{pct.format(r.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? Number(year)}年
            </p>
          </div>
          <YearSelect years={years} value={year} onChange={setYear} />
        </header>

        <div ref={ref} className="min-h-[280px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[AGE_FROM, ERA_TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <section className="mt-5 border-t border-rule pt-3">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">
            2024年の入院非行名
          </h2>
          <ul className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {offenses.map((o) => (
              <li key={o.code} className="flex justify-between gap-3 tnum text-[12px]">
                <span className="text-muted">{o.label}</span>
                <span>
                  {int.format(o.persons)}
                  <span className="ml-2 text-faint">{pct.format(o.share * 100)}%</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            年齢は入院時。男女合算。18歳以上には入院時に20歳の人を含む。非行名は2024年（第5種を除く）。
          </p>
        </section>
      </main>
    </div>
  );
}
