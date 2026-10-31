/**
 * 地域ビュー。都道府県 × 傷病の受療率（令和5年）。
 */

import { use, useMemo, useState } from "react";
import { loadGeo } from "../data/chunks.ts";
import { listChapters } from "../data/hierarchy.ts";
import { AreaTypes, type StandoutRow } from "../components/AreaTypes.tsx";
import { TypePicker, type PickerRow } from "../components/TypePicker.tsx";
import { TileMap, type Tile } from "../components/TileMap.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const STANDOUT = 5;

const SETTINGS = [
  { value: "inpatient", label: "入院" },
  { value: "outpatient", label: "外来" },
] as const;

const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const rateFmt = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Headline({
  ranked,
  national,
}: {
  ranked: (Tile & { relative: number })[];
  national: number | null;
}) {
  const certain = ranked.filter((t) => t.certain);
  if (certain.length === 0) {
    return (
      <span className="text-muted">
        どの県も全国との差が小さい。全国{" "}
        {national === null ? "—" : rateFmt.format(national)}。
      </span>
    );
  }
  const top = certain[0]!;
  const bottom = certain.at(-1)!;
  if (certain.length === 1 || top.code === bottom.code) {
    return (
      <span className="text-muted">
        目立つのは{" "}
        <span className="font-semibold text-ink">
          {top.label} {one.format(top.relative)}
        </span>
      </span>
    );
  }
  return (
    <span className="text-muted">
      最も高い{" "}
      <span className="font-semibold text-ink">
        {top.label} {one.format(top.relative)}
      </span>
      {"  ／  最も低い "}
      <span className="font-semibold text-ink">
        {bottom.label} {one.format(bottom.relative)}
      </span>
    </span>
  );
}

