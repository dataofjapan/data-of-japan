/**
 * 1日の構成（グループ別の積み上げ横棒）。
 */

import { groupMinutes } from "../data/hierarchy.ts";

const int = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

export function DayComposition({
  getMinutes,
  width,
}: {
  getMinutes: (activityCode: string) => number | null;
  width: number;
}) {
  const groups = groupMinutes(getMinutes);
  const total = groups.reduce((s, g) => s + g.minutes, 0) || 1;
  const barW = Math.max(120, width);

  return (
    <div className="space-y-3">
      <div
        className="flex h-9 overflow-hidden rounded-sm"
        style={{ width: barW }}
        role="img"
        aria-label="1日の行動構成"
      >
        {groups.map((g) => (
          <div
            key={g.group}
            title={`${g.label} ${int.format(g.minutes)}分`}
            style={{
              width: `${(g.minutes / total) * 100}%`,
              backgroundColor: g.color,
            }}
            className="h-full min-w-0"
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {groups.map((g) => (
          <li key={g.group} className="flex items-baseline gap-2 text-[12px]">
            <span
              className="mt-1 inline-block size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: g.color }}
              aria-hidden
            />
            <span className="text-muted">{g.label}</span>
            <span className="tnum ml-auto font-medium text-ink">
              {int.format(g.minutes)}
              <span className="ml-0.5 text-[10px] font-normal text-faint">分</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-faint">
        合計 {int.format(total)} 分（1日 = 1440 分）
      </p>
    </div>
  );
}
