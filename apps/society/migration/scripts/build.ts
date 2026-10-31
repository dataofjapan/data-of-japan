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
  GEO_METRICS,
  METRO_AREA,
  PREF_AREAS,
  PREF_LABELS,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

function yearCode(year: number): string {
  return `${year}000000`;
}

function yearsInclusive(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function metricsDict(list: readonly { code: string; label: string; group: string }[]): DictEntry[] {
  return list.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
}

/** 長期全国表: 移動者数（日本人・総数）。 */
function nationalLongGet(t: Table, kind: "movers" | "intra" | "inter", year: number): number | null {
  const cat04 = kind === "movers" ? "001" : kind === "intra" ? "002" : "003";
  return t.get({
    "移動者数・対前年増加率・移動率・人口": "014",
    国籍: "61000",
    "性別・性比": "001",
    "移動者数・県内・県間": cat04,
    全国: "00000",
    年次: yearCode(year),
  });
}

/** 長期三大都市圏表。 */
function metroLongGet(
  t: Table,
  metro: "002" | "003" | "004",
  measure: "001" | "002" | "003",
  year: number,
): number | null {
  return t.get({
    "３大都市圏": metro,
    "転入・転出・転入超過・転入超過率": measure,
    国籍: "61000",
    年次: yearCode(year),
  });
}

/** 年報実数（2010–）: 表章 × 地域 × 年。 */
function annualRecentGet(t: Table, tab: "01" | "02" | "03" | "04", area: string, year: number): number | null {
  const timeName = t.axis("時間軸").name;
  const tabName = t.axis("表章").name;
  const areaName = t.axis("地域").name;
  // 性別・国籍は fetch 時に絞っているが、軸は残る場合がある。
  const coords: Record<string, string> = {
    [tabName]: tab,
    [areaName]: area,
    [timeName]: yearCode(year),
  };
  for (const axis of t.axes.values()) {
    if (axis.id === "cat01" || axis.name.includes("性別")) {
      const total = axis.items.find((c) => c["@name"] === "総数" || c["@code"] === "0");
      if (total) coords[axis.name] = total["@code"];
    }
    if (axis.id === "cat02" || axis.name.includes("国籍")) {
      const jp = axis.items.find((c) => c["@code"] === "61000");
      if (jp) coords[axis.name] = jp["@code"];
    }
  }
  return t.get(coords);
}

/** 年報総数（1999–2019）: 表章 × 地域 × 年（国籍・今年は fetch で絞る）。 */
function annualHistGet(t: Table, tab: "01" | "02" | "03" | "04", area: string, year: number): number | null {
  const timeName = t.axis("時間軸").name;
  const tabName = t.axis("表章").name;
  const areaName = t.axis("地域").name;
  const coords: Record<string, string> = {
    [tabName]: tab,
    [areaName]: area,
    [timeName]: yearCode(year),
  };
  for (const axis of t.axes.values()) {
    if (axis.name.includes("国籍")) {
      const jp = axis.items.find((c) => c["@code"] === "61000");
      if (jp) coords[axis.name] = jp["@code"];
    }
    if (axis.name.includes("推移")) {
      const thisYear = axis.items.find((c) => c["@code"] === "03" || c["@name"] === "今年");
      if (thisYear) coords[axis.name] = thisYear["@code"];
    }
  }
  return t.get(coords);
}

async function buildEra(national: Table, metro: Table, recent: Table) {
  const metrics = metricsDict(ERA_METRICS);
  const years = yearsInclusive(ERA_FROM, ERA_TO);
  const metricCodes = ERA_METRICS.map((m) => m.code);

  const cube = new Cube([{ name: "metric", codes: metricCodes }, { name: "year", codes: years }], [
    "people",
  ]);

  for (const yearStr of years) {
    const year = Number(yearStr);
    const fromLong = year <= 2019;
    const fromRecent = year >= 2010;

    let movers: number | null = null;
    let intra: number | null = null;
    let inter: number | null = null;
    let tokyoIn: number | null = null;
    let tokyoOut: number | null = null;
    let tokyoNet: number | null = null;
    let nagoyaNet: number | null = null;
    let osakaNet: number | null = null;

    if (fromLong) {
      movers = nationalLongGet(national, "movers", year);
      intra = nationalLongGet(national, "intra", year);
      inter = nationalLongGet(national, "inter", year);
      tokyoIn = metroLongGet(metro, "002", "001", year);
      tokyoOut = metroLongGet(metro, "002", "002", year);
      tokyoNet = metroLongGet(metro, "002", "003", year);
      nagoyaNet = metroLongGet(metro, "003", "003", year);
      osakaNet = metroLongGet(metro, "004", "003", year);
    }

    if (!fromLong && fromRecent) {
      intra = annualRecentGet(recent, "01", "00000", year);
      inter = annualRecentGet(recent, "02", "00000", year);
      movers =
        intra !== null && inter !== null ? round(intra + inter, 0) : intra ?? inter;
      tokyoIn = annualRecentGet(recent, "02", METRO_AREA.tokyo, year);
      tokyoOut = annualRecentGet(recent, "03", METRO_AREA.tokyo, year);
      tokyoNet = annualRecentGet(recent, "04", METRO_AREA.tokyo, year);
      nagoyaNet = annualRecentGet(recent, "04", METRO_AREA.nagoya, year);
      osakaNet = annualRecentGet(recent, "04", METRO_AREA.osaka, year);
    }

    const values: Record<string, number | null> = {
      movers,
      intra,
      inter,
      tokyo_net: tokyoNet,
      tokyo_in: tokyoIn,
      tokyo_out: tokyoOut,
      nagoya_net: nagoyaNet,
      osaka_net: osakaNet,
    };

    for (const m of ERA_METRICS) {
      const v = values[m.code] ?? null;
      cube.set("people", [m.code, yearStr], v === null ? null : round(v, 0));
    }
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildGeo(hist: Table, recent: Table) {
  const metrics = metricsDict(GEO_METRICS);
  const years = yearsInclusive(1999, ERA_TO);
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
    ["value"],
  );

  for (const yearStr of years) {
    const year = Number(yearStr);
    const useRecent = year >= 2010;

    for (const area of PREF_AREAS) {
      const get = (tab: "02" | "03" | "04") =>
        useRecent
          ? annualRecentGet(recent, tab, area, year)
          : annualHistGet(hist, tab, area, year);

      const inbound = get("02");
      const outbound = get("03");
      const net = get("04");

      cube.set("value", ["in", yearStr, area], inbound === null ? null : round(inbound, 0));
      cube.set("value", ["out", yearStr, area], outbound === null ? null : round(outbound, 0));
      cube.set("value", ["net", yearStr, area], net === null ? null : round(net, 0));
    }
  }

  await writeJson("geo", { ...cube.toJSON(), metrics, areas });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("load tables...");
  const national = await loadTable("national-long");
  const metro = await loadTable("metro-long");
  const recent = await loadTable("annual-recent");
  const hist = await loadTable("annual-hist");
  console.log("build era...");
  await buildEra(national, metro, recent);
  console.log("build geo...");
  await buildGeo(hist, recent);
  console.log("done");
}

await main();
