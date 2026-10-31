/**
 * 都道府県の行動時間ランキング。
 */

const int = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export interface RankRow {
  code: string;
  label: string;
  minutes: number | null;
  relative: number | null;
}

export function AreaRanking({
  rows,
  highlighted,
  onHover,
  onSelect,
}: {
  rows: RankRow[];
  highlighted: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
}) {
  const ranked = [...rows]
    .filter((r) => r.code !== "00" && r.minutes !== null)
    .sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0));

  return (
    <ol className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
      {ranked.map((r, i) => {
        const active = highlighted === r.code;
        return (
          <li key={r.code}>
            <button
              type="button"
              onMouseEnter={() => onHover(r.code)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(r.code)}
              className={`flex w-full cursor-pointer items-baseline gap-2 rounded-md px-2 py-1 text-left text-[12px] transition-colors duration-150 ${
                active ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
              }`}
            >
              <span className="tnum w-5 shrink-0 text-faint">{i + 1}</span>
              <span className={active ? "font-semibold text-ink" : "text-muted"}>
                {r.label}
              </span>
              <span className="tnum ml-auto font-medium text-ink">
                {int.format(r.minutes ?? 0)}
                <span className="ml-0.5 text-[10px] font-normal text-faint">分</span>
              </span>
              <span className="tnum w-10 shrink-0 text-right text-[11px] text-faint">
                ×{r.relative !== null ? one.format(r.relative) : "—"}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
