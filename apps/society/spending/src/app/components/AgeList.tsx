/**
 * 年齢階級の一覧。バーは選択費目の構成比。
 */

const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export interface AgeRow {
  code: string;
  label: string;
  share: number | null;
  group?: "summary" | "band";
}

export function AgeList({
  rows,
  selected,
  onSelect,
}: {
  rows: AgeRow[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  const max = Math.max(...rows.map((r) => r.share ?? 0), 0.01);

  return (
    <ul className="flex flex-col">
      {rows.map((row, i) => {
        const isSelected = row.code === selected;
        const prev = rows[i - 1];
        const breakAfterSummary =
          prev?.group === "summary" && row.group === "band";
        return (
          <li
            key={row.code}
            className={breakAfterSummary ? "mt-1 border-t border-rule pt-1" : ""}
          >
            <button
              type="button"
              onClick={() => onSelect(row.code)}
              aria-pressed={isSelected}
              className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1 text-left transition-colors duration-150 ${
                isSelected ? "bg-ink/[0.06]" : "hover:bg-ink/[0.03]"
              }`}
            >
              <span
                className={`w-[4.75rem] shrink-0 text-[12px] ${
                  isSelected ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {row.label}
              </span>
              <span
                className={`tnum w-[3rem] shrink-0 text-right text-[11px] ${
                  isSelected ? "text-ink" : "text-faint"
                }`}
              >
                {row.share === null ? "—" : `${pct.format(row.share * 100)}%`}
              </span>
              <span className="h-[9px] flex-1 bg-ink/[0.05]">
                <span
                  className={`block h-full ${isSelected ? "bg-accent" : "bg-accent/45"}`}
                  style={{
                    width: `${row.share === null ? 0 : (row.share / max) * 100}%`,
                  }}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
