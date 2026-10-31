/**
 * 出来事ビュー。バブル・震災・コロナを注記として、東京圏転入超過の上に置く。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { EVENTS, NOTES } from "../data/annotations.ts";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { ERA_FROM, ERA_TO } from "../../lib/data/labels.ts";

const int = new Intl.NumberFormat("ja-JP");

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: ERA_TO - ERA_FROM + 1 }, (_, i) => ({
    year: ERA_FROM + i,
    value: byYear.get(ERA_FROM + i) ?? null,
  }));
}

function formatPeople(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 10_000) return `${sign}${int.format(Math.round(abs / 10_000))}万人`;
  return `${sign}${int.format(Math.round(abs))}人`;
}

function formatTick(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 10_000) return `${sign}${int.format(Math.round(abs / 10_000))}万`;
  return `${sign}${int.format(Math.round(abs))}`;
}

export function EventsView() {
  const { cube, years } = use(loadEra());
  const [eventId, setEventId] = useUrlState<string>(
    "event",
    EVENTS[0]!.id,
    (v) => EVENTS.some((e) => e.id === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = EVENTS.find((e) => e.id === eventId) ?? EVENTS[0]!;

  const panels = useMemo((): Panel[] => {
    const tokyo = cube.series("people", "year", { metric: "tokyo_net" });
    const nagoya = cube.series("people", "year", { metric: "nagoya_net" });
    const osaka = cube.series("people", "year", { metric: "osaka_net" });
    return [
      {
        key: "metros",
        title: "三大都市圏の転入超過",
        unit: "人",
        format: formatPeople,
        formatTick,
        series: [
          {
            key: "tokyo",
            label: "東京圏",
            points: dense(years, tokyo),
            emphasized: true,
          },
          {
            key: "nagoya",
            label: "名古屋圏",
            points: dense(years, nagoya),
            emphasized: false,
          },
          {
            key: "osaka",
            label: "大阪圏",
            points: dense(years, osaka),
            emphasized: false,
          },
        ],
      },
    ];
  }, [cube, years]);

  const focusYear = hoverYear ?? current.year;
  const tokyoAt = cube.at("people", {
    metric: "tokyo_net",
    year: String(focusYear),
  });

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          出来事
        </h2>
        <ul className="flex flex-col gap-1">
          {EVENTS.map((e) => {
            const selected = e.id === eventId;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setEventId(e.id)}
                  aria-pressed={selected}
                  className={`w-full cursor-pointer rounded px-3 py-2.5 text-left transition-colors duration-150 ${
                    selected ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="tnum text-[12px] text-faint">{e.year}</span>
                    <span
                      className={`text-[13px] ${selected ? "font-semibold text-ink" : "text-muted"}`}
                    >
                      {e.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{e.detail}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p className="tnum text-[13px] text-muted">
              {focusYear}年 · 東京圏 {tokyoAt === null ? "—" : formatPeople(tokyoAt)}
            </p>
          </div>
        </header>

        <div ref={ref} className="min-h-[280px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[ERA_FROM, ERA_TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-muted">
          濃い線が東京圏。淡い線が名古屋圏・大阪圏。帯と縦線はバブル・震災・コロナの注記。
        </p>

        <section className="mt-6 border-t border-rule pt-4">
          <h2 className="text-[11px] font-semibold tracking-wide text-faint">注記</h2>
          <dl className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {NOTES.map((n) => (
              <div key={n.term}>
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
