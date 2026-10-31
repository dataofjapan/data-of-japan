/**
 * 総務省の結果ページの表（Excel・HTML）を行 × 列のセルとして読む。
 */

import * as fs from "node:fs";
import * as XLSX from "xlsx";
import * as cptable from "xlsx/dist/cpexcel.full.mjs";
import type { Row } from "./tables.ts";

XLSX.set_fs(fs);
XLSX.set_cptable(cptable);

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
