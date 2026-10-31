/**
 * 男女ビュー。在学者の男女構成と女性割合。
 */

import { use, useMemo, useState } from "react";
import { loadGender } from "../data/chunks.ts";
import { MARKS, NOTES } from "../data/annotations.ts";
import { TypeList } from "../components/TypeList.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { YEAR_FROM, YEAR_TO } from "../../lib/data/labels.ts";

const int = new Intl.NumberFormat("ja-JP");
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => ({
    year: YEAR_FROM + i,
    value: byYear.get(YEAR_FROM + i) ?? null,
  }));
}

function compact(v: number): string {
  if (v >= 10_000) return `${int.format(Math.round(v / 10_000))}万`;
  return int.format(Math.round(v));
}

export function GenderView() {
  const { schools, cube, years } = use(loadGender());
  const defaultSchool =
    schools.find((s) => s.code === "university")?.code ?? schools[0]!.code;

  const [school, setSchool] = useUrlState<string>("school", defaultSchool, (v) =>
    schools.some((s) => s.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = schools.find((s) => s.code === school)!;

  const rows = useMemo(
    () =>
      schools.map((s) => ({
        type: s,
        values: cube.series("female_share", "year", { school: s.code, sex: "total" }),
      })),
    [schools, cube],
  );

  const panels = useMemo((): Panel[] => {
    const male = cube.series("enrollment", "year", { school, sex: "male" });
    const female = cube.series("enrollment", "year", { school, sex: "female" });
    const femaleShare = cube.series("female_share", "year", {
      school,
      sex: "total",
    });

    return [
      {
        key: "enrollment",
        title: "在学者数（男女）",
        unit: "人",
        format: (v) => int.format(Math.round(v)),
        formatTick: compact,
        series: [
          {
            key: "male",
            label: "男",
            points: dense(years, male),
            emphasized: false,
          },
          {
            key: "female",
            label: "女",
            points: dense(years, female),
            emphasized: true,
          },
        ],
      },
      {
        key: "female_share",
        title: "女性割合",
        unit: "女 / 計",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "female_share",
            label: "",
            points: dense(years, femaleShare),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, school, years]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          学校種
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={school} onSelect={setSchool} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          スパークは女性割合。短大は女性中心のまま縮小し、大学の女性割合は上昇する。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? YEAR_TO}年
            </p>
          </div>
        </header>

        <div ref={ref} className="min-h-[420px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[YEAR_FROM, YEAR_TO]}
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
