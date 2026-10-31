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
  RATE_FROM,
  RATE_METRICS,
  RATE_TO,
  SCHOOL_FROM,
  SCHOOL_TO,
  SCHOOLS,
  SEXES,
  type Sex,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

function annualTime(year: number): string {
  return `${year}000000`;
}

function ssdsTime(year: number): string {
  return `${year}100000`;
}

function pctToRate(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
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

function rateYears(): string[] {
  return Array.from({ length: RATE_TO - RATE_FROM + 1 }, (_, i) => String(RATE_FROM + i));
}

function schoolYears(): string[] {
  return Array.from({ length: SCHOOL_TO - SCHOOL_FROM + 1 }, (_, i) => String(SCHOOL_FROM + i));
}

function getAnnual(t: Table, metricCode: string, sexCode: string, year: number): number | null {
  return t.get({
    表章項目: "0000000820",
    性別: sexCode,
    "学校種別（年次統計　進学率）": metricCode,
    都道府県別: "00000",
    "時間軸（年次）": annualTime(year),
  });
}

function getSsds(t: Table, code: string, year: number): number | null {
  return t.get({
    観測値: "00001",
    "Ｅ　教育": code,
    地域: "00000",
    調査年: ssdsTime(year),
  });
}

function resolveRate(
  annual: Table,
  ssds: Table,
  metric: (typeof RATE_METRICS)[number],
  sex: Sex,
  year: number,
): number | null {
  const sexDef = SEXES.find((s) => s.code === sex)!;
  const fromAnnual = pctToRate(getAnnual(annual, metric.annualCode, sexDef.annualCode, year));
  if (fromAnnual !== null) return fromAnnual;

  if (metric.ssds === undefined) return null;
  const ssdsCode = metric.ssds[sex];
  return pctToRate(getSsds(ssds, ssdsCode, year));
}

async function buildEra(annual: Table, ssds: Table) {
  const years = rateYears();
  const metricCodes = RATE_METRICS.map((m) => m.code);
  const metrics: DictEntry[] = RATE_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "year", codes: years },
    ],
    ["rate"],
  );

  for (const year of years) {
    const y = Number(year);
    for (const m of RATE_METRICS) {
      cube.set("rate", [m.code, year], resolveRate(annual, ssds, m, "total", y));
    }
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildGender(annual: Table, ssds: Table) {
  const years = rateYears();
  const metricCodes = RATE_METRICS.map((m) => m.code);
  const sexCodes = SEXES.map((s) => s.code);
  const metrics: DictEntry[] = RATE_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
  const sexes: DictEntry[] = SEXES.map((s) => ({
    code: s.code,
    label: s.label,
    level: 1,
  }));

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "sex", codes: sexCodes },
      { name: "year", codes: years },
    ],
    ["rate", "gap"],
  );

  for (const year of years) {
    const y = Number(year);
    for (const m of RATE_METRICS) {
      const total = resolveRate(annual, ssds, m, "total", y);
      const male = resolveRate(annual, ssds, m, "male", y);
      const female = resolveRate(annual, ssds, m, "female", y);

      cube.set("rate", [m.code, "total", year], total);
      cube.set("rate", [m.code, "male", year], male);
      cube.set("rate", [m.code, "female", year], female);

      const gap =
        male !== null && female !== null ? round(female - male, 4) : null;
      cube.set("gap", [m.code, "total", year], gap);
      cube.set("gap", [m.code, "male", year], null);
      cube.set("gap", [m.code, "female", year], null);
    }
  }

  await writeJson("gender", { ...cube.toJSON(), metrics, sexes });
}

async function buildSchool(ssds: Table) {
  const years = schoolYears();
  const schoolCodes = SCHOOLS.map((s) => s.code);
  const schools: DictEntry[] = SCHOOLS.map((s) => ({
    code: s.code,
    label: s.label,
    level: 1,
  }));

  const cube = new Cube(
    [
      { name: "school", codes: schoolCodes },
      { name: "year", codes: years },
    ],
    ["enrollment", "share"],
  );

  for (const year of years) {
    const y = Number(year);
    const values = SCHOOLS.map((s) => ({
      code: s.code,
      enrollment: getSsds(ssds, s.countCode, y),
    }));
    const denom = values.reduce<number | null>((sum, row) => {
      if (row.enrollment === null) return sum;
      return (sum ?? 0) + row.enrollment;
    }, null);

    for (const row of values) {
      cube.set(
        "enrollment",
        [row.code, year],
        row.enrollment === null ? null : round(row.enrollment, 0),
      );
      cube.set("share", [row.code, year], shareOf(row.enrollment, denom));
    }
  }

  await writeJson("school", { ...cube.toJSON(), schools });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("build education cubes");

  const annual = await loadTable("advancement");
  const ssds = await loadTable("ssds-edu");

  await buildEra(annual, ssds);
  await buildGender(annual, ssds);
  await buildSchool(ssds);

  console.log("done");
}

await main();
