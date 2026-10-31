/**
 * 総務省の結果ページの表（Excel・HTML）を読む。
 *
 * 回によって列の組み方が揺れる。党名は結合セルのどの列にも置かれ得るし、
 * 長い党名は2行に折られる。
 * そこで党の列は、党名ではなく小見出し（男・女・計）や見出し行の位置から決める。
 */

import * as fs from "node:fs";
import * as XLSX from "xlsx";
import * as cptable from "xlsx/dist/cpexcel.full.mjs";
import { PREFECTURES } from "../data/areas.ts";
import { TOTAL, clean, round3, votes } from "./cells.ts";
import type { AreaVotes } from "./types.ts";

XLSX.set_fs(fs);
XLSX.set_cptable(cptable);

type Row = unknown[];

function sheetRows(wb: XLSX.WorkBook): Row[] {
  return wb.SheetNames.flatMap((name) =>
    XLSX.utils.sheet_to_json<Row>(wb.Sheets[name]!, { header: 1, raw: true, defval: "" }),
  );
}

/**
 * すべてのシート（HTML は表）を上から順につなげた行。
 * 第19回の HTML は Shift_JIS。ページ全体を渡すと XML と誤認されるので、表ごとに読む。
 */
export function readRows(path: string): Row[] {
  if (!path.endsWith(".html")) return sheetRows(XLSX.readFile(path));
  const html = new TextDecoder("shift_jis").decode(fs.readFileSync(path));
  return (html.match(/<table[\s\S]*?<\/table>/gi) ?? []).flatMap((table) =>
    sheetRows(XLSX.read(table, { type: "string" })),
  );
}

const PREF_SET = new Set<string>(PREFECTURES);
const HEADER_LABELS = new Set(["区分", "都道府県", "都道府県名", "政党等の名称"]);

function cell(row: Row | undefined, c: number): string {
  return clean(row?.[c]);
}

/** 党名 → 得票の組から、合計列を有効投票数として取り出す。 */
export function toAreaVotes(pairs: [string, number | null][], where: string): AreaVotes {
  const out: AreaVotes = { votes: {}, total: NaN };
  for (const [party, v] of pairs) {
    if (v === null) continue;
    if (party === TOTAL) out.total = round3(v);
    else {
      if (party in out.votes) throw new Error(`${where}: 党名が重複 ${party}`);
      out.votes[party] = round3(v);
    }
  }
  if (Number.isNaN(out.total)) throw new Error(`${where}: 合計列がない`);
  return out;
}

function mergeInto(target: Map<string, [string, number | null][]>, key: string, pairs: [string, number | null][]) {
  const list = target.get(key) ?? [];
  list.push(...pairs);
  target.set(key, list);
}

/**
 * 都道府県別党派別得票数（選挙区）。党ごとに男・女・計の3列。
 * 「計」の行は全国。合区（第24回から）は「（再掲）」として計の下に付くので読まない。
 */
