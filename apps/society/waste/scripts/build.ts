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
  ERA_TO,
  FLOW_CODES,
  METRICS,
  PREF_AREAS,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

function timeCode(year: string): string {
  return `${year}100000`;
}

function yearsInclusive(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total === 0) return null;
  return round(part / total, 4);
}

function ratePctToFrac(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function metricsDict(list = METRICS): DictEntry[] {
  return list.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
}

function getSsds(t: Table, code: string, area: string, year: string): number | null {
  return t.get({
    観測値: "00001",
    "Ｈ　居住": code,
    地域: area,
    調査年: timeCode(year),
  });
}

async function buildEra(counts: Table, rates: Table) {
  const metrics = metricsDict();
  const years = yearsInclusive(ERA_FROM, ERA_TO);
  const metricCodes = METRICS.map((m) => m.code);

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "year", codes: years },
    ],
    ["tonnes", "intensity", "rate"],
  );

  for (const year of years) {
    for (const m of METRICS) {
      let tonnes: number | null = null;
      let intensity: number | null = null;
      let rate: number | null = null;

      if (m.kind === "tonnes" && m.countCode) {
        tonnes = getSsds(counts, m.countCode, "00000", year);
      } else if (m.kind === "intensity" && m.countCode) {
        const v = getSsds(counts, m.countCode, "00000", year);
        intensity = v === null ? null : round(v, 1);
      } else if (m.kind === "volume" && m.countCode) {
        // 残余容量は m³。tonnes スロットに載せる
        tonnes = getSsds(counts, m.countCode, "00000", year);
      } else if (m.kind === "rate") {
        if (m.countCode) {
          rate = ratePctToFrac(getSsds(counts, m.countCode, "00000", year));
        }
        if (rate === null && m.rateCode) {
          rate = ratePctToFrac(getSsds(rates, m.rateCode, "00000", year));
        }
      }

      cube.set("tonnes", [m.code, year], tonnes === null ? null : round(tonnes, 0));
      cube.set("intensity", [m.code, year], intensity);
      cube.set("rate", [m.code, year], rate);
    }
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildFlow(counts: Table) {
  const codes = FLOW_CODES.map((c) => ({
    code: c.code,
    label: c.label,
    level: 1,
    parent: c.group,
  }));
  const codeIds = FLOW_CODES.map((c) => c.code);
  const years = yearsInclusive(ERA_FROM, ERA_TO);

  const cube = new Cube(
    [
      { name: "code", codes: codeIds },
      { name: "year", codes: years },
    ],
    ["tonnes", "share"],
  );

  for (const year of years) {
    const total = getSsds(counts, "H5609", "00000", year);
    for (const c of FLOW_CODES) {
      const tonnes = getSsds(counts, c.countCode, "00000", year);
      cube.set("tonnes", [c.code, year], tonnes === null ? null : round(tonnes, 0));
      cube.set("share", [c.code, year], shareOf(tonnes, total));
    }
  }

  await writeJson("flow", { ...cube.toJSON(), codes });
}

async function buildGeo(counts: Table, rates: Table) {
  const geoMetrics = METRICS.filter((m) => m.geo);
  const metrics = metricsDict(geoMetrics);
  const years = yearsInclusive(ERA_FROM, ERA_TO);
  const metricCodes = geoMetrics.map((m) => m.code);

  const areaAxis = counts.axis("地域");
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

  for (const year of years) {
    for (const m of geoMetrics) {
      const national = readGeoValue(counts, rates, m, "00000", year);

      for (const area of PREF_AREAS) {
        const value = readGeoValue(counts, rates, m, area, year);
        const relative =
          value !== null && national !== null && national !== 0
            ? round(value / national, 4)
            : null;
        cube.set("value", [m.code, year, area], value);
        cube.set("relative", [m.code, year, area], relative);
      }
    }
  }

  await writeJson("geo", { ...cube.toJSON(), metrics, areas });
}

function readGeoValue(
  counts: Table,
  rates: Table,
  m: (typeof METRICS)[number],
  area: string,
  year: string,
): number | null {
  if (m.kind === "intensity" && m.countCode) {
    const v = getSsds(counts, m.countCode, area, year);
    return v === null ? null : round(v, 1);
  }
  if (m.kind === "volume") {
    const fromCount = m.countCode ? getSsds(counts, m.countCode, area, year) : null;
    if (fromCount !== null) return round(fromCount, 0);
    if (m.rateCode) {
      const v = getSsds(rates, m.rateCode, area, year);
      return v === null ? null : round(v, 0);
    }
    return null;
  }
  if (m.kind === "rate") {
    if (m.countCode) {
      const v = ratePctToFrac(getSsds(counts, m.countCode, area, year));
      if (v !== null) return v;
    }
    if (m.rateCode) return ratePctToFrac(getSsds(rates, m.rateCode, area, year));
  }
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("load tables...");
  const counts = await loadTable("ssds-count");
  const rates = await loadTable("ssds-rate");
  console.log("build era...");
  await buildEra(counts, rates);
  console.log("build flow...");
  await buildFlow(counts);
  console.log("build geo...");
  await buildGeo(counts, rates);
  console.log("done");
}

await main();