export function GeoView() {
  const { diseases, areas, settings, cube } = use(loadGeo());
  const selectable = useMemo(() => listChapters(diseases), [diseases]);

  const [setting, setSetting] = useUrlState<string>("setting", "inpatient", (v) =>
    SETTINGS.some((s) => s.value === v),
  );
  const [disease, setDisease] = useUrlState<string>(
    "disease",
    selectable.find((d) => d.code === "01")?.code ?? selectable[0]!.code,
    (v) => selectable.some((c) => c.code === v),
  );
  const [area, setArea] = useUrlState<string>("area", "", (v) =>
    v === "" || areas.some((a) => a.code === v && a.code !== "00000"),
  );
  const [hovered, setHovered] = useState<string | null>(null);

  const prefectures = useMemo(() => areas.slice(1), [areas]);
  const currentMeta = selectable.find((m) => m.code === disease) ?? selectable[0]!;
  const settingLabel = settings.find((s) => s.code === setting)?.label ?? setting;

  const values = cube.series("rate", "area", { setting, disease });
  const relatives = cube.series("relative", "area", { setting, disease });
  const national = values[0] ?? null;

  const picker = useMemo((): PickerRow[] => {
    return selectable.map((m) => {
      const v = cube.at("rate", { setting, disease: m.code, area: "00000" });
      return {
        code: m.code,
        label: m.label,
        households: v === null ? 0 : Math.round(v),
        display: v === null ? "—" : rateFmt.format(v),
      };
    });
  }, [selectable, cube, setting]);

  const tiles = useMemo(
    (): Tile[] =>
      prefectures.map((a, i) => {
        const relative = relatives[i + 1] ?? null;
        const value = values[i + 1] ?? null;
        const certain =
          relative !== null && value !== null && Math.abs(relative - 1) >= 0.05;
        return {
          code: a.code,
          label: a.label,
          relative,
          households: value === null ? null : Math.round(value),
          certain,
        };
      }),
    [prefectures, relatives, values],
  );

  const ranked = useMemo(
    () =>
      tiles
        .filter((t): t is Tile & { relative: number } => t.relative !== null)
        .sort((a, b) => b.relative - a.relative),
    [tiles],
  );

  const rankOf = useMemo(
    () => new Map(ranked.map((t, i) => [t.code, i + 1])),
    [ranked],
  );

  const areaIndex = area === "" ? -1 : areas.findIndex((a) => a.code === area);
  const pinnedTile = areaIndex < 1 ? undefined : tiles.find((t) => t.code === area);

  const standout = useMemo(() => {
    const empty = {
      high: [] as StandoutRow[],
      low: [] as StandoutRow[],
      moreHigh: 0,
      moreLow: 0,
    };
    if (areaIndex < 1) return empty;

    const mid = selectable.flatMap((m) => {
      const relative = cube.at("relative", {
        setting,
        disease: m.code,
        area: areas[areaIndex]!.code,
      });
      const value = cube.at("rate", {
        setting,
        disease: m.code,
        area: areas[areaIndex]!.code,
      });
      if (relative === null || value === null) return [];
      if (Math.abs(relative - 1) < 0.08) return [];
      return [
        {
          code: m.code,
          label: m.label,
          households: Math.round(value),
          relative,
        } satisfies StandoutRow,
      ];
    });

    const highAll = mid.filter((r) => r.relative > 1).sort((a, b) => b.relative - a.relative);
    const lowAll = mid.filter((r) => r.relative < 1).sort((a, b) => a.relative - b.relative);
    return {
      high: highAll.slice(0, STANDOUT),
      low: lowAll.slice(0, STANDOUT),
      moreHigh: Math.max(0, highAll.length - STANDOUT),
      moreLow: Math.max(0, lowAll.length - STANDOUT),
    };
  }, [areaIndex, selectable, cube, setting, areas]);

  const focusCode = hovered ?? (area === "" ? null : area);
  const focus = focusCode === null ? undefined : tiles.find((t) => t.code === focusCode);
  const focusValue =
    focusCode === null
      ? null
      : (values[areas.findIndex((a) => a.code === focusCode)] ?? null);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100dvh-3rem)] lg:flex-col lg:self-start">
        <h2 className="flex items-baseline justify-between px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          <span>傷病分類</span>
          <span className="font-normal">全国の受療率</span>
        </h2>
        <div className="mb-2 px-2">
          <Segmented
            label="入院・外来"
            value={setting}
            onChange={setSetting}
            options={SETTINGS.map((s) => ({ value: s.value, label: s.label }))}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TypePicker rows={picker} selected={disease} onSelect={setDisease} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-3">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">
              {currentMeta.label}
              <span className="ml-2 text-[13px] font-normal text-muted">
                {settingLabel}・令和5年
              </span>
            </h1>
            <p className="pt-1 text-[12.5px]">
              <Headline ranked={ranked} national={national} />
            </p>
          </div>
          {focus && (
            <p className="tnum text-right text-[12px] text-muted">
              {focus.label}
              <span className="ml-2 font-semibold text-ink">
                {focusValue === null ? "—" : rateFmt.format(focusValue)}
              </span>
              <span className="ml-2 text-faint">
                全国比 {focus.relative === null ? "—" : one.format(focus.relative)}
                {rankOf.has(focus.code) ? ` · ${rankOf.get(focus.code)}位` : ""}
              </span>
            </p>
          )}
        </header>

        <TileMap
          tiles={tiles}
          hovered={hovered}
          onHover={setHovered}
          pinned={area === "" ? null : area}
          onPin={(code) => setArea(code ?? "")}
        />

        {pinnedTile && (
          <AreaTypes
            areaLabel={pinnedTile.label}
            high={standout.high}
            low={standout.low}
            moreHigh={standout.moreHigh}
            moreLow={standout.moreLow}
            selected={disease}
            onSelect={setDisease}
            onClear={() => setArea("")}
          />
        )}

        <p className="mt-6 border-t border-rule pt-4 text-[11.5px] leading-relaxed text-faint">
          升目は全国を1とした受療率の相対値。尺度は傷病横断で共通（1/1.5〜1.5）。
          都道府県編第37表（患者住所地）。
        </p>
      </main>
    </div>
  );
}
