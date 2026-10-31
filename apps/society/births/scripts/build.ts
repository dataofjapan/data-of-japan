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
  AGE_BANDS,
  ERA_METRICS,
  GEO_METRICS,
  PREF_AREAS,
  timeFromYear,
  yearFromTime,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function yearsFromAxis(t: Table, fragment = "時間軸"): string[] {
  return t
    .axis(fragment)
    .items.map((c) => yearFromTime(c["@code"]))
    .sort((a, b) => Number(a) - Number(b));
}

function unionYears(...lists: string[][]): string[] {
  return [...new Set(lists.flat())].sort((a, b) => Number(a) - Number(b));
}

async function buildEra(birthsYear: Table, avgAge: Table) {
  const years = unionYears(yearsFromAxis(birthsYear), yearsFromAxis(avgAge));
  const metricCodes = ERA_METRICS.map((m) => m.code);
  const metrics: DictEntry[] = ERA_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));

  const cube = new Cube([{ name: "metric", codes: metricCodes }, { name: "year", codes: years }], [
    "value",
  ]);

  const yearGet = (cat: string, year: string) => {
    try {
      return birthsYear.get({ 出生数: cat, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };

  const avgTab = avgAge.axis("表章").items[0]!["@code"];
  const orderTotal = avgAge.codeOf("出生順位", "総数");
  const father = avgAge.codeOf("父・母", "父");
  const mother = avgAge.codeOf("父・母", "母");
  const avgGet = (parent: string, year: string) => {
    try {
      return avgAge.get({
        表章: avgTab,
        出生順位: orderTotal,
        "父・母": parent,
        時間軸: timeFromYear(year),
      });
    } catch {
      return null;
    }
  };

  for (const year of years) {
    cube.set("value", ["birth_count", year], round(yearGet("00100", year), 0));
    cube.set("value", ["birth_rate", year], round(yearGet("00130", year), 2));
    cube.set("value", ["sex_ratio", year], round(yearGet("00140", year), 1));
    cube.set("value", ["tfr", year], round(yearGet("00150", year), 2));
    cube.set("value", ["avg_age_father", year], round(avgGet(father, year), 2));
    cube.set("value", ["avg_age_mother", year], round(avgGet(mother, year), 2));
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildAge(ageMother: Table) {
  const ageCodes = AGE_BANDS.map((a) => a.code);
  const years = yearsFromAxis(ageMother);
  const ages: DictEntry[] = AGE_BANDS.map((a) => ({
    code: a.code,
    label: a.label,
    level: 1,
  }));

  const cube = new Cube(
    [
      { name: "age", codes: ageCodes },
      { name: "year", codes: years },
    ],
    ["count", "rate"],
  );

  const get = (cat: string, year: string) => {
    try {
      return ageMother.get({ 母の年齢: cat, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };

  for (const year of years) {
    for (const age of AGE_BANDS) {
      cube.set("count", [age.code, year], round(get(age.countCode, year), 0));
      cube.set("rate", [age.code, year], round(get(age.rateCode, year), 2));
    }
  }

  await writeJson("age", { ...cube.toJSON(), ages });
}

async function buildGeo(geoBirth: Table, geoTfr: Table) {
  const metrics = GEO_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
  const metricCodes = GEO_METRICS.map((m) => m.code);
  const years = unionYears(yearsFromAxis(geoBirth), yearsFromAxis(geoTfr));

  const areaAxis = geoBirth.axis("都道府県");
  const areas: DictEntry[] = PREF_AREAS.map((code) => {
    if (code === "00000") return { code, label: "全国", level: 0 };
    const item = areaAxis.items.find((c) => c["@code"] === code);
    return { code, label: item?.["@name"] ?? code, level: 1 };
  });

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "year", codes: years },
      { name: "area", codes: [...PREF_AREAS] },
    ],
    ["value", "relative"],
  );

  const birthRate = geoBirth.codeOf("表章", "出生率");
  const tfrTab = geoTfr.axis("表章").items[0]!["@code"];

  const getBirth = (area: string, year: string) => {
    try {
      return geoBirth.get({ 表章: birthRate, 都道府県: area, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };
  const getTfr = (area: string, year: string) => {
    try {
      return geoTfr.get({ 表章: tfrTab, 都道府県: area, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };

  for (const year of years) {
    const national: Record<string, number | null> = {
      birth_rate: round(getBirth("00000", year), 2),
      tfr: round(getTfr("00000", year), 2),
    };

    for (const area of PREF_AREAS) {
      const values: Record<string, number | null> = {
        birth_rate: round(getBirth(area, year), 2),
        tfr: round(getTfr(area, year), 2),
      };

      for (const m of GEO_METRICS) {
        const value = values[m.code] ?? null;
        const nat = national[m.code] ?? null;
        const relative =
          value !== null && nat !== null && nat !== 0 ? round(value / nat, 4) : null;
        cube.set("value", [m.code, year, area], value);
        cube.set("relative", [m.code, year, area], relative);
      }
    }
  }

  await writeJson("geo", { ...cube.toJSON(), metrics, areas });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("load tables...");
  const birthsYear = await loadTable("births-year");
  const avgAge = await loadTable("avg-age");
  const ageMother = await loadTable("age-mother");
  const geoBirth = await loadTable("geo-birth");
  const geoTfr = await loadTable("geo-tfr");

  console.log("build era...");
  await buildEra(birthsYear, avgAge);
  console.log("build age...");
  await buildAge(ageMother);
  console.log("build geo...");
  await buildGeo(geoBirth, geoTfr);
  console.log("done");
}

await main();
