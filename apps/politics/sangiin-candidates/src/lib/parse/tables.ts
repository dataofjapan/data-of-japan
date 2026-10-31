/**
 * 結果ページの2種類の表を、行 × 列のセルから読む。Excel・HTML（excel.ts）と PDF（pdf.ts）で共通。
 *
 * 回によって列の組み方が揺れる。党名は結合セルのどの列にも置かれ得るし、
 * 長い党名は2行に折られる（「生活の党と」「山本太郎となかまたち」）。
 * そこで党の列は、党名ではなく小見出し（男・女・計、新・現・元・計）の位置から決め、
 * 党名はその列の上にある見出しをつなげて読む。
 *
 * 表の中の「計」は読むたびに内訳の和と突き合わせ、合わなければ止める。
 */

import { isDistrict } from "../data/areas.ts";
import { TOTAL, clean, count, isCount } from "./cells.ts";
import type { PartyCounts, Status } from "./types.ts";

export type Row = unknown[];

/** 新前元の区分。前議員は第22回までの表で「前」、第23回からは「現」。 */
function statusIndex(label: string): number {
  if (label === "新") return 0;
  if (label === "前" || label === "現") return 1;
  if (label === "元") return 2;
  if (label === "計") return 3;
  return -1;
}

/** 党派別の表の区分。回によって選挙区と比例代表の順が入れ替わるので、区分の名前で決める。 */
const SYSTEM_OF: Record<string, keyof PartyCounts> = { 選挙区: "sd", 比例代表: "pr", 合計: "all" };

function cell(row: Row | undefined, c: number): string {
  return clean(row?.[c]);
}

/** 表題（(1)…、1.…）と注記の行。見出しの探索と表の読み取りをここで止める。 */
function isTitleOrNote(row: Row): boolean {
  return row.some((v) => /^(\(\d+\)|\d+\.|\(注|注\)|※)/.test(clean(v)));
}

/**
 * 見出し（党名）の列。小見出しの行 i の上を、前の表の本体か表題に当たるまでさかのぼり、
 * columns の範囲のセルを上から順につなげる。
 */
function headerName(rows: Row[], i: number, columns: number[]): string {
  let name = "";
  for (let k = i - 1; k >= Math.max(0, i - 5); k--) {
    const r = rows[k]!;
    if (isTitleOrNote(r) || r.some((v, c) => c > 0 && isCount(v))) break;
    name = columns.map((c) => cell(r, c)).join("") + name;
  }
  return name;
}

/** 党の見出し。null は見出しのない列で、値があってはいけない。 */
function partyName(header: string): string | null {
  if (header === "") return null;
  if (/^(区分|定数|都道府県)$/.test(header)) throw new Error(`党名が読めない列: ${header}`);
  return header;
}

const zeros = (n: number) => Array.from({ length: n }, () => 0);

function mergeParty(target: Map<string, PartyCounts>, name: string, value: PartyCounts): void {
  if (target.has(name)) throw new Error(`党名が重複: ${name}`);
  target.set(name, value);
}

/**
 * 党派別男女別新前元別の候補者数・当選人数（選挙区、比例代表）。
 * 党ごとに男・女・計の3列。行は 選挙区・比例代表・合計 の3区分で、それぞれ 新・前（現）・元・計 の4行。
 */
