/**
 * 正規化 JSON の健全性チェック。1つでも落ちたら終了コード 1。
 * 表の中の「計」との突き合わせは読むとき（src/lib/parse/tables.ts）に済んでいる。ここでは表どうしを突き合わせる。
 *
 *   npm run verify
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PREFECTURES, prefsOf } from "../src/lib/data/areas.ts";
import { ELECTIONS } from "../src/lib/data/elections.ts";
import type { NormalizedElection, PartyCounts, SexStatus, Side, Status } from "../src/lib/parse/types.ts";

const DIR = resolve(import.meta.dirname, "../data/normalized");

/**
 * 第26回確定結果調の推移表の値。結果ページの表から組み立てた値が確定値と一致するかを見る。
 * cand: 「候補者及び競争率」の候補者数と「女性候補者数」（[人数, 女性]、選挙区・比例代表）。
 * ldp: 「党派別当選人数の推移」の自由民主党（[比例代表, 計]）。
 */
const CONFIRMED: Record<number, { cand: Record<"sd" | "pr", [number, number]>; ldp: [number, number] }> = {
  19: { cand: { sd: [292, 79], pr: [204, 58] }, ldp: [20, 64] },
  20: { cand: { sd: [192, 35], pr: [128, 31] }, ldp: [15, 49] },
  21: { cand: { sd: [218, 44], pr: [159, 47] }, ldp: [14, 37] },
  22: { cand: { sd: [251, 55], pr: [186, 45] }, ldp: [12, 51] },
  23: { cand: { sd: [271, 71], pr: [162, 34] }, ldp: [18, 65] },
  24: { cand: { sd: [225, 60], pr: [164, 36] }, ldp: [19, 55] },
  25: { cand: { sd: [215, 56], pr: [155, 48] }, ldp: [19, 57] },
  26: { cand: { sd: [367, 122], pr: [178, 59] }, ldp: [18, 63] },
};

const failures: string[] = [];
let checks = 0;

function check(ok: boolean, message: string): void {
  checks++;
  if (!ok) failures.push(message);
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
const add = (a: number[], b: number[]) => a.map((v, i) => v + b[i]!);
/** 男女を足して新前元にする。 */
const byStatus = (s: SexStatus): Status => [s[0]! + s[1]!, s[2]! + s[3]!, s[4]! + s[5]!];
const women = (s: SexStatus) => s[1]! + s[3]! + s[5]!;

function checkSide(where: string, side: Side, districts: string[]): void {
  const parties = Object.entries(side.parties);
  const systems: (keyof PartyCounts)[] = ["sd", "pr", "all"];

  // 党派別：合計列 = 党の和。合計 = 選挙区 + 比例代表。
  for (const system of systems) {
    const s = parties.reduce((acc, [, c]) => add(acc, c[system]), [0, 0, 0, 0, 0, 0]);
    check(same(s, side.total[system]), `${where} ${system}: 党の和 ${s} ≠ 合計 ${side.total[system]}`);
  }
  for (const [party, c] of [...parties, ["合計", side.total] as const]) {
    check(same(c.all, add(c.sd, c.pr)), `${where} ${party}: 合計 ${c.all} ≠ 選挙区 + 比例代表`);
  }

  // 都道府県別：計の行 = 選挙区の和、党派別の選挙区と一致、選挙区の合計 = 党の和。
  check(Object.keys(side.districts).join() === districts.join(), `${where}: 選挙区が定数の表と違う`);
  const names = new Set([
    ...Object.values(side.districts).flatMap((p) => Object.keys(p)),
    ...Object.keys(side.districtNational),
  ]);
  for (const party of names) {
    const byDistrict = districts.reduce((acc, d) => add(acc, side.districts[d]![party] ?? [0, 0, 0]), [0, 0, 0]);
    const national = side.districtNational[party] ?? [0, 0, 0];
    check(same(byDistrict, national), `${where} ${party}: 選挙区の和 ${byDistrict} ≠ 計の行 ${national}`);
    if (party === "合計") continue;
    const table = side.parties[party];
    check(table !== undefined, `${where} ${party}: 都道府県別にあって党派別にない`);
    if (table !== undefined) {
      check(same(national, byStatus(table.sd)), `${where} ${party}: 都道府県別 ${national} ≠ 党派別の選挙区 ${byStatus(table.sd)}`);
    }
  }
  for (const [party, c] of parties) {
    if (sum(c.sd) > 0) check(names.has(party), `${where} ${party}: 選挙区にいるのに都道府県別にない`);
  }
  for (const d of districts) {
    const { 合計: total, ...rest } = side.districts[d]!;
    const s = Object.values(rest).reduce((acc, v) => add(acc, v), [0, 0, 0]);
    check(total !== undefined && same(s, total), `${where} ${d}: 党の和 ${s} ≠ 合計 ${total}`);
  }
}

for (const e of ELECTIONS) {
  const d = JSON.parse(await readFile(resolve(DIR, `${e.n}.json`), "utf8")) as NormalizedElection;
  const where = `第${e.n}回`;
  check(d.n === e.n, `${where}: ファイルの回が ${d.n}`);
  const districts = Object.keys(d.seats);

  // 選挙区：どの都道府県もちょうど1つの選挙区に入る。合区は第24回から。
  const prefs = districts.flatMap(prefsOf);
  check(
    prefs.length === PREFECTURES.length && PREFECTURES.every((p) => prefs.includes(p)),
    `${where}: 選挙区が都道府県を1度ずつ覆っていない`,
  );
  check(
    districts.some((x) => prefsOf(x).length > 1) === e.n >= 24,
    `${where}: 合区の有無が第24回からの制度と合わない`,
  );

  checkSide(`${where} 候補者`, d.candidates, districts);
  checkSide(`${where} 当選人`, d.winners, districts);

  // 定数：選挙区の定数の和、当選人の数。
  check(sum(Object.values(d.seats)) === e.seats.sd, `${where}: 選挙区の定数の和 ≠ ${e.seats.sd}`);
  check(sum(d.winners.total.sd) === e.seats.sd, `${where}: 選挙区の当選人 ${sum(d.winners.total.sd)} ≠ ${e.seats.sd}`);
  check(sum(d.winners.total.pr) === e.seats.pr, `${where}: 比例代表の当選人 ${sum(d.winners.total.pr)} ≠ ${e.seats.pr}`);
  for (const x of districts) {
    const won = sum(d.winners.districts[x]!["合計"] ?? []);
    check(won === d.seats[x], `${where} ${x}: 当選人 ${won} ≠ 定数 ${d.seats[x]}`);
  }

  const confirmed = CONFIRMED[e.n];
  check((confirmed !== undefined) === (e.edition === "確定"), `${where}: 確定値の有無と版（${e.edition}）が合わない`);
  if (confirmed !== undefined) {
    for (const system of ["sd", "pr"] as const) {
      const c = d.candidates.total[system];
      const mine = [sum(c), women(c)];
      check(same(mine, confirmed.cand[system]), `${where} 候補者 ${system}: ${mine} ≠ 確定 ${confirmed.cand[system]}（人数・女性）`);
    }
    const ldp = d.winners.parties["自由民主党"];
    const mine = ldp === undefined ? [] : [sum(ldp.pr), sum(ldp.all)];
    check(same(mine, confirmed.ldp), `${where} 自由民主党の当選人: ${mine} ≠ 確定 ${confirmed.ldp}（比例代表・計）`);
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length}/${checks} 件が不一致`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ ${checks} 件すべて一致`);
