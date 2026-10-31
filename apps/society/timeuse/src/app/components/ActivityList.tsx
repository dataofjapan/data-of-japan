/**
 * 行動種類の選定リスト。右端に年次スパークライン。
 */

import { line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";
import { GROUP_LABELS, GROUP_ORDER, groupOf } from "../data/hierarchy.ts";
import type { DictEntry } from "../data/cube.ts";

function Spark({ values }: { values: (number | null)[] }) {
  const w = 56;
  const h = 18;
  const pts = values
    .map((v, i) => ({ i, v }))
    .filter((p): p is { i: number; v: number } => p.v !== null);
  if (pts.length < 2) return <svg width={w} height={h} aria-hidden />;
  const x = scaleLinear()
    .domain([0, values.length - 1])
    .range([1, w - 1]);
  const ymin = Math.min(...pts.map((p) => p.v));
  const ymax = Math.max(...pts.map((p) => p.v));
  const y = scaleLinear()
    .domain([ymin === ymax ? ymin - 1 : ymin, ymax === ymin ? ymax + 1 : ymax])
    .range([h - 2, 2]);
  const d = line<{ i: number; v: number }>()
    .x((p) => x(p.i))
    .y((p) => y(p.v))(pts);
  return (
    <svg width={w} height={h} aria-hidden className="shrink-0 opacity-70">
      <path d={d ?? ""} fill="none" stroke="currentColor" strokeWidth={1.2} />
    </svg>
  );
}

export function ActivityList({
  activities,
  selected,
  onSelect,
  seriesFor,
}: {
  activities: DictEntry[];
  selected: string;
  onSelect: (code: string) => void;
  seriesFor: (code: string) => (number | null)[];
}) {
  const ordered = useMemo(() => {
    const rank = new Map(GROUP_ORDER.map((g, i) => [g, i]));
    return [...activities].sort((a, b) => {
      const ga = a.parent ?? groupOf(a.code);
      const gb = b.parent ?? groupOf(b.code);
      const d =
        (rank.get(ga as (typeof GROUP_ORDER)[number]) ?? 99) -
        (rank.get(gb as (typeof GROUP_ORDER)[number]) ?? 99);
      return d !== 0 ? d : a.code.localeCompare(b.code);
    });
  }, [activities]);

  let lastGroup = "";
  return (
    <div className="flex flex-col gap-0.5">
      <p className="pb-2 text-[11px] text-faint">行動の種類</p>
      {ordered.map((a) => {
        const group = a.parent ?? groupOf(a.code);
        const showHead = group !== lastGroup;
        lastGroup = group;
        const active = a.code === selected;
        return (
          <div key={a.code}>
            {showHead && (
              <p className="pt-2 pb-1 text-[10px] tracking-wide text-faint">
                {GROUP_LABELS[group as keyof typeof GROUP_LABELS] ?? group}
              </p>
            )}
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(a.code)}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
                active ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
              }`}
            >
              <span
                className={`min-w-0 flex-1 text-[12px] leading-snug ${
                  active ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {a.label}
              </span>
              <Spark values={seriesFor(a.code)} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
