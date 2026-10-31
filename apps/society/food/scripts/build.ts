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
  CALORIE_TOTAL_ESTAT,
  ITEMS,
  SUPPLY_METRICS,
  YEAR_FROM,
  YEAR_TO,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

const YEARS = Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) =>
  String(YEAR_FROM + i),
);

function yearEstat(year: string): string {
  // 1001 = 1960年度
  const n = Number(year) - YEAR_FROM + 1001;
  return String(n);
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function getItemYear(t: Table, itemCode: string, year: string): number | null {
  const itemAxis = t.axis("類別");
  const yearAxis = t.axis("年度");
  return t.get({
    [itemAxis.name]: itemCode,
    [yearAxis.name]: yearEstat(year),
  });
}

function getSupply(t: Table, axisHint: string, code: string, year: string): number | null {
  const metricAxis = t.axis(axisHint);
  const yearAxis = t.axis("年度");
  return t.get({
    [metricAxis.name]: code,
    [yearAxis.name]: yearEstat(year),
  });
}

function pctToFrac(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
}

async function buildEra(kg: Table, kcal: Table) {
  const eraItems = ITEMS.filter((i) => i.era);
  const items: DictEntry[] = eraItems.map((i) => ({
    code: i.code,
    label: i.label,
    level: i.level,
    parent: i.group,
  }));
  const codes = eraItems.map((i) => i.code);

  const cube = new Cube(
    [
      { name: "item", codes },
      { name: "year", codes: YEARS },
    ],
    ["kg", "kcal"],
  );

  for (const item of eraItems) {
    for (const year of YEARS) {
      cube.set("kg", [item.code, year], round(getItemYear(kg, item.estat, year), 2));
      cube.set("kcal", [item.code, year], round(getItemYear(kcal, item.estat, year), 1));
    }
  }

  await writeJson("era", { ...cube.toJSON(), items });
}

async function buildItem(kg: Table, kcal: Table) {
  const itemItems = ITEMS.filter((i) => i.item);
  const items: DictEntry[] = itemItems.map((i) => ({
    code: i.code,
    label: i.label,
    level: i.level,
    parent: i.group,
  }));
  const codes = itemItems.map((i) => i.code);

  const cube = new Cube(
    [
      { name: "item", codes },
      { name: "year", codes: YEARS },
    ],
    ["kg", "kcal", "share"],
  );

  for (const year of YEARS) {
    const total = getItemYear(kcal, CALORIE_TOTAL_ESTAT, year);
    for (const item of itemItems) {
      const kgV = getItemYear(kg, item.estat, year);
      const kcalV = getItemYear(kcal, item.estat, year);
      const share =
        kcalV === null || total === null || total === 0 ? null : round(kcalV / total, 4);
      cube.set("kg", [item.code, year], round(kgV, 2));
      cube.set("kcal", [item.code, year], round(kcalV, 1));
      cube.set("share", [item.code, year], share);
    }
  }

  await writeJson("item", { ...cube.toJSON(), items });
}

async function buildSupply(itemT: Table, totalT: Table) {
  const metrics: DictEntry[] = SUPPLY_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
  const codes = SUPPLY_METRICS.map((m) => m.code);

  const cube = new Cube(
    [
      { name: "metric", codes },
      { name: "year", codes: YEARS },
    ],
    ["rate"],
  );

  for (const m of SUPPLY_METRICS) {
    const table = m.source === "total" ? totalT : itemT;
    const axisHint = m.source === "total" ? "総合自給率" : "品目";
    for (const year of YEARS) {
      cube.set("rate", [m.code, year], pctToFrac(getSupply(table, axisHint, m.estat, year)));
    }
  }

  await writeJson("supply", { ...cube.toJSON(), metrics });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("loading raw tables…");
  const kg = await loadTable("per-capita-pure");
  const kcal = await loadTable("calories");
  const ssItem = await loadTable("self-suff-item");
  const ssTotal = await loadTable("self-suff-total");

  console.log("building cubes…");
  await buildEra(kg, kcal);
  await buildItem(kg, kcal);
  await buildSupply(ssItem, ssTotal);
  console.log("done");
}

await main();
