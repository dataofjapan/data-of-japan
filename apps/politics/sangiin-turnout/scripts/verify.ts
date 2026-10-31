/**
 * 正規化 JSON の健全性チェック。1つでも落ちたら終了コード 1。
 * 表の中の突き合わせ（男 + 女 = 計、有権者 − 投票者 = 棄権者、印字された投票率）は読むとき
 * （src/lib/parse/tables.ts）に済んでいる。ここでは表どうしを突き合わせる。
 *
 *   npm run verify
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PREFECTURES } from "../src/lib/data/areas.ts";
import { AGE_GROUPS, ELECTIONS, LAST_HISTORY } from "../src/lib/data/elections.ts";
import { percent } from "../src/lib/parse/tables.ts";
import type { Counts, NormalizedAge, NormalizedElection, NormalizedHistory } from "../src/lib/parse/types.ts";

const DIR = resolve(import.meta.dirname, "../data/normalized");
const read = async <T>(name: string) => JSON.parse(await readFile(resolve(DIR, `${name}.json`), "utf8")) as T;

/**
 * 結果ページの表の全国の行と確定結果調の差（確定結果調 − 結果ページ）。[有権者 男, 有権者 女, 投票者 男, 投票者 女]。
 * どれも投票率（小数第2位）は変わらない。値はどちらも表のまま載せ、画面の注記で断る。
 */
const KNOWN: Record<string, Counts> = {
  "23 sd": [0, 0, -44, 0],
  "23 pr": [0, 0, -44, 0],
  "24 sd": [0, -1, 0, 0],
  "24 pr": [0, -1, 0, 0],
  "25 sd": [10, 14, 0, 0],
  "25 pr": [10, 14, 0, 0],
  "26 sd": [0, 0, 0, -2],
  "26 pr": [0, 0, 3, -1],
};

const failures: string[] = [];
let checks = 0;

function check(ok: boolean, message: string): void {
  checks++;
  if (!ok) failures.push(message);
}

const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
const add = (a: number[], b: number[]) => a.map((v, i) => v + b[i]!);
const rate = ([em, ef, vm, vf]: Counts) => percent(vm + vf, em + ef);

const history = await read<NormalizedHistory>("history");
const age = await read<NormalizedAge>("age");
const byN = new Map<number, NormalizedElection>();
for (const e of ELECTIONS) {
  if (e.tables.sdPref !== undefined) byN.set(e.n, await read<NormalizedElection>(String(e.n)));
}

// 確定結果調：目録の第1〜26回がそろう。
check(
  same(history.elections.map((e) => e.n), ELECTIONS.filter((e) => e.n <= LAST_HISTORY).map((e) => e.n)),
  `確定結果調の回 ${history.elections.map((e) => e.n)} が目録と違う`,
);
for (const e of ELECTIONS.filter((e) => e.n > LAST_HISTORY)) {
  check(byN.has(e.n), `第${e.n}回: 確定結果調にない回なのに結果ページの表がない`);
}

// 結果ページの表：都道府県の和 = 全国の行。確定結果調と一致（既知の差を除く）。
for (const [n, d] of byN) {
  for (const system of ["sd", "pr"] as const) {
    const where = `第${n}回 ${system}`;
    const sum = PREFECTURES.reduce((acc, p) => add(acc, d[system].prefs[p]!), [0, 0, 0, 0]);
    check(same(sum, d[system].national), `${where}: 都道府県の和 ${sum} ≠ 全国の行 ${d[system].national}`);

    const final = history.elections.find((e) => e.n === n)?.[system];
    if (final === undefined) continue;
    const diff = final.map((v, i) => v - d[system].national[i]!);
    const known = KNOWN[`${n} ${system}`] ?? [0, 0, 0, 0];
    check(same(diff, known), `${where}: 確定結果調との差 ${diff} ≠ 既知の差 ${known}`);
    check(rate(final) === rate(d[system].national), `${where}: 投票率が確定結果調 ${rate(final)} と違う`);
  }
}

// 年代別投票率：第15回から最新回まで。10歳代は第24回から。「全体」= 全国の選挙区の投票率。
const last = ELECTIONS.at(-1)!.n;
check(same(age.elections, ELECTIONS.filter((e) => e.n >= 15).map((e) => e.n)), `年代別の回 ${age.elections} が第15〜${last}回でない`);
AGE_GROUPS.forEach((g, i) => {
  age.elections.forEach((n, j) => {
    const expected = g === "10歳代" ? n >= 24 : true;
    check((age.rates[i]![j] !== null) === expected, `年代別 ${g} 第${n}回: 値の有無が違う`);
  });
});
age.elections.forEach((n, j) => {
  const sd = n <= LAST_HISTORY ? history.elections.find((e) => e.n === n)?.sd : byN.get(n)?.sd.national;
  check(sd !== undefined && rate(sd) === age.total[j], `年代別 第${n}回: 全体 ${age.total[j]} ≠ 全国の選挙区の投票率 ${sd && rate(sd)}`);
});

if (failures.length > 0) {
  console.error(`✗ ${failures.length}/${checks} 件が不一致`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ ${checks} 件すべて一致`);
