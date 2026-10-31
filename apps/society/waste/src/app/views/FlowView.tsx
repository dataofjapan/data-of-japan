/**
 * 処理ビュー。排出内訳と資源化・最終処分。
 */

import { use, useMemo, useState } from "react";
import { loadFlow } from "../data/chunks.ts";
import { TypeList } from "../components/TypeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import { ERA_FROM, ERA_TO } from "../../lib/data/labels.ts";

const int = new Intl.NumberFormat("ja-JP");
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const GROUPS = [
  { value: "discharge", label: "排出内訳" },
  { value: "process", label: "資源化・処分" },
] as const;

type GroupId = (typeof GROUPS)[number]["value"];

function dense(yearsAsc: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(yearsAsc.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: ERA_TO - ERA_FROM + 1 }, (_, i) => ({
    year: ERA_FROM + i,
    value: byYear.get(ERA_FROM + i) ?? null,
  }));
}

export function FlowView() {
  const { codes, cube, years } = use(loadFlow());
  const yearsAsc = useMemo(() => cube.codes("year").map(Number), [cube]);

  const [group, setGroup] = useUrlState<GroupId>("group", "discharge", (v) =>
    GROUPS.some((g) => g.value === v),
  );
  const visible = useMemo(
    () => codes.filter((c) => c.parent === group),
    [codes, group],
  );
  const defaultCode = visible[0]?.code ?? codes[0]!.code;

  const [year, setYear] = useUrlState("year", years[0]!, (v) => years.includes(v));
  const [code, setCode] = useUrlState<string>("flow", defaultCode, (v) =>
    codes.some((c) => c.code === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  // グループ切替時に選択が外れたら先頭へ
  const current =
    visible.find((c) => c.code === code) ?? visible[0] ?? codes[0]!;
  const activeCode = current.code;

  const rows = useMemo(
    () =>
      visible.map((c) => ({
        type: c,
        values: cube.series("share", "year", { code: c.code }),
      })),
    [visible, cube],
  );

  const yearShare = useMemo(() => {
    return [...visible]
      .map((c) => ({
        code: c.code,
        label: c.label,
        share: cube.at("share", { code: c.code, year }) ?? 0,
        tonnes: cube.at("tonnes", { code: c.code, year }) ?? 0,
      }))
      .sort((a, b) => b.share - a.share);
  }, [visible, cube, year]);

  const panels = useMemo((): Panel[] => {
    return [
      {
        key: "share",
        title: "総排出に占める割合",
        unit: "総排出量比",
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "share",
            label: "",
            points: dense(yearsAsc, cube.series("share", "year", { code: activeCode })),
            emphasized: true,
          },
        ],
      },
      {
        key: "tonnes",
        title: "量",
        unit: "t",
        format: (v) => `${int.format(Math.round(v))}t`,
        formatTick: (v) =>
          v >= 1_000_000
            ? `${int.format(Math.round(v / 1_000_000))}百万`
            : v >= 10_000
              ? `${int.format(Math.round(v / 10_000))}万`
              : int.format(Math.round(v)),
        series: [
          {
            key: "tonnes",
            label: "",
            points: dense(yearsAsc, cube.series("tonnes", "year", { code: activeCode })),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, activeCode, yearsAsc]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <div className="px-2 pb-3">
          <Segmented
            options={[...GROUPS]}
            value={group}
            onChange={(v) => {
              setGroup(v);
              const next = codes.find((c) => c.parent === v);
              if (next) setCode(next.code);
            }}
            label="表示"
          />
        </div>
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          {group === "discharge" ? "排出内訳" : "資源化・処分"}
        </h2>
        <div className="max-h-[50vh] overflow-y-auto lg:max-h-[calc(100dvh-14rem)]">
          <TypeList
            rows={rows}
            years={yearsAsc}
            selected={activeCode}
            onSelect={setCode}
          />
        </div>
        <div className="mt-3 border-t border-rule px-2 pt-2">
          <p className="pb-1 text-[10.5px] text-faint">{year}年度の構成（総排出比）</p>
          <ul className="flex flex-col gap-0.5 text-[11.5px]">
            {yearShare.map((r) => (
              <li key={r.code} className="flex justify-between gap-2 tnum">
                <span className={r.code === activeCode ? "font-semibold" : "text-muted"}>
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
              {hoverYear ?? Number(year)}年度
            </p>
          </div>
          <YearSelect years={years} value={year} onChange={setYear} />
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

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          割合はいずれもごみ総排出量に対する比。排出内訳・直接資源化などは2005年度以降。
          焼却トンは SSDS に無いため扱わない。資源化と最終処分は足して総排出にはならない。
        </p>
      </main>
    </div>
  );
}
