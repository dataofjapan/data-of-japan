/**
 * 出入国管理統計（住所地×年齢×性別の出国、滞在期間×年齢×性別の帰国）と
 * 観光庁「旅行・観光消費動向調査」の年次集計表（海外旅行の目的×州）。
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import XLSX from "xlsx";
import { ageCode, canon, destinationCode, purposeCode, sexCode } from "./labels.ts";

const RAW = resolve(import.meta.dirname, "../../data/raw");

type Cell = string | number | null;

function sheet(file: string): Cell[][] {
  const path = resolve(RAW, file);
  if (!existsSync(path)) throw new Error(`${path} がない。npm run fetch を先に実行。`);
  const wb = XLSX.read(readFileSync(path));
  const name = wb.SheetNames[0]!;
  return XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[name]!, { header: 1, raw: true, defval: null });
}

export function norm(v: Cell | undefined): string {
  return v === null || v === undefined ? "" : canon(String(v));
}

function num(v: Cell | undefined): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const s = v.replace(/[,\s]/g, "");
    if (s === "-" || s === "0") return 0;
    if (s === "…" || s === "..." || s === "") return null;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  }
  return null;
}

export interface CrossCell {
  label: string;
  age: string;
  sex: "total" | "male" | "female";
  value: number;
}

/** 住所地別・滞在期間別とも、見出し行の次が男女、その下が数値。 */
function readCross(file: string, headerLabel: string): CrossCell[] {
  const rows = sheet(file);
  const h = rows.findIndex((r) => r.some((c) => norm(c) === headerLabel));
  if (h < 0) throw new Error(`${file}: 見出し ${headerLabel} がない`);
  const head = rows[h]!;
  const labelCol = head.findIndex((c) => norm(c) === headerLabel);
  const sexRow = rows[h + 1]!;
  let age = "";
  const cols: { j: number; age: string; sex: "total" | "male" | "female" }[] = [];
  for (let j = labelCol + 1; j < Math.max(head.length, sexRow.length); j++) {
    const a = norm(head[j]);
    if (a !== "") age = a;
    const sex = sexCode(norm(sexRow[j]));
    const ageId = ageCode(age);
    if (sex !== null && ageId !== null) cols.push({ j, age: ageId, sex });
  }
  if (cols.length === 0) throw new Error(`${file}: 年齢・男女の列が読めない`);

  const out: CrossCell[] = [];
  for (const r of rows.slice(h + 2)) {
    const label = norm(r[labelCol]);
    if (label === "" || label === headerLabel) continue;
    for (const c of cols) {
      const value = num(r[c.j]);
      if (value === null) continue;
      out.push({ label, age: c.age, sex: c.sex, value });
    }
  }
  return out;
}

export function readWho(year: string): CrossCell[] {
  return readCross(`who-${year}.xlsx`, "住所地");
}

export function readStay(year: string): CrossCell[] {
  return readCross(`stay-${year}.xlsx`, "滞在期間");
}

export interface PurposeCell {
  dest: string;
  purpose: string;
  /** 延べ旅行者数（人）。表は千人単位。 */
  trips: number;
}

/** 年次集計の第4表。年合計のブロックだけを使い、四半期は捨てる。 */
export function readPurpose(year: string): PurposeCell[] {
  const path = resolve(RAW, `purpose-${year}.xlsx`);
  if (!existsSync(path)) throw new Error(`${path} がない。npm run fetch を先に実行。`);
  const wb = XLSX.read(readFileSync(path));
  const name = wb.SheetNames.find((n) => n.trim() === "T04");
  if (name === undefined) throw new Error(`${year}: T04 がない（${wb.SheetNames.join(", ")}）`);
  const rows = XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[name]!, { header: 1, raw: true, defval: null });

  let overseas = -1;
  for (const r of rows.slice(0, 8)) {
    const j = r.findIndex((c) => norm(c) === "海外旅行");
    if (j >= 0) overseas = j;
  }
  if (overseas < 0) throw new Error(`${year}: 海外旅行の列がない`);

  const yearRow = rows.findIndex((r) => norm(r[0]) === `(${year}年)`);
  if (yearRow < 0) throw new Error(`${year}: 年合計の行がない`);
  const header = rows.slice(0, yearRow).reverse().find((r) => r.some((c) => purposeCode(norm(c)) !== null));
  if (header === undefined) throw new Error(`${year}: 目的の見出しがない`);
  const cols = [{ j: overseas, purpose: "total" }];
  header.forEach((c, j) => {
    if (j < overseas) return;
    const p = purposeCode(norm(c));
    if (p !== null) cols.push({ j, purpose: p });
  });

  const out: PurposeCell[] = [];
  for (const r of rows.slice(yearRow + 1, yearRow + 25)) {
    const dest = destinationCode(norm(r[0]));
    if (dest === null) continue;
    for (const c of cols) {
      const v = num(r[c.j]);
      if (v === null) continue;
      out.push({ dest, purpose: c.purpose, trips: Math.round(v * 1000) });
    }
  }
  return out;
}
