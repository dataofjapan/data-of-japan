/**
 * 地域ビュー。選んだ行動の都道府県差（地図＋順位）。
 */

import { use, useMemo, useState } from "react";
import { loadGeo } from "../data/chunks.ts";
import { NOTES } from "../data/annotations.ts";
import { ActivityList } from "../components/ActivityList.tsx";
import { TileMap } from "../components/TileMap.tsx";
import { AreaRanking } from "../components/AreaRanking.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
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

export function GeoView() {
  const { activities, areas, cube, years } = use(loadGeo());
  const prefs = useMemo(() => areas.filter((a) => a.code !== "00"), [areas]);
  const defaultAct = activities.find((a) => a.code === "07")?.code ?? activities[0]!.code;

  const [activity, setActivity] = useUrlState<string>("activity", defaultAct, (v) =>
    activities.some((a) => a.code === v),
  );
  const [sex, setSex] = useUrlState<Sex>("sex", "total", (v) =>
    SEXES.some((s) => s.value === v),
  );
  const [day, setDay] = useUrlState<DayType>("day", "week", (v) =>
    DAYS.some((d) => d.value === v),
  );
  const [year, setYear] = useUrlState<string>("year", years[0]!, (v) => years.includes(v));
  const [area, setArea] = useUrlState<string>("area", "", (v) =>
    v === "" || prefs.some((a) => a.code === v),
  );

  const [hovered, setHovered] = useState<string | null>(null);
  const current = activities.find((a) => a.code === activity)!;
  const pinned = area === "" ? null : area;
  const focus = pinned ?? hovered;

  const seriesFor = (code: string) =>
    cube.series("minutes", "year", {
      activity: code,
      sex,
      day,
      area: "00",
    });

  const tiles = useMemo(
    () =>
      prefs.map((a) => ({
        code: a.code,
        label: a.label,
        minutes: cube.at("minutes", {
          activity,
          sex,
          day,
          year,
          area: a.code,
        }),
        relative: cube.at("relative", {
          activity,
          sex,
          day,
          year,
          area: a.code,
        }),
      })),
    [prefs, cube, activity, sex, day, year],
  );

  const ranks = useMemo(
    () =>
      tiles.map((t) => ({
        code: t.code,
        label: t.label,
        minutes: t.minutes,
        relative: t.relative,
      })),
    [tiles],
  );

  const national = cube.at("minutes", {
    activity,
    sex,
    day,
    year,
    area: "00",
  });
  const focusTile = focus ? tiles.find((t) => t.code === focus) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-h-[calc(100dvh-7rem)] overflow-y-auto max-lg:max-h-none max-lg:w-full lg:sticky lg:top-16">
        <ActivityList
          activities={activities}
          selected={activity}
          onSelect={setActivity}
          seriesFor={seriesFor}
        />
        <p className="pt-4 text-[11px] leading-relaxed text-faint">{NOTES.geo}</p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div>
            <h2 className="text-[19px] font-semibold tracking-tight">{current.label}</h2>
            <p className="tnum pt-1 text-[12px] text-muted">
              全国 {national !== null ? `${int.format(national)} 分` : "—"}
              {focusTile
                ? ` · ${focusTile.label} ${
                    focusTile.minutes !== null ? `${int.format(focusTile.minutes)} 分` : "—"
                  }`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <YearSelect years={years} value={year} onChange={setYear} />
            <Segmented options={SEXES} value={sex} onChange={setSex} label="性別" />
            <Segmented options={DAYS} value={day} onChange={setDay} label="曜日" />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
          <TileMap
            tiles={tiles}
            hovered={hovered}
            onHover={setHovered}
            pinned={pinned}
            onPin={(code) => setArea(code ?? "")}
          />
          <div>
            <h3 className="pb-2 text-[12px] font-semibold text-muted">都道府県順位</h3>
            <AreaRanking
              rows={ranks}
              highlighted={focus}
              onHover={setHovered}
              onSelect={(code) => setArea(code)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
