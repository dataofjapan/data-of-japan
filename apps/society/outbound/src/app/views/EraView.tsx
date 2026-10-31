/**
 * 時代ビュー。1964年からの出国日本人数。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { NOTES } from "../data/annotations.ts";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";

const int = new Intl.NumberFormat("ja-JP");
const man = (v: number) => (Math.abs(v) >= 10_000 ? `${int.format(Math.round(v / 10_000))}万` : int.format(v));

function dense(years: number[], values: (number | null)[]): Point[] {
  return years.map((year, i) => ({ year, value: values[i] ?? null }));
}

export function EraView() {
  const { years, cube } = use(loadEra());
  const yearNums = useMemo(() => years.map(Number), [years]);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const departures = cube.series("departures", "year", {});
  const last = years.at(-1)!;
  const out = cube.at("departures", { year: last });
  const peak = departures.reduce(
    (best, value, i) => (value !== null && value > best.value ? { year: years[i]!, value } : best),
    { year: years[0]!, value: departures[0] ?? 0 },
  );
  const panels = useMemo((): Panel[] => {
    return [
      {
        key: "count",
        title: "出国",
        unit: "人（回数）",
        format: (v) => int.format(Math.round(v)),
        formatTick: man,
        series: [{ key: "out", label: "", points: dense(yearNums, departures), emphasized: true }],
      },
    ];
  }, [departures, yearNums]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-faint">{last}年</h2>
        <dl className="flex flex-col gap-3 px-2">
          <div>
            <dt className="text-[11px] text-muted">出国日本人</dt>
            <dd className="tnum text-[18px] font-semibold tracking-tight">
              {out === null ? "—" : int.format(out)}
              <span className="ml-0.5 text-[11px] font-normal text-muted">人</span>
            </dd>
          </div>
        </dl>
        <p className="px-2 pt-4 text-[10.5px] leading-relaxed text-faint">
          1964年は12万7749人。これまでの最多は{peak.year}年の{int.format(peak.value)}人。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="pb-4">
          <h2 className="text-[18px] font-semibold tracking-tight">海外へ出た回数</h2>
          <p className="pt-1 text-[12px] text-muted">
            {years[0]}–{last}年。日本人の出国回数で、同じ人が1年に2回出れば2と数える。
          </p>
        </header>
        <div ref={ref}>
          {width > 0 && (
            <TrendStack
              panels={panels}
              width={width}
              domain={[yearNums[0]!, yearNums.at(-1)!]}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>
        <ul className="mt-4 space-y-1 text-[10.5px] leading-relaxed text-faint">
          {NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
