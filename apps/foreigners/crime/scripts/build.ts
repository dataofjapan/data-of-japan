/**
 * 正規化 JSON を配信用の public/data/crime.json にする。
 */

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { CrimeJson } from "../src/lib/data/cube.ts";
import { GROUPS, LAWS } from "../src/lib/data/labels.ts";
import type { Book } from "../src/lib/parse/table.ts";

const SRC = resolve(import.meta.dirname, "../data/normalized/book.json");
const OUT = resolve(import.meta.dirname, "../public/data/crime.json");

async function main(): Promise<void> {
  const book = JSON.parse(readFileSync(SRC, "utf8")) as Book;
  const cube: CrimeJson = {
    years: book.years,
    laws: LAWS.map((law) => ({ id: law.id, label: law.label, note: law.note })),
    groups: [...GROUPS],
    cases: book.cases,
    people: book.people,
    nations: book.nations,
    nationCases: book.nationCases,
    nationPeople: book.nationPeople,
  };
  await mkdir(resolve(OUT, ".."), { recursive: true });
  await writeFile(OUT, JSON.stringify(cube));
  const last = cube.years.length - 1;
  const penal = (cube.cases[0]?.[0]?.[last] ?? 0) + (cube.cases[0]?.[1]?.[last] ?? 0);
  console.log(`  ${cube.years[0]}–${cube.years.at(-1)}  刑法犯 ${penal}件  ${OUT}`);
}

if (import.meta.main) await main();
