/**
 * 令和6年の統計書と、犯罪白書が掲げる令和6年の数を照合する。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CrimeJson } from "../src/lib/data/cube.ts";

const SRC = resolve(import.meta.dirname, "../public/data/crime.json");

const ANNOUNCED = {
  year: 2024,
  penalCases: 18861,
  penalPeople: 10464,
  visitPenalCases: 13405,
  visitPenalPeople: 6368,
  visitSpecialCases: 8389,
  visitSpecialPeople: 5802,
  vietnamCases: 5992,
  chinaCases: 1987,
};

function at(cube: CrimeJson, law: number, group: number, series: "cases" | "people", year: number): number {
  const index = cube.years.indexOf(year);
  const value = cube[series][law]?.[group]?.[index];
  if (value === undefined) throw new Error(`${year} の値がない`);
  return value;
}

function nation(cube: CrimeJson, law: number, name: string, year: number): number {
  const yi = cube.years.indexOf(year);
  const ni = cube.nations.indexOf(name);
  const value = cube.nationCases[law]?.[ni]?.[yi];
  if (value === undefined) throw new Error(`${name} ${year} がない`);
  return value;
}

function check(label: string, got: number, expected: number): void {
  if (got !== expected) throw new Error(`${label}: ${got} !== ${expected}`);
  console.log(`  ok ${label} ${got}`);
}

function main(): void {
  const cube = JSON.parse(readFileSync(SRC, "utf8")) as CrimeJson;
  const year = ANNOUNCED.year;
  check("刑法犯 総件数", at(cube, 0, 0, "cases", year) + at(cube, 0, 1, "cases", year), ANNOUNCED.penalCases);
  check("刑法犯 総人員", at(cube, 0, 0, "people", year) + at(cube, 0, 1, "people", year), ANNOUNCED.penalPeople);
  check("来日 刑法犯 件数", at(cube, 0, 0, "cases", year), ANNOUNCED.visitPenalCases);
  check("来日 刑法犯 人員", at(cube, 0, 0, "people", year), ANNOUNCED.visitPenalPeople);
  check("来日 特別法犯 件数", at(cube, 1, 0, "cases", year), ANNOUNCED.visitSpecialCases);
  check("来日 特別法犯 人員", at(cube, 1, 0, "people", year), ANNOUNCED.visitSpecialPeople);
  check("ベトナム 刑法犯 件数", nation(cube, 0, "ベトナム", year), ANNOUNCED.vietnamCases);
  check("中国 刑法犯 件数", nation(cube, 0, "中国", year), ANNOUNCED.chinaCases);
  if (cube.years[0] !== 2015 || cube.years.at(-1) !== 2024) throw new Error(`年の範囲が違う ${cube.years[0]}–${cube.years.at(-1)}`);
  console.log(`  ok ${cube.years.length}年`);
}

main();
