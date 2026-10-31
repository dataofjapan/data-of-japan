/**
 * 時代ビュー。高校卒業者の進路構成の長期推移。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
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

export function EraView() {
  const { paths, cube, years } = use(loadEra());
  const defaultPath =
    paths.find((p) => p.code === "university")?.code ?? paths[0]!.code;

  const [path, setPath] = useUrlState<string>("path", defaultPath, (v) =>
    paths.some((p) => p.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = paths.find((p) => p.code === path)!;

  const rows = useMemo(
    () =>
      paths.map((p) => ({
        type: p,
        values: cube.series("share", "year", { path: p.code }),
      })),
    [paths, cube],
  );

  const panels = useMemo((): Panel[] => {
    const count = cube.series("count", "year", { path });
    const share = cube.series("share", "year", { path });

    return [
      {
        key: "count",
        title: "人数",
        unit: "人（高校卒業者のうち）",
        format: (v) => int.format(Math.round(v)),
        formatTick: compact,
        series: [
          {
            key: "count",
            label: "",
            points: dense(years, count),
            emphasized: true,
          },
        ],
      },
      {
        key: "share",
        title: "構成比",
        unit: "高校卒業者に占める割合",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "share",
            label: "",
            points: dense(years, share),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, path, years]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          進路
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={path} onSelect={setPath} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          スパークは構成比。短大から大学へ、就職から専修・大学へ、の置き換えが見える。
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
