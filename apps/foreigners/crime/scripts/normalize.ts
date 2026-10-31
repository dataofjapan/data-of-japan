/**
 * 129・132・133 を data/normalized/book.json にする。
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readBook } from "../src/lib/parse/table.ts";

const RAW_DIR = resolve(import.meta.dirname, "../data/raw");
const OUT = resolve(import.meta.dirname, "../data/normalized/book.json");

async function main(): Promise<void> {
  const book = readBook(RAW_DIR);
  await mkdir(resolve(OUT, ".."), { recursive: true });
  await writeFile(OUT, JSON.stringify(book));
  console.log(`  ${book.years[0]}–${book.years.at(-1)}  ${book.nations.length}か国  ${OUT}`);
}

if (import.meta.main) await main();
