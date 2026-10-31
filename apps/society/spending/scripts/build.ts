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
  AGES,
  ATTRS_YEAR_FROM,
  CONSUMPTION_ESTAT,
  ITEMS,
  YEAR_FROM,
  YEAR_TO,
  householdEstat,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

const YEARS = Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) =>
  String(YEAR_FROM + i),
);
const ATTR_YEARS = Array.from(
  { length: YEAR_TO - ATTRS_YEAR_FROM + 1 },
  (_, i) => String(ATTRS_YEAR_FROM + i),
);

function timeEstat(year: string): string {
  return `${year}000000`;
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function getYen(
  t: Table,
  catCode: string,
  year: string,
  hh: string,
  ageCode?: string,
): number | null {
  const sel: Record<string, string> = {
    表章項目: "01",
    用途分類: catCode,
    世帯区分: hh,
    地域: "00000",
    時間軸: timeEstat(year),
  };
  if (ageCode !== undefined) {
    sel["年齢"] = ageCode;
  }
  return t.get(sel);
}

function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total === 0) return null;
  return round(part / total, 4);
}

function pctToFrac(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
}

async function buildEra(t: Table) {
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
    ["yen", "share"],
  );

  for (const year of YEARS) {
    const y = Number(year);
    const hh = householdEstat(y);
    const total = getYen(t, CONSUMPTION_ESTAT, year, hh);
    for (const item of eraItems) {
      const raw = getYen(t, item.estat, year, hh);
      if (item.kind === "engel") {
        cube.set("yen", [item.code, year], null);
        cube.set("share", [item.code, year], pctToFrac(raw));
      } else {
        cube.set("yen", [item.code, year], raw === null ? null : round(raw, 0));
        cube.set("share", [item.code, year], shareOf(raw, total));
      }
    }
  }

  await writeJson("era", { ...cube.toJSON(), items });
}

async function buildItem(t: Table) {
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
    ["yen", "share"],
  );

  for (const year of YEARS) {
    const hh = householdEstat(Number(year));
    const total = getYen(t, CONSUMPTION_ESTAT, year, hh);
    for (const item of itemItems) {
      const raw = getYen(t, item.estat, year, hh);
      cube.set("yen", [item.code, year], raw === null ? null : round(raw, 0));
      cube.set("share", [item.code, year], shareOf(raw, total));
    }
  }

  await writeJson("item", { ...cube.toJSON(), items });
}

async function buildAttrs(t: Table) {
  const attrItems = ITEMS.filter((i) => i.attrs);
  const items: DictEntry[] = attrItems.map((i) => ({
    code: i.code,
    label: i.label,
    level: i.level,
    parent: i.group,
  }));
  const ages: DictEntry[] = AGES.map((a) => ({
    code: a.code,
    label: a.label,
    level: a.group === "summary" ? 0 : 1,
    parent: a.group,
  }));

  const cube = new Cube(
    [
      { name: "age", codes: AGES.map((a) => a.code) },
      { name: "item", codes: attrItems.map((i) => i.code) },
      { name: "year", codes: ATTR_YEARS },
    ],
    ["yen", "share"],
  );

  for (const age of AGES) {
    for (const year of ATTR_YEARS) {
      const total = getYen(t, CONSUMPTION_ESTAT, year, "03", age.estat);
      for (const item of attrItems) {
        const raw = getYen(t, item.estat, year, "03", age.estat);
        cube.set(
          "yen",
          [age.code, item.code, year],
          raw === null ? null : round(raw, 0),
        );
        cube.set("share", [age.code, item.code, year], shareOf(raw, total));
      }
    }
  }

  await writeJson("attrs", { ...cube.toJSON(), ages, items });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("loading raw tables…");
  const total = await loadTable("use-total");
  const age = await loadTable("use-age");

  console.log("building cubes…");
  await buildEra(total);
  await buildItem(total);
  await buildAttrs(age);
  console.log("done");
}

await main();
