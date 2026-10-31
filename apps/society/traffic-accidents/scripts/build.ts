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
  ERA_FROM,
  ERA_METRICS,
  ERA_TO,
  GEO_FROM,
  GEO_METRICS,
  HARM_CODES,
  HARM_DIMS,
  HARM_FROM,
  HARM_TO,
  NPA_TREND_TO,
  PREF_AREAS,
  PREF_LABELS,
  type HarmDim,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

function npaYearCode(year: number): string {
  return `${year}000000`;
}

function ssdsYearCode(year: number): string {
  return `${year}100000`;
}

function yearsInclusive(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total === 0) return null;
  return round(part / total, 4);
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function metricsDict(list: typeof ERA_METRICS): DictEntry[] {
  return list.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
}

function npaTrendGet(t: Table, tab: string, year: number): number | null {
  return t.get({
    表章項目: tab,
    "時間軸（年次）": npaYearCode(year),
  });
}

function ssdsGet(t: Table, code: string, area: string, year: number): number | null {
  const timeName = t.axis("調査年").name;
  const catName = [...t.axes.values()].find((a) => a.id === "cat01")!.name;
  const areaName = t.axis("地域").name;
  return t.get({
    観測値: "00001",
    [catName]: code,
    [areaName]: area,
    [timeName]: ssdsYearCode(year),
  });
}

function stateCasualtyGet(t: Table, state: string, kind: string, year: number): number | null {
  return t.get({
    状態: state,
    死傷者種別: kind,
    "時間軸（年次）": npaYearCode(year),
  });
}

function stateInjuryGet(t: Table, state: string, year: number): number | null {
  return t.get({
    表章項目: "1190",
    状態: state,
    "時間軸（年次）": npaYearCode(year),
  });
}

function ageGet(t: Table, age: string, year: number, tab: string): number | null {
  return t.get({
    表章項目: tab,
    年齢層: age,
    "時間軸（年次）": npaYearCode(year),
  });
}