export function parseSdPref(rows: Row[]): { national: AreaVotes; areas: Record<string, AreaVotes> } {
  const byArea = new Map<string, [string, number | null][]>();

  rows.forEach((row, i) => {
    const totals = row
      .map((_, c) => c)
      .filter((c) => cell(row, c) === "計" && cell(row, c - 2) === "男" && cell(row, c - 1) === "女");
    if (totals.length === 0) return;

    // 見出しは小見出しの上、数値のある行（県・計・再掲）か表題に当たるまで。
    const headerRows: Row[] = [];
    for (let k = i - 1; k >= Math.max(0, i - 4); k--) {
      const note = rows[k]!.some((v) => /^\((\d+|注)/.test(clean(v)));
      const numeric = rows[k]!.some((v, c) => c > 0 && /^[\d,.]+$/.test(clean(v)));
      if (numeric || note) break;
      headerRows.unshift(rows[k]!);
    }
    // 使われない 男・女・計 の組が見出しだけ残っていることがある。値が入っていなければ読み飛ばす。
    const columns = totals.map((c) => ({
      col: c,
      name: headerRows.map((r) => [c - 2, c - 1, c].map((cc) => cell(r, cc)).join("")).join(""),
    }));
    for (const { name, col } of columns) {
      if (HEADER_LABELS.has(name)) throw new Error(`${i}行目: 党名が読めない列 ${col}`);
    }
    const parties = columns.filter((p) => p.name !== "");

    for (let k = i + 1; k < rows.length; k++) {
      const c0 = cell(rows[k], 0);
      if (!PREF_SET.has(c0) && c0 !== "計") {
        if (c0 === "" && rows[k]!.every((v) => clean(v) === "")) continue;
        break;
      }
      for (const { name, col } of columns) {
        if (name === "" && votes(rows[k]![col]) !== null) {
          throw new Error(`${k}行目: 党名のない列 ${col} に値がある`);
        }
      }
      mergeInto(
        byArea,
        c0,
        parties.map((p) => [p.name, votes(rows[k]![p.col])]),
      );
    }
  });

  const national = byArea.get("計");
  if (national === undefined) throw new Error("計（全国）の行がない");
  const areas: Record<string, AreaVotes> = {};
  for (const pref of PREFECTURES) {
    const pairs = byArea.get(pref);
    if (pairs === undefined) throw new Error(`${pref} の行がない`);
    areas[pref] = toAreaVotes(pairs, pref);
  }
  return { national: toAreaVotes(national, "全国"), areas };
}

/**
 * 都道府県別党派別得票数（比例代表）。党ごとに 得票総数・得票率・政党等の得票総数・名簿登載者の得票総数 の4列。
 * 得票総数の列は、小見出し「得票率」のすぐ左。党名はその列の見出しをつなげて読む。
 * 「計」の行は全国。最後の組の「合計」が有効投票数。
 */
export function parsePrPref(rows: Row[]): { national: AreaVotes; areas: Record<string, AreaVotes> } {
  const byArea = new Map<string, [string, number | null][]>();
  let blockStart = 0;

  rows.forEach((row, i) => {
    const cols = row
      .map((_, c) => c)
      .filter((c) => cell(row, c).startsWith("得票率") && !cell(row, c - 1).startsWith("得票率"));
    if (cols.length === 0) return;

    // 使われない組が見出しだけ残っていることがある。値が入っていなければ読み飛ばす。
    const columns = cols.map((c) => ({
      col: c - 1,
      name: rows
        .slice(blockStart, i + 1)
        .map((r) => cell(r, c - 1))
        .filter((v) => v !== "得票総数" && !HEADER_LABELS.has(v))
        .join(""),
    }));
    const parties = columns.filter((p) => p.name !== "");

    for (let k = i + 1; k < rows.length; k++) {
      const c0 = cell(rows[k], 0);
      if (!PREF_SET.has(c0) && c0 !== "計") {
        if (rows[k]!.every((v) => clean(v) === "")) continue;
        blockStart = k;
        break;
      }
      for (const { name, col } of columns) {
        if (name === "" && votes(rows[k]![col]) !== null) {
          throw new Error(`${k}行目: 党名のない列 ${col} に値がある`);
        }
      }
      mergeInto(
        byArea,
        c0,
        parties.map((p) => [p.name, votes(rows[k]![p.col])]),
      );
      blockStart = k + 1;
    }
  });

  const national = byArea.get("計");
  if (national === undefined) throw new Error("計（全国）の行がない");
  const areas: Record<string, AreaVotes> = {};
  for (const pref of PREFECTURES) {
    const pairs = byArea.get(pref);
    if (pairs === undefined) throw new Error(`${pref} の行がない`);
    areas[pref] = toAreaVotes(pairs, pref);
  }
  return { national: toAreaVotes(national, "全国"), areas };
}

/**
 * 党派別得票数（選挙区・比例代表）の「今回」欄。
 * 第19回の HTML はセルに「得票数」「(得票率)」が改行で並ぶので、1行目だけを読む。
 */
export function parseNational(rows: Row[]): AreaVotes {
  const pairs: [string, number | null][] = [];
  rows.forEach((row, i) => {
    if (cell(row, 0) !== "区分" || row.slice(1).every((v) => clean(v) === "")) return;
    const names = row.map((_, c) => (c < 1 ? "" : cell(row, c)));
    let k = i + 1;
    for (; k < rows.length && !cell(rows[k], 0).startsWith("今回"); k++) {
      rows[k]!.forEach((_, c) => {
        if (c >= 1) names[c] = (names[c] ?? "") + cell(rows[k], c);
      });
    }
    const current = rows[k];
    if (current === undefined) throw new Error(`${i}行目: 今回の行がない`);
    names.forEach((name, c) => {
      if (name) pairs.push([name, votes(String(current[c] ?? "").split("\n")[0])]);
    });
  });
  return toAreaVotes(pairs, "全国表");
}
