/**
 * 年齢階級ごとの1日構成（積み上げ横棒）。
 */

import { scaleLinear } from "d3-scale";
import { groupMinutes } from "../data/hierarchy.ts";
import type { DictEntry } from "../data/cube.ts";

const int = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });

export function AgeComposition({
  ages,
  selected,
  onSelect,
  getMinutes,
  width,
}: {
  ages: DictEntry[];
  selected: string;
  onSelect: (code: string) => void;
  getMinutes: (ageCode: string, activityCode: string) => number | null;
  width: number;
}) {
  const barMax = Math.max(200, width - 72);
  const x = scaleLinear().domain([0, 1440]).range([0, barMax]);

  return (
    <div className="space-y-1">
      {ages.map((age) => {
        const groups = groupMinutes((act) => getMinutes(age.code, act));
        const active = age.code === selected;
        return (
          <button
            key={age.code}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(age.code)}
            className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors duration-150 ${
              active ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
            }`}
          >
            <span
              className={`w-14 shrink-0 text-[11px] tnum ${
                active ? "font-semibold text-ink" : "text-muted"
              }`}
            >
              {age.label}
            </span>
            <div className="flex h-4 overflow-hidden rounded-[2px]" style={{ width: barMax }}>
              {groups.map((g) => (
                <div
                  key={g.group}
                  style={{
                    width: x(g.minutes),
                    backgroundColor: g.color,
                  }}
                  className="h-full"
                  title={`${g.label} ${int.format(g.minutes)}分`}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
