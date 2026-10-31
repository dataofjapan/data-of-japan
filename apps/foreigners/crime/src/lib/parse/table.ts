/**
 * 犯罪統計書の外国人の表を読む。
 *
 * 129: 年次別の検挙件数・検挙人員。来日とその他。刑法犯と特別法犯は別。
 * 132: 来日外国人の刑法犯を国籍別に年次で。
 * 133: 来日外国人の特別法犯を国籍別に年次で。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { COUNTRIES, LAWS, type LawId } from "../data/labels.ts";

type Cell = string | number | boolean | null | undefined;

export interface Book {
  years: number[];
  laws: LawId[];
  cases: number[][][];
  people: number[][][];
  nations: string[];
  nationCases: number[][][];
  nationPeople: number[][][];
}

function clean(value: Cell): string {
  if (value == null) return "";
  return String(value).normalize("NFKC").replace(/\s+/g, "");
}

function integer(value: Cell): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function sheetRows(path: string, name: string): Cell[][] {
  const book = XLSX.read(readFileSync(path));
  const sheet = book.Sheets[name];
  if (sheet === undefined) throw new Error(`${path} にシート ${name} がない`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true }) as Cell[][];
}

function yearColumns(row: Cell[]): { index: number; year: number }[] {
  const found: { index: number; year: number }[] = [];
  row.forEach((cell, index) => {
    const match = clean(cell).match(/^(\d{4})年$/);
    if (match?.[1] !== undefined) found.push({ index, year: Number(match[1]) });
  });
  return found;
}

interface NationSheet {
  years: number[];
  total: number[];
  leaves: { name: string; values: number[] }[];
}

function readNationSheet(path: string, name: string): NationSheet {
  const rows = sheetRows(path, name);
  const header = rows.findIndex((row) => yearColumns(row).length >= 8);
  if (header < 0) throw new Error(`${name}: 年の見出しがない`);
  const cols = yearColumns(rows[header] ?? []);
  const first = cols[0]?.index;
  if (first === undefined) throw new Error(`${name}: 年の列がない`);
  const leaves: { name: string; values: number[] }[] = [];
  let total: number[] | null = null;
  for (const row of rows.slice(header + 1)) {
    const texts = row.slice(0, first).map(clean).filter((text) => text !== "");
    if (texts.some((text) => text.startsWith("注"))) break;
    if (texts.length === 0 || texts.every((text) => text === "国籍")) continue;
    const values = cols.map(({ index, year }) => {
      const value = integer(row[index]);
      if (value === null) throw new Error(`${name} ${year}年 ${texts.join("/")} が整数でない`);
      return value;
    });
    if (texts.includes("総数")) {
      total = values;
      continue;
    }
    if (texts.includes("計")) continue;
    const label = texts.at(-1);
    if (label === undefined) continue;
    leaves.push({ name: label, values });
  }
  if (total === null) throw new Error(`${name}: 総数がない`);
  total.forEach((value, index) => {
    const got = leaves.reduce((acc, row) => acc + (row.values[index] ?? 0), 0);
    if (got !== value) throw new Error(`${name} ${cols[index]?.year}年 国籍の合計 ${got} が総数 ${value} と違う`);
  });
  return { years: cols.map((col) => col.year), total, leaves };
}

function readAnnual(path: string): { years: number[]; cases: number[][][]; people: number[][][] } {
  const rows = sheetRows(path, "129");
  let law: number | null = null;
  const years: number[] = [];
  const cases: number[][][] = [[[], []], [[], []]];
  const people: number[][][] = [[[], []], [[], []]];
  for (const row of rows) {
    const name = clean(row[1]);
    if (name.startsWith("刑法犯")) law = 0;
    else if (name.startsWith("特別法犯")) law = 1;
    const match = clean(row[3]).match(/^(\d{4})年$/);
    if (match?.[1] === undefined || law === null) continue;
    const year = Number(match[1]);
    const totalCases = integer(row[4]);
    const totalPeople = integer(row[5]);
    const visitCases = integer(row[6]);
    const visitPeople = integer(row[7]);
    const otherCases = integer(row[8]);
    const otherPeople = integer(row[9]);
    if (
      totalCases === null ||
      totalPeople === null ||
      visitCases === null ||
      visitPeople === null ||
      otherCases === null ||
      otherPeople === null
    ) {
      throw new Error(`129 ${year}年の件数が整数でない`);
    }
    if (visitCases + otherCases !== totalCases || visitPeople + otherPeople !== totalPeople) {
      throw new Error(`129 ${year}年 来日とその他の和が総数と違う`);
    }
    const at = cases[law]?.[0]?.length ?? 0;
    if (law === 0) years.push(year);
    else if (years[at] !== year) throw new Error(`特別法犯の ${year}年 が刑法犯の並びと違う`);
    cases[law]![0]!.push(visitCases);
    cases[law]![1]!.push(otherCases);
    people[law]![0]!.push(visitPeople);
    people[law]![1]!.push(otherPeople);
  }
  if (years.length === 0) throw new Error("129: 年がない");
  return { years, cases, people };
}

function sameYears(label: string, years: number[], other: number[]): void {
  if (years.join() !== other.join()) throw new Error(`${label} の年が 129 と違う`);
}

function countryValues(sheet: NationSheet, name: string): number[] {
  const found = sheet.leaves.filter((row) => row.name === name);
  if (found.length !== 1) throw new Error(`${name} の行が ${found.length} ある`);
  return found[0]!.values;
}

export function readBook(dir: string): Book {
  const annual = readAnnual(resolve(dir, "129.xlsx"));
  const penalCases = readNationSheet(resolve(dir, "132.xlsx"), "01");
  const penalPeople = readNationSheet(resolve(dir, "132.xlsx"), "02");
  const specialCases = readNationSheet(resolve(dir, "133.xlsx"), "01");
  const specialPeople = readNationSheet(resolve(dir, "133.xlsx"), "02");
  sameYears("132 件数", annual.years, penalCases.years);
  sameYears("132 人員", annual.years, penalPeople.years);
  sameYears("133 件数", annual.years, specialCases.years);
  sameYears("133 人員", annual.years, specialPeople.years);
  annual.years.forEach((_, index) => {
    if (penalCases.total[index] !== annual.cases[0]?.[0]?.[index]) {
      throw new Error(`${annual.years[index]}年 刑法犯の来日件数が 129 と 132 で違う`);
    }
    if (penalPeople.total[index] !== annual.people[0]?.[0]?.[index]) {
      throw new Error(`${annual.years[index]}年 刑法犯の来日人員が 129 と 132 で違う`);
    }
    if (specialCases.total[index] !== annual.cases[1]?.[0]?.[index]) {
      throw new Error(`${annual.years[index]}年 特別法犯の来日件数が 129 と 133 で違う`);
    }
    if (specialPeople.total[index] !== annual.people[1]?.[0]?.[index]) {
      throw new Error(`${annual.years[index]}年 特別法犯の来日人員が 129 と 133 で違う`);
    }
  });
  const latest = annual.years.length - 1;
  const nations = [...COUNTRIES].sort(
    (a, b) => countryValues(penalCases, b)[latest]! - countryValues(penalCases, a)[latest]!,
  );
  return {
    years: annual.years,
    laws: LAWS.map((law) => law.id),
    cases: annual.cases,
    people: annual.people,
    nations,
    nationCases: [nations.map((name) => countryValues(penalCases, name)), nations.map((name) => countryValues(specialCases, name))],
    nationPeople: [nations.map((name) => countryValues(penalPeople, name)), nations.map((name) => countryValues(specialPeople, name))],
  };
}