async function buildEra(npa: Table, ssdsCount: Table, ssdsRate: Table) {
  const metrics = metricsDict(ERA_METRICS);
  const years = yearsInclusive(ERA_FROM, ERA_TO);
  const metricCodes = ERA_METRICS.map((m) => m.code);

  const cube = new Cube([{ name: "metric", codes: metricCodes }, { name: "year", codes: years }], [
    "people",
    "rate",
  ]);

  for (const yearStr of years) {
    const year = Number(yearStr);
    const fromNpa = year <= NPA_TREND_TO;
    const fromSsds = year >= GEO_FROM;

    for (const m of ERA_METRICS) {
      let people: number | null = null;
      let rate: number | null = null;

      if (m.kind === "count") {
        if (fromNpa && m.npaTab) {
          people = npaTrendGet(npa, m.npaTab, year);
        } else if (!fromNpa && fromSsds && m.ssdsCount) {
          people = ssdsGet(ssdsCount, m.ssdsCount, "00000", year);
        }
      } else {
        if (fromNpa && m.npaTab) {
          rate = npaTrendGet(npa, m.npaTab, year);
        } else if (!fromNpa && fromSsds && m.ssdsRate) {
          rate = ssdsGet(ssdsRate, m.ssdsRate, "00000", year);
        } else if (!m.npaTab && fromSsds && m.ssdsRate) {
          // 発生件数の人口比は NPA 長期表に無く、SSDS のみ。
          rate = ssdsGet(ssdsRate, m.ssdsRate, "00000", year);
        }
      }

      cube.set("people", [m.code, yearStr], people === null ? null : round(people, 0));
      cube.set("rate", [m.code, yearStr], rate === null ? null : round(rate, 2));
    }
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildHarm(
  stateCasualties: Table,
  stateInjuries: Table,
  ageDeaths: Table,
  ageInjuries: Table,
) {
  const formDims = HARM_DIMS.map((d) => ({ code: d.id, label: d.label, level: 1 }));
  const codes = HARM_CODES.map((c) => ({
    code: c.code,
    label: c.label,
    level: c.level,
    parent: c.dim,
  }));

  const dimIds = HARM_DIMS.map((d) => d.id);
  const codeIds = [...new Set(HARM_CODES.map((c) => c.code))];
  const years = yearsInclusive(HARM_FROM, HARM_TO);

  const cube = new Cube(
    [
      { name: "dim", codes: dimIds },
      { name: "code", codes: codeIds },
      { name: "year", codes: years },
    ],
    ["people", "share"],
  );

  const totalRaw: Record<HarmDim, string> = {
    state_death: "110",
    state_injury: "110",
    age_death: "110",
    age_injury: "110",
  };

  for (const yearStr of years) {
    const year = Number(yearStr);

    const totals: Record<HarmDim, number | null> = {
      state_death: stateCasualtyGet(stateCasualties, totalRaw.state_death, "120", year),
      state_injury: stateInjuryGet(stateInjuries, totalRaw.state_injury, year),
      age_death: ageGet(ageDeaths, totalRaw.age_death, year, "1080"),
      age_injury: ageGet(ageInjuries, totalRaw.age_injury, year, "1190"),
    };

    for (const c of HARM_CODES) {
      let people: number | null = null;
      if (c.dim === "state_death") {
        people = stateCasualtyGet(stateCasualties, c.raw, "120", year);
      } else if (c.dim === "state_injury") {
        people = stateInjuryGet(stateInjuries, c.raw, year);
      } else if (c.dim === "age_death") {
        people = ageGet(ageDeaths, c.raw, year, "1080");
      } else {
        people = ageGet(ageInjuries, c.raw, year, "1190");
      }

      cube.set("people", [c.dim, c.code, yearStr], people === null ? null : round(people, 0));
      cube.set("share", [c.dim, c.code, yearStr], shareOf(people, totals[c.dim]));
    }
  }

  await writeJson("harm", { ...cube.toJSON(), formDims, codes });
}

async function buildGeo(ssdsCount: Table, ssdsRate: Table) {
  const metrics = metricsDict(GEO_METRICS);
  const years = yearsInclusive(GEO_FROM, ERA_TO);
  const metricCodes = GEO_METRICS.map((m) => m.code);

  const areas: DictEntry[] = PREF_AREAS.map((code) => ({
    code,
    label: PREF_LABELS[code] ?? code,
    level: code === "00000" ? 0 : 1,
  }));

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "year", codes: years },
      { name: "area", codes: [...PREF_AREAS] },
    ],
    ["value", "relative"],
  );

  for (const yearStr of years) {
    const year = Number(yearStr);

    for (const m of GEO_METRICS) {
      const national =
        m.kind === "count" && m.ssdsCount
          ? ssdsGet(ssdsCount, m.ssdsCount, "00000", year)
          : m.ssdsRate
            ? ssdsGet(ssdsRate, m.ssdsRate, "00000", year)
            : null;

      for (const area of PREF_AREAS) {
        const value =
          m.kind === "count" && m.ssdsCount
            ? ssdsGet(ssdsCount, m.ssdsCount, area, year)
            : m.ssdsRate
              ? ssdsGet(ssdsRate, m.ssdsRate, area, year)
              : null;
        const relative =
          value !== null && national !== null && national !== 0
            ? round(value / national, 4)
            : null;
        cube.set(
          "value",
          [m.code, yearStr, area],
          value === null ? null : m.kind === "count" ? round(value, 0) : round(value, 2),
        );
        cube.set("relative", [m.code, yearStr, area], relative);
      }
    }
  }

  await writeJson("geo", { ...cube.toJSON(), metrics, areas });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("load tables...");
  const npa = await loadTable("npa-trend");
  const ssdsCount = await loadTable("ssds-count");
  const ssdsRate = await loadTable("ssds-rate");
  const stateCasualties = await loadTable("state-casualties");
  const stateInjuries = await loadTable("state-injuries");
  const ageDeaths = await loadTable("age-deaths");
  const ageInjuries = await loadTable("age-injuries");
  console.log("build era...");
  await buildEra(npa, ssdsCount, ssdsRate);
  console.log("build harm...");
  await buildHarm(stateCasualties, stateInjuries, ageDeaths, ageInjuries);
  console.log("build geo...");
  await buildGeo(ssdsCount, ssdsRate);
  console.log("done");
}

await main();
