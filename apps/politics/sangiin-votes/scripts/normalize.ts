/**
 * data/raw/ の結果ページの表を読み、回ごとの正規化 JSON を data/normalized/ に書き出す。
 *
 *   npm run normalize
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ELECTIONS, type Election, type TableId } from "../src/lib/data/elections.ts";
import { parseNational, parsePrPref, parseSdPref, readRows } from "../src/lib/parse/excel.ts";
import { parsePrPrefLayout, parseSdPrefLayout, readLayout } from "../src/lib/parse/layout.ts";
import type { NormalizedElection } from "../src/lib/parse/types.ts";
import { rawPath } from "./fetch-data.ts";

const OUT_DIR = resolve(import.meta.dirname, "../data/normalized");

function path(e: Election, table: TableId): string {
  return rawPath(e.n, table, e.tables[table].format);
}

function normalize(e: Election): NormalizedElection {
  if (e.tables.sdPref.format === "pdf") {
    const sd = parseSdPrefLayout(readLayout(path(e, "sdPref")));
    const pr = parsePrPrefLayout(readLayout(path(e, "prPref")));
    return { n: e.n, sd, pr };
  }
  const sd = parseSdPref(readRows(path(e, "sdPref")));
  const pr = parsePrPref(readRows(path(e, "prPref")));
  return {
    n: e.n,
    sd: { ...sd, reported: parseNational(readRows(path(e, "sdNational"))) },
    pr: { ...pr, reported: parseNational(readRows(path(e, "prNational"))) },
  };
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const e of ELECTIONS) {
    const data = normalize(e);
    await writeFile(resolve(OUT_DIR, `${e.n}.json`), `${JSON.stringify(data, null, 1)}\n`);
    console.log(
      `  第${e.n}回  選挙区 ${Object.keys(data.sd.national.votes).length}党  比例 ${Object.keys(data.pr.national.votes).length}党`,
    );
  }
}

await main();
