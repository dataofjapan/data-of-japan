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
  MARRIAGE_TYPES,
  PREF_AREAS,
  SEXES,
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

function pctToShare(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
}

async function buildEra(
  overview: Table,
  avgAge: Table,
  firstRemarriage: Table,
  cohabit: Table,
) {
  const years = unionYears(
    yearsFromAxis(overview),
    yearsFromAxis(avgAge),
    yearsFromAxis(firstRemarriage),
    yearsFromAxis(cohabit),
  );
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

  const overviewGet = (cat: string, year: string) =>
    overview.get({ 人口動態総覧: cat, 時間軸: timeFromYear(year) });

  const avgAgeTab = avgAge.axis("表章").items[0]!["@code"];
  const avgGet = (cat: string, year: string) =>
    avgAge.get({
      表章: avgAgeTab,
      平均婚姻年齢: cat,
      時間軸: timeFromYear(year),
    });

  const frPct = firstRemarriage.codeOf("表章", "百分率");
  const frGet = (tab: string, cat: string, year: string) => {
    try {
      return firstRemarriage.get({
        表章: tab,
        婚姻数: cat,
        時間軸: timeFromYear(year),
      });
    } catch {
      return null;
    }
  };

  const cohabitGet = (cat: string, year: string) => {
    try {
      return cohabit.get({ 同居期間: cat, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };

  for (const year of years) {
    cube.set("value", ["marriage_count", year], round(overviewGet("00270", year), 0));
    cube.set("value", ["divorce_count", year], round(overviewGet("00280", year), 0));
    cube.set("value", ["marriage_rate", year], round(overviewGet("00420", year), 2));
    cube.set("value", ["divorce_rate", year], round(overviewGet("00430", year), 2));

    cube.set("value", ["avg_age_first_husband", year], round(avgGet("00120", year), 2));
    cube.set("value", ["avg_age_first_wife", year], round(avgGet("00130", year), 2));

    cube.set(
      "value",
      ["remarriage_share_husband", year],
      pctToShare(frGet(frPct, "00150", year)),
    );
    cube.set("value", ["remarriage_share_wife", year], pctToShare(frGet(frPct, "00160", year)));

    cube.set("value", ["avg_cohabit", year], round(cohabitGet("00400", year), 2));
    cube.set(
      "value",
      ["cohabit_under5_share", year],
      pctToShare(cohabitGet("00260", year)),
    );
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildAge(ageCount: Table, ageRate: Table) {
  const ageCodes = AGE_BANDS.map((a) => a.code);
  const sexCodes = SEXES.map((s) => s.code);
  const typeCodes = MARRIAGE_TYPES.map((t) => t.code);
  const years = unionYears(yearsFromAxis(ageCount), yearsFromAxis(ageRate));

  const ages: DictEntry[] = AGE_BANDS.map((a) => ({
    code: a.code,
    label: a.label,
    level: 1,
  }));
  const sexes: DictEntry[] = SEXES.map((s) => ({
    code: s.code,
    label: s.label,
    level: 1,
  }));
  const types: DictEntry[] = MARRIAGE_TYPES.map((t) => ({
    code: t.code,
    label: t.label,
    level: 1,
  }));

  const cube = new Cube(
    [
      { name: "age", codes: ageCodes },
      { name: "sex", codes: sexCodes },
      { name: "type", codes: typeCodes },
      { name: "year", codes: years },
    ],
    ["count", "rate"],
  );

  const countTab = ageCount.axis("表章").items[0]!["@code"];
  const rateTab = ageRate.axis("表章").items[0]!["@code"];

  for (const year of years) {
    for (const sex of SEXES) {
      for (const typ of MARRIAGE_TYPES) {
        for (const age of AGE_BANDS) {
          let count: number | null = null;
          let rate: number | null = null;
          try {
            count = ageCount.get({
              表章: countTab,
              年齢: age.code,
              "夫・妻": sex.estat,
              "初婚・再婚": typ.estat,
              時間軸: timeFromYear(year),
            });
          } catch {
            count = null;
          }
          try {
            rate = ageRate.get({
              表章: rateTab,
              年齢: age.code,
              "夫・妻": sex.estat,
              "初婚・再婚": typ.estat,
              時間軸: timeFromYear(year),
            });
          } catch {
            rate = null;
          }
          cube.set("count", [age.code, sex.code, typ.code, year], round(count, 0));
          cube.set("rate", [age.code, sex.code, typ.code, year], round(rate, 2));
        }
      }
    }
  }

  await writeJson("age", { ...cube.toJSON(), ages, sexes, types });
}

async function buildGeo(geoMarriage: Table, geoDivorce: Table, geoAvgAge: Table) {
  const metrics = GEO_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
  const metricCodes = GEO_METRICS.map((m) => m.code);

  const years = unionYears(
    yearsFromAxis(geoMarriage),
    yearsFromAxis(geoDivorce),
    yearsFromAxis(geoAvgAge),
  );

  const areaAxis = geoMarriage.axis("都道府県");
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

  const mRate = geoMarriage.codeOf("表章", "婚姻率");
  const dRate = geoDivorce.codeOf("表章", "離婚率");
  const ageTab = geoAvgAge.axis("表章").items[0]!["@code"];
  const husband = geoAvgAge.codeOf("夫・妻", "夫");
  const wife = geoAvgAge.codeOf("夫・妻", "妻");

  const getM = (tab: string, area: string, year: string) => {
    try {
      return geoMarriage.get({ 表章: tab, 都道府県: area, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };
  const getD = (tab: string, area: string, year: string) => {
    try {
      return geoDivorce.get({ 表章: tab, 都道府県: area, 時間軸: timeFromYear(year) });
    } catch {
      return null;
    }
  };
  const getAge = (sex: string, area: string, year: string) => {
    try {
      return geoAvgAge.get({
        表章: ageTab,
        "夫・妻": sex,
        都道府県: area,
        時間軸: timeFromYear(year),
      });
    } catch {
      return null;
    }
  };

  for (const year of years) {
    const national: Record<string, number | null> = {
      marriage_rate: round(getM(mRate, "00000", year), 2),
      divorce_rate: round(getD(dRate, "00000", year), 2),
      avg_age_first_husband: round(getAge(husband, "00000", year), 2),
      avg_age_first_wife: round(getAge(wife, "00000", year), 2),
    };

    for (const area of PREF_AREAS) {
      const values: Record<string, number | null> = {
        marriage_rate: round(getM(mRate, area, year), 2),
        divorce_rate: round(getD(dRate, area, year), 2),
        avg_age_first_husband: round(getAge(husband, area, year), 2),
        avg_age_first_wife: round(getAge(wife, area, year), 2),
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
  const overview = await loadTable("overview");
  const avgAge = await loadTable("avg-age");
  const firstRemarriage = await loadTable("first-remarriage");
  const cohabit = await loadTable("cohabit");
  const ageCount = await loadTable("age-count");
  const ageRate = await loadTable("age-rate");
  const geoMarriage = await loadTable("geo-marriage");
  const geoDivorce = await loadTable("geo-divorce");
  const geoAvgAge = await loadTable("geo-avg-age");

  console.log("build era...");
  await buildEra(overview, avgAge, firstRemarriage, cohabit);
  console.log("build age...");
  await buildAge(ageCount, ageRate);
  console.log("build geo...");
  await buildGeo(geoMarriage, geoDivorce, geoAvgAge);
  console.log("done");
}

await main();
