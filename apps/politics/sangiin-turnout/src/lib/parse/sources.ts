/**
 * 総務省の Excel・HTML・PDF を「ラベル + 人数の並び」の行として読む。
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as XLSX from "xlsx";
import * as cptable from "xlsx/dist/cpexcel.full.mjs";
import { clean, count, isCount } from "./cells.ts";

XLSX.set_fs(fs);
XLSX.set_cptable(cptable);

export interface Line {
  /** 数値より左の文字をつなげたもの（空白なし）。 */
  label: string;
  nums: number[];
}

type Row = unknown[];

const rowsOf = (sheet: XLSX.WorkSheet) => XLSX.utils.sheet_to_json<Row>(sheet, { header: 1, raw: true, defval: "" });

/**
 * 第19回の HTML は Shift_JIS。ページ全体を渡すと XML と誤認されるので、表ごとに読む。
 * 都道府県 + 9つの人数の右に投票率・前回の投票率・比較の欄が続く。投票率が整数（51.00 など）だと人数と
 * 見分けられないので、先頭の10列だけを読む。
 */
function htmlRows(path: string): Row[] {
  const html = new TextDecoder("shift_jis").decode(fs.readFileSync(path));
  return (html.match(/<table[\s\S]*?<\/table>/gi) ?? []).flatMap((table) => {
    const wb = XLSX.read(table, { type: "string" });
    return rowsOf(wb.Sheets[wb.SheetNames[0]!]!).map((row) => row.slice(0, 10));
  });
}

/** Excel は先頭のシートだけを読む。2枚目のシートは「うち在外」（在外選挙人の内数）で、先頭のシートの数に含まれている。 */
export function readExcelLines(path: string): Line[] {
  const rows = path.endsWith(".html")
    ? htmlRows(path)
    : (() => {
        const wb = XLSX.readFile(path);
        return rowsOf(wb.Sheets[wb.SheetNames[0]!]!);
      })();
  return rows.map((row) => ({
    label: row.filter((c) => !isCount(c)).map(clean).join(""),
    nums: row.filter(isCount).map(count),
  }));
}

/** pdftotext（poppler）の -layout で、ページを \f で区切ったテキスト。 */
export function pdfText(path: string): string {
  return execFileSync("pdftotext", ["-layout", path, "-"], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

/** PDF の表の行。数値は桁区切りつきの整数だけを拾う。空欄のない表にだけ使う。 */
export function readPdfLines(path: string): Line[] {
  return pdfText(path)
    .split("\n")
    .map((line) => {
      const s = line.normalize("NFKC");
      const first = s.search(/\d/);
      if (first < 0) return { label: clean(s), nums: [] };
      const nums = s.slice(first).trim().split(/\s+/);
      return { label: clean(s.slice(0, first)), nums: nums.every(isCount) ? nums.map(count) : [] };
    });
}
