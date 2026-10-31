/**
 * data/raw/ へ取得する。
 * - who-{年}.xlsx … 出入国管理統計「住所地別 年齢・性別 出国日本人」
 * - stay-{年}.xlsx … 同「滞在期間別 年齢・性別 帰国日本人」
 * - purpose-{年}.xlsx … 観光庁「旅行・観光消費動向調査」年次集計表
 * 年 → ファイルは scripts/catalog.json。
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const RAW = resolve(import.meta.dirname, "../data/raw");
const CATALOG = resolve(import.meta.dirname, "catalog.json");

interface FileRef {
  id: string;
  kind: string;
}
interface Catalog {
  who: Record<string, FileRef>;
  stay: Record<string, FileRef>;
  purpose: Record<string, string>;
}

async function download(name: string, url: string, force: boolean): Promise<void> {
  const out = resolve(RAW, name);
  if (!force && existsSync(out)) {
    console.log("skip", name);
    return;
  }
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 japan-data-outbound" } });
  if (!res.ok) throw new Error(`${res.status} ${name}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("ok", name, statSync(out).size);
}

async function main(): Promise<void> {
  mkdirSync(RAW, { recursive: true });
  const force = process.argv.includes("--force");
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8")) as Catalog;
  for (const [year, ref] of Object.entries(catalog.who)) {
    await download(
      `who-${year}.xlsx`,
      `https://www.e-stat.go.jp/stat-search/file-download?statInfId=${ref.id}&fileKind=${ref.kind}`,
      force,
    );
  }
  for (const [year, ref] of Object.entries(catalog.stay)) {
    await download(
      `stay-${year}.xlsx`,
      `https://www.e-stat.go.jp/stat-search/file-download?statInfId=${ref.id}&fileKind=${ref.kind}`,
      force,
    );
  }
  for (const [year, url] of Object.entries(catalog.purpose)) {
    await download(`purpose-${year}.xlsx`, url, force);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
