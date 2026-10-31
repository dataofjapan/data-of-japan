/**
 * 生データから配信用 cube を組み立てて public/data/ に書き出す。
 *
 *   npm run data
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadTable, type Table } from "../src/lib/transform/table.ts";
import { Cube, round } from "../src/lib/transform/cube.ts";
import { formatBytes } from "../src/lib/cache.ts";
import type { DictEntry } from "../src/app/data/cube.ts";
import {
  GEO_MODES,
  MODE_CODE_MAP,
  MODE_CODES,
  PREF_AREAS,
  PREF_LABELS,
  SELECTABLE_MODES,
  SURVEY_YEARS,
  type ModeCode,
  type SurveyYear,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

const DATASET_KEY: Record<SurveyYear, string> = {
  "1990": "census-1990",
  "2000": "census-2000",
  "2010": "census-2010",
  "2020": "census-2020",
};

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total === 0) return null;
  return round(part / total, 4);
}

function relativeOf(part: number | null, national: number | null): number | null {
  if (part === null || national === null || national === 0) return null;
  return round(part / national, 3);
}

function yearTimeCode(year: SurveyYear): string {
  return `${year}000000`;
}

/** 軸名のゆれを吸収して値を取る。 */
function axisById(t: Table, id: string) {
  return [...t.axes.values()].find((a) => a.id === id);
}

function getRaw(t: Table, year: SurveyYear, modeRaw: string, area: string): number | null {
  const time = axisById(t, "time")!;
  const areaAxis = axisById(t, "area")!;
  const coords: Record<string, string> = {
    [time.name]: yearTimeCode(year),
    [areaAxis.name]: area,
  };

  if (year === "2020") {
    const tab = axisById(t, "tab")!;
    const cat01 = axisById(t, "cat01")!;
    const cat02 = axisById(t, "cat02")!;
    coords[tab.name] = tab.items[0]!["@code"];
    coords[cat01.name] = modeRaw;
    coords[cat02.name] = "0"; // 常住地による人口
  } else if (year === "2010" || year === "2000") {
    const tab = axisById(t, "tab")!;
    const cat01 = axisById(t, "cat01")!;
    // 人数側（割合タブがある場合は人数を優先）
    const countTab =
      tab.items.find((c) => /通学者数|就業者/.test(c["@name"])) ?? tab.items[0]!;
    coords[tab.name] = countTab["@code"];
    coords[cat01.name] = modeRaw;
  } else {
    // 1990
    const cat01 = axisById(t, "cat01")!;
    const cat02 = axisById(t, "cat02")!;
    coords[cat01.name] = "04"; // 常住地による自宅外就業者・通学者
    coords[cat02.name] = modeRaw;
  }

  return t.get(coords);
}

function getMode(t: Table, year: SurveyYear, mode: ModeCode, area: string): number | null {
  const raw = MODE_CODE_MAP[year][mode];
  const codes = typeof raw === "string" ? [raw] : [...raw];
  let sum = 0;
  let any = false;
  for (const code of codes) {
    const v = getRaw(t, year, code, area);
    if (v !== null) {
      sum += v;
      any = true;
    }
  }
  return any ? sum : null;
}

function metricsDict(list: readonly { code: string; label: string; group: string }[]): DictEntry[] {
  return list.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
}

async function buildAll(tables: Record<SurveyYear, Table>) {
  const years = [...SURVEY_YEARS];
  const eraMetrics = metricsDict([
    { code: "total", label: "通勤・通学者総数", group: "全体" },
    ...SELECTABLE_MODES,
  ]);
  const modeCodes = metricsDict(SELECTABLE_MODES);
  const geoMetrics = metricsDict(GEO_MODES);
  const areas: DictEntry[] = PREF_AREAS.map((code) => ({
    code,
    label: PREF_LABELS[code] ?? code,
    level: code === "00000" ? 0 : 1,
  }));

  const era = new Cube(
    [
      { name: "metric", codes: eraMetrics.map((m) => m.code) },
      { name: "year", codes: years },
    ],
    ["people", "share"],
  );

  const mode = new Cube(
    [
      { name: "code", codes: MODE_CODES },
      { name: "year", codes: years },
    ],
    ["people", "share"],
  );

  const geo = new Cube(
    [
      { name: "metric", codes: geoMetrics.map((m) => m.code) },
      { name: "year", codes: years },
      { name: "area", codes: [...PREF_AREAS] },
    ],
    ["value", "relative"],
  );

  for (const year of SURVEY_YEARS) {
    const t = tables[year];
    const nationalTotal = getMode(t, year, "total", "00000");

    // era + mode（全国）
    const totalPeople = nationalTotal;
    era.set("people", ["total", year], totalPeople === null ? null : round(totalPeople, 0));
    era.set("share", ["total", year], 1);

    for (const m of SELECTABLE_MODES) {
      const people = getMode(t, year, m.code, "00000");
      const share = shareOf(people, totalPeople);
      era.set("people", [m.code, year], people === null ? null : round(people, 0));
      era.set("share", [m.code, year], share);
      mode.set("people", [m.code, year], people === null ? null : round(people, 0));
      mode.set("share", [m.code, year], share);
    }

    // geo
    for (const area of PREF_AREAS) {
      const areaTotal = getMode(t, year, "total", area);
      for (const m of GEO_MODES) {
        const people = getMode(t, year, m.code, area);
        const share = shareOf(people, areaTotal);
        const nationalShare = shareOf(getMode(t, year, m.code, "00000"), nationalTotal);
        geo.set("value", [m.code, year, area], share);
        geo.set(
          "relative",
          [m.code, year, area],
          area === "00000" ? 1 : relativeOf(share, nationalShare),
        );
      }
    }
  }

  await writeJson("era", { ...era.toJSON(), metrics: eraMetrics });
  await writeJson("mode", { ...mode.toJSON(), codes: modeCodes });
  await writeJson("geo", { ...geo.toJSON(), metrics: geoMetrics, areas });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("load tables...");
  const tables = {} as Record<SurveyYear, Table>;
  for (const year of SURVEY_YEARS) {
    tables[year] = await loadTable(DATASET_KEY[year]);
  }
  console.log("build cubes...");
  await buildAll(tables);
  console.log("done");
}

await main();
