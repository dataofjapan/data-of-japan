/**
 * data/raw/ の結果ページの表を読み、回ごとの正規化 JSON を data/normalized/ に書き出す。
 * 第20回の PDF には poppler の pdftotext が要る。
 *
 *   npm run normalize
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ELECTIONS, type Election, type TableId } from "../src/lib/data/elections.ts";
import { readRows } from "../src/lib/parse/excel.ts";
import { readPdfRows } from "../src/lib/parse/pdf.ts";
import { parsePartyTable, parsePrefTable, type Row } from "../src/lib/parse/tables.ts";
import type { NormalizedElection, Side } from "../src/lib/parse/types.ts";
import { rawPath } from "./fetch-data.ts";

const OUT_DIR = resolve(import.meta.dirname, "../data/normalized");

/**
 * 表の定数の列の印字の誤り（回 表 → 選挙区 → 正しい定数）。
 * 第19回の当選人数の表は、最初の組だけ新潟県の定数が 1（同じ表の2つ目の組、候補者数の表、計の行 73 はどれも 2 と合う）。
 */
const SEAT_TYPOS: Record<string, Record<string, number>> = {
  "19 winPref": { 新潟県: 2 },
};

/** PDF の列を作る小見出しと、その左の欄の数。表の種類ごと。 */
const PDF_LAYOUT = {
  party: { anchor: (t: string) => /^[男女計]$/.test(t), labels: 2 },
  pref: { anchor: (t: string) => /^[数新前現元計]$/.test(t), labels: 1 },
} as const;

function rows(e: Election, table: TableId, layout: keyof typeof PDF_LAYOUT): Row[] {
  const source = e.tables[table];
  const path = rawPath(e.n, table, source.format);
  if (source.format !== "pdf") return readRows(path);
  const { anchor, labels } = PDF_LAYOUT[layout];
  return readPdfRows(path, anchor, labels);
}

function side(e: Election, kind: "cand" | "win"): { side: Side; seats: Record<string, number> } {
  const where = (t: string) => `第${e.n}回 ${kind}${t}`;
  const run = <T>(t: string, f: () => T): T => {
    try {
      return f();
    } catch (err) {
      throw new Error(`${where(t)}: ${(err as Error).message}`);
    }
  };
  const party = run("Party", () => parsePartyTable(rows(e, `${kind}Party`, "party")));
  const pref = run("Pref", () => parsePrefTable(rows(e, `${kind}Pref`, "pref"), SEAT_TYPOS[`${e.n} ${kind}Pref`]));
  return {
    side: {
      parties: party.parties,
      total: party.total,
      districts: pref.districts,
      districtNational: pref.national,
    },
    seats: pref.seats,
  };
}

function normalize(e: Election): NormalizedElection {
  const cand = side(e, "cand");
  const win = side(e, "win");
  const a = Object.entries(cand.seats).map(([d, n]) => `${d}:${n}`).join(",");
  const b = Object.entries(win.seats).map(([d, n]) => `${d}:${n}`).join(",");
  if (a !== b) throw new Error(`第${e.n}回: 選挙区と定数が候補者と当選人の表で違う\n  ${a}\n  ${b}`);
  return { n: e.n, seats: cand.seats, candidates: cand.side, winners: win.side };
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const e of ELECTIONS) {
    const data = normalize(e);
    await writeFile(resolve(OUT_DIR, `${e.n}.json`), `${JSON.stringify(data, null, 1)}\n`);
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    console.log(
      `  第${e.n}回  選挙区 ${Object.keys(data.seats).length}  候補者 ${sum(data.candidates.total.all)}人（${Object.keys(data.candidates.parties).length}党）  当選人 ${sum(data.winners.total.all)}人（${Object.keys(data.winners.parties).length}党）`,
    );
  }
}

await main();