export function parsePartyTable(rows: Row[]): { parties: Record<string, PartyCounts>; total: PartyCounts } {
  const parties = new Map<string, PartyCounts>();

  rows.forEach((row, i) => {
    const totals = row
      .map((_, c) => c)
      .filter((c) => cell(row, c) === "計" && cell(row, c - 2) === "男" && cell(row, c - 1) === "女");
    if (totals.length === 0) return;

    const columns = totals.map((c) => ({ col: c, name: partyName(headerName(rows, i, [c - 2, c - 1, c])) }));
    const values = columns.map((): PartyCounts => ({ sd: zeros(6), pr: zeros(6), all: zeros(6) }));

    // 区分の名前は縦書きで、PDF では1字ずつ別の行に割れる。前の区分の計の行から今の区分の計の行までの
    // 1列目をつなげて名前とし、名前が分かるまで（計の行まで）読んだ行は取っておく。
    const seen = new Set<keyof PartyCounts>();
    let label = "";
    let pending: { r: Row; k: number; status: number }[] = [];
    for (let k = i + 1; k < rows.length && seen.size < 3; k++) {
      const r = rows[k]!;
      label += cell(r, 0);
      const status = statusIndex(cell(r, 1));
      if (status < 0) {
        const hasValues = columns.some(({ col }) => [col - 2, col - 1, col].some((c) => count(r[c]) > 0));
        if (hasValues) throw new Error(`${k}行目: 区分のない行に値がある`);
        continue;
      }
      pending.push({ r, k, status });
      if (status !== 3) continue;
      const system = SYSTEM_OF[label];
      if (system === undefined) throw new Error(`${k}行目: 区分が読めない ${label}`);
      if (seen.has(system)) throw new Error(`${k}行目: 区分 ${label} が2度ある`);
      seen.add(system);
      for (const p of pending) read(p.r, p.k, system, p.status);
      label = "";
      pending = [];
    }
    if (seen.size !== 3) throw new Error(`${i}行目: 表の区分が ${seen.size} 個しかない`);

    function read(r: Row, k: number, system: keyof PartyCounts, status: number): void {
      columns.forEach(({ col, name }, p) => {
        const [m, f, t] = [col - 2, col - 1, col].map((c) => count(r[c])) as [number, number, number];
        if (name === null) {
          if (m + f + t > 0) throw new Error(`${k}行目: 党名のない列 ${col} に値がある`);
          return;
        }
        if (m + f !== t) throw new Error(`${k}行目 ${name}: 男 ${m} + 女 ${f} ≠ 計 ${t}`);
        const target = values[p]![system];
        if (status < 3) {
          target[status * 2] = m;
          target[status * 2 + 1] = f;
        } else {
          const sum = (sex: number) => target[sex]! + target[2 + sex]! + target[4 + sex]!;
          if (sum(0) !== m || sum(1) !== f) throw new Error(`${k}行目 ${name}: 新前元の和 ≠ 計`);
        }
      });
    }

    columns.forEach(({ name }, p) => {
      if (name !== null) mergeParty(parties, name, values[p]!);
    });
  });

  const total = parties.get(TOTAL);
  if (total === undefined) throw new Error("合計の列がない");
  parties.delete(TOTAL);
  return { parties: Object.fromEntries(parties), total };
}

/**
 * 都道府県別党派別新前元別の候補者数・当選人数（選挙区）。党ごとに新・前（現）・元・計の4列。
 * 行は選挙区（第24回からの合区は「鳥取県・島根県」のような1行）。「計」の行は全国。
 * 定数の列は組ごとに繰り返され、どの組でも同じ値のはず。typos は印字の誤りと分かっている選挙区と正しい定数で、
 * その値と違うセルは読み飛ばす（どの組でも違えば止まる）。
 */
export function parsePrefTable(
  rows: Row[],
  typos: Record<string, number> = {},
): {
  seats: Record<string, number>;
  districts: Record<string, Record<string, Status>>;
  national: Record<string, Status>;
} {
  const byArea = new Map<string, Map<string, Status>>();
  const seats = new Map<string, number>();

  rows.forEach((row, i) => {
    const totals = row
      .map((_, c) => c)
      .filter(
        (c) =>
          cell(row, c) === "計" &&
          statusIndex(cell(row, c - 3)) === 0 &&
          statusIndex(cell(row, c - 2)) === 1 &&
          statusIndex(cell(row, c - 1)) === 2,
      );
    if (totals.length === 0) return;
    const columns = totals.map((c) => ({
      col: c,
      name: partyName(headerName(rows, i, [c - 3, c - 2, c - 1, c])),
    }));
    const seatsCol = totals[0]! - 4;

    for (let k = i + 1; k < rows.length; k++) {
      const r = rows[k]!;
      const area = cell(r, 0);
      if (!isDistrict(area) && area !== "計") {
        if (r.every((v) => clean(v) === "")) continue;
        break;
      }
      const n = count(r[seatsCol]);
      const fixed = typos[area];
      if (fixed === undefined || n === fixed) {
        const known = seats.get(area);
        if (known !== undefined && known !== n) throw new Error(`${area}: 定数が組によって違う ${known} ≠ ${n}`);
        seats.set(area, n);
      }

      const parties = byArea.get(area) ?? new Map<string, Status>();
      for (const { col, name } of columns) {
        const [a, b, c, t] = [col - 3, col - 2, col - 1, col].map((cc) => count(r[cc])) as [number, number, number, number];
        if (name === null) {
          if (a + b + c + t > 0) throw new Error(`${k}行目: 党名のない列 ${col} に値がある`);
          continue;
        }
        if (a + b + c !== t) throw new Error(`${k}行目 ${area} ${name}: 新前元の和 ${a + b + c} ≠ 計 ${t}`);
        if (parties.has(name)) throw new Error(`${area}: 党名が重複 ${name}`);
        if (t > 0 || name === TOTAL) parties.set(name, [a, b, c]);
      }
      byArea.set(area, parties);
    }
  });

  const national = byArea.get("計");
  if (national === undefined) throw new Error("計（全国）の行がない");
  for (const area of byArea.keys()) if (!seats.has(area)) throw new Error(`${area}: 定数が読めない`);
  byArea.delete("計");
  return {
    seats: Object.fromEntries([...byArea.keys()].map((area) => [area, seats.get(area)!])),
    districts: Object.fromEntries([...byArea].map(([area, parties]) => [area, Object.fromEntries(parties)])),
    national: Object.fromEntries(national),
  };
}
