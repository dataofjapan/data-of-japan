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
  ADVANCED_TOTAL,
  GRADUATES,
  PATHS,
  SCHOOLS,
  SEXES,
  YEAR_FROM,
  YEAR_TO,
  type Sex,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

function ssdsTime(year: number): string {
  return `${year}100000`;
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

function years(): string[] {
  return Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => String(YEAR_FROM + i));
}

function getSsds(t: Table, code: string, year: number, area = "00000"): number | null {
  return t.get({
    観測値: "00001",
    "Ｅ　教育": code,
    地域: area,
    調査年: ssdsTime(year),
  });
}

async function buildEra(ssds: Table) {
  const ys = years();
  const pathCodes = PATHS.map((p) => p.code);
  const paths: DictEntry[] = PATHS.map((p) => ({
    code: p.code,
    label: p.label,
    level: 1,
    parent: p.group,
  }));

  const cube = new Cube(
    [
      { name: "path", codes: pathCodes },
      { name: "year", codes: ys },
    ],
    ["count", "share"],
  );

  for (const year of ys) {
    const y = Number(year);
    const grads = getSsds(ssds, GRADUATES.countCode, y);
    for (const p of PATHS) {
      const count = getSsds(ssds, p.countCode, y);
      cube.set("count", [p.code, year], count === null ? null : round(count, 0));
      cube.set("share", [p.code, year], shareOf(count, grads));
    }
  }

  // メタ検証用に卒業者・進学者計も辞書へ（measures には載せない）
  const meta = {
    graduatesCode: GRADUATES.countCode,
    advancedCode: ADVANCED_TOTAL.countCode,
  };

  await writeJson("era", { ...cube.toJSON(), paths, meta });
}

async function buildSchool(ssds: Table) {
  const ys = years();
  const schoolCodes = SCHOOLS.map((s) => s.code);
  const schools: DictEntry[] = SCHOOLS.map((s) => ({
    code: s.code,
    label: s.label,
    level: 1,
    parent: s.group,
  }));

  // 構成比の分母は高等教育（短大・大学・専修・各種）。高校は参照用で share=null。
  const tertiary = SCHOOLS.filter((s) => s.group === "高等教育");

  const cube = new Cube(
    [
      { name: "school", codes: schoolCodes },
      { name: "year", codes: ys },
    ],
    ["enrollment", "share"],
  );

  for (const year of ys) {
    const y = Number(year);
    const values = SCHOOLS.map((s) => ({
      code: s.code,
      group: s.group,
      enrollment: getSsds(ssds, s.countCode, y),
    }));
    const denom = values
      .filter((row) => tertiary.some((t) => t.code === row.code))
      .reduce<number | null>((sum, row) => {
        if (row.enrollment === null) return sum;
        return (sum ?? 0) + row.enrollment;
      }, null);

    for (const row of values) {
      cube.set(
        "enrollment",
        [row.code, year],
        row.enrollment === null ? null : round(row.enrollment, 0),
      );
      const share =
        row.group === "高等教育" ? shareOf(row.enrollment, denom) : null;
      cube.set("share", [row.code, year], share);
    }
  }

  await writeJson("school", { ...cube.toJSON(), schools });
}

async function buildGender(ssds: Table) {
  const ys = years();
  // 男女がある学校種のみ
  const gendered = SCHOOLS.filter((s) => s.sexCodes !== undefined);
  const schoolCodes = gendered.map((s) => s.code);
  const sexCodes = SEXES.map((s) => s.code);
  const schools: DictEntry[] = gendered.map((s) => ({
    code: s.code,
    label: s.label,
    level: 1,
    parent: s.group,
  }));
  const sexes: DictEntry[] = SEXES.map((s) => ({
    code: s.code,
    label: s.label,
    level: 1,
  }));

  const cube = new Cube(
    [
      { name: "school", codes: schoolCodes },
      { name: "sex", codes: sexCodes },
      { name: "year", codes: ys },
    ],
    ["enrollment", "female_share"],
  );

  for (const year of ys) {
    const y = Number(year);
    for (const s of gendered) {
      const total = getSsds(ssds, s.countCode, y);
      const male = getSsds(ssds, s.sexCodes!.male, y);
      const female = getSsds(ssds, s.sexCodes!.female, y);
      const bySex: Record<Sex, number | null> = {
        total,
        male,
        female,
      };

      for (const sex of SEXES) {
        const v = bySex[sex.code];
        cube.set(
          "enrollment",
          [s.code, sex.code, year],
          v === null ? null : round(v, 0),
        );
        // female_share は計セルにだけ載せる（女 / 計）
        const fs =
          sex.code === "total" ? shareOf(female, total) : null;
        cube.set("female_share", [s.code, sex.code, year], fs);
      }
    }
  }

  await writeJson("gender", { ...cube.toJSON(), schools, sexes });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("build schools cubes");

  const ssds = await loadTable("ssds-edu");

  await buildEra(ssds);
  await buildSchool(ssds);
  await buildGender(ssds);

  console.log("done");
}

await main();
