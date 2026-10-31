/**
 * 時代ビュー。1996–2021 の行動別総平均時間と、選んだ年の1日構成。
 */

import { use, useMemo, useState } from "react";
import { loadEra } from "../data/chunks.ts";
import { NOTES } from "../data/annotations.ts";
import { ActivityList } from "../components/ActivityList.tsx";
import { DayComposition } from "../components/DayComposition.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import type { DayType, Sex } from "../data/chunks.ts";

const SEXES = [
  { value: "total" as const, label: "総数" },
  { value: "male" as const, label: "男" },
  { value: "female" as const, label: "女" },
];

const DAYS = [
  { value: "week" as const, label: "週全体" },
  { value: "weekday" as const, label: "平日" },
  { value: "saturday" as const, label: "土曜" },
  { value: "sunday" as const, label: "日曜" },
];

const int = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });

export function EraView() {
  const { activities, cube, years } = use(loadEra());
  const defaultAct = activities.find((a) => a.code === "05")?.code ?? activities[0]!.code;

  const [activity, setActivity] = useUrlState<string>("activity", defaultAct, (v) =>
    activities.some((a) => a.code === v),
  );
  const [sex, setSex] = useUrlState<Sex>("sex", "total", (v) =>
    SEXES.some((s) => s.value === v),
  );
  const [day, setDay] = useUrlState<DayType>("day", "week", (v) =>
    DAYS.some((d) => d.value === v),
  );
  const yearCodes = years.map(String);
  const [compYear, setCompYear] = useUrlState<string>(
    "year",
    yearCodes.at(-1)!,
    (v) => yearCodes.includes(v),
  );

  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = activities.find((a) => a.code === activity)!;
  const yearNums = years;

  const seriesFor = (code: string) =>
    cube.series("minutes", "year", { activity: code, sex, day });

  const panels = useMemo((): Panel[] => {
    const points: Point[] = yearNums.map((year, i) => ({
      year,
      value: seriesFor(activity)[i] ?? null,
    }));
    return [
      {
        key: "minutes",
        title: "総平均時間",
        unit: "分 / 日",
        format: (v) => int.format(v),
        formatTick: (v) => int.format(v),
        series: [
          {
            key: "minutes",
            label: "",
            points,
            emphasized: true,
            markSparseSamples: true,
          },
        ],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, sex, day, cube, yearNums]);

  const latest = seriesFor(activity).at(-1);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full">
        <ActivityList
          activities={activities}
          selected={activity}
          onSelect={setActivity}
          seriesFor={seriesFor}
        />
        <p className="pt-4 text-[11px] leading-relaxed text-faint">{NOTES.era}</p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div>
            <h2 className="text-[19px] font-semibold tracking-tight">{current.label}</h2>
            <p className="tnum pt-1 text-[12px] text-muted">
              {latest !== null && latest !== undefined
                ? `${int.format(latest)} 分（${yearNums.at(-1)}・${SEXES.find((s) => s.value === sex)?.label}・${DAYS.find((d) => d.value === day)?.label}）`
                : "—"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented options={SEXES} value={sex} onChange={setSex} label="性別" />
            <Segmented options={DAYS} value={day} onChange={setDay} label="曜日" />
          </div>
        </header>

        <div ref={ref}>
          <TrendStack
            panels={panels}
            width={width}
            domain={[yearNums[0]!, yearNums.at(-1)!]}
            hoverYear={hoverYear}
            onHoverYear={setHoverYear}
          />
        </div>

        <section className="mt-10 border-t border-rule pt-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[14px] font-semibold">1日の構成</h3>
            <YearSelect years={yearCodes} value={compYear} onChange={setCompYear} />
          </div>
          <DayComposition
            width={width}
            getMinutes={(code) =>
              cube.at("minutes", { activity: code, sex, day, year: compYear })
            }
          />
        </section>
      </main>
    </div>
  );
}
