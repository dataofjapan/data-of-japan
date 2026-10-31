/**
 * 性・年齢ビュー。年齢階級ごとの1日構成と、選んだ年齢の行動時間。
 */

import { use, useMemo } from "react";
import { loadAge } from "../data/chunks.ts";
import { NOTES } from "../data/annotations.ts";
import { AgeComposition } from "../components/AgeComposition.tsx";
import { DayComposition } from "../components/DayComposition.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";
import type { DayType, Sex } from "../data/chunks.ts";
import { GROUP_COLORS, GROUP_LABELS, GROUP_ORDER } from "../../lib/data/labels.ts";
import { groupOf } from "../data/hierarchy.ts";

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

export function AgeView() {
  const { activities, ages, cube, years } = use(loadAge());
  const defaultAge = ages.find((a) => a.code === "30-34")?.code ?? ages[0]!.code;

  const [age, setAge] = useUrlState<string>("age", defaultAge, (v) =>
    ages.some((a) => a.code === v),
  );
  const [sex, setSex] = useUrlState<Sex>("sex", "total", (v) =>
    SEXES.some((s) => s.value === v),
  );
  const [day, setDay] = useUrlState<DayType>("day", "week", (v) =>
    DAYS.some((d) => d.value === v),
  );
  const [year, setYear] = useUrlState<string>("year", years[0]!, (v) => years.includes(v));

  const [ref, width] = useWidth<HTMLDivElement>();
  const current = ages.find((a) => a.code === age)!;

  const topActs = useMemo(() => {
    return [...activities]
      .map((a) => ({
        ...a,
        minutes: cube.at("minutes", {
          activity: a.code,
          age,
          sex,
          day,
          year,
        }),
      }))
      .filter((a) => a.minutes !== null)
      .sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))
      .slice(0, 8);
  }, [activities, cube, age, sex, day, year]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[280px] shrink-0 max-lg:w-full">
        <p className="pb-2 text-[11px] text-faint">年齢階級</p>
        <ul className="space-y-0.5">
          {ages.map((a) => {
            const active = a.code === age;
            return (
              <li key={a.code}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setAge(a.code)}
                  className={`flex w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-[12px] transition-colors duration-150 ${
                    active
                      ? "bg-ink/[0.06] font-semibold text-ink"
                      : "text-muted hover:bg-ink/[0.03]"
                  }`}
                >
                  {a.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="pt-4 text-[11px] leading-relaxed text-faint">{NOTES.age}</p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div>
            <h2 className="text-[19px] font-semibold tracking-tight">
              {current.label}の1日
            </h2>
            <p className="pt-1 text-[12px] text-muted">
              {year}年・{SEXES.find((s) => s.value === sex)?.label}・
              {DAYS.find((d) => d.value === day)?.label}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <YearSelect years={years} value={year} onChange={setYear} />
            <Segmented options={SEXES} value={sex} onChange={setSex} label="性別" />
            <Segmented options={DAYS} value={day} onChange={setDay} label="曜日" />
          </div>
        </header>

        <section className="pb-8">
          <h3 className="pb-3 text-[13px] font-semibold">年齢階級ごとの構成</h3>
          <div ref={ref}>
            <AgeComposition
              ages={ages}
              selected={age}
              onSelect={setAge}
              width={width}
              getMinutes={(ageCode, activityCode) =>
                cube.at("minutes", {
                  activity: activityCode,
                  age: ageCode,
                  sex,
                  day,
                  year,
                })
              }
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-faint">
            {GROUP_ORDER.map((g) => (
              <li key={g} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2 rounded-[2px]"
                  style={{ backgroundColor: GROUP_COLORS[g] }}
                />
                {GROUP_LABELS[g]}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-rule pt-6">
          <h3 className="pb-3 text-[13px] font-semibold">選んだ年齢の1日</h3>
          <DayComposition
            width={width}
            getMinutes={(code) =>
              cube.at("minutes", { activity: code, age, sex, day, year })
            }
          />
          <h4 className="mt-6 pb-2 text-[12px] font-semibold text-muted">時間が長い行動</h4>
          <ol className="space-y-0.5">
            {topActs.map((a, i) => (
              <li
                key={a.code}
                className="flex items-baseline gap-2 px-1 py-1 text-[12px]"
              >
                <span className="tnum w-4 text-faint">{i + 1}</span>
                <span
                  className="mt-1 inline-block size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: GROUP_COLORS[groupOf(a.code)] }}
                />
                <span className="text-ink">{a.label}</span>
                <span className="tnum ml-auto font-medium">
                  {int.format(a.minutes ?? 0)}
                  <span className="ml-0.5 text-[10px] font-normal text-faint">分</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
