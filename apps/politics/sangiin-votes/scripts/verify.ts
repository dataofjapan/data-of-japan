/**
 * 正規化 JSON の健全性チェック。1つでも落ちたら終了コード 1。
 *
 *   npm run verify
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PREFECTURES } from "../src/lib/data/areas.ts";
import { ELECTIONS } from "../src/lib/data/elections.ts";
import type { AreaVotes, NormalizedElection, SystemVotes } from "../src/lib/parse/types.ts";

const DIR = resolve(import.meta.dirname, "../data/normalized");

/** 按分票の丸めが党の数だけ積もるので、票の比較には 0.01 の幅を持たせる。 */
const EPS = 0.01;

/**
 * 第26回確定結果調「通常選挙における党派別得票数の推移」の全国値（総得票・自由民主党）。
 * 結果ページの表から組み立てた値が確定値と一致するかを見る。
 */
const CONFIRMED: Record<number, { sd: [number, number]; pr: [number, number] }> = {
  19: { sd: [54338483.631, 22299825.411], pr: [54741495.087, 21114727.63] },
  20: { sd: [56108851.757, 19687954.3], pr: [55931785.348, 16797686.469] },
  21: { sd: [59347628.809, 18606193], pr: [58913700.007, 16544761.1] },
  22: { sd: [58400807.899, 19496083], pr: [58453432.438, 14071671.422] },
  23: { sd: [53072476.946, 22681192], pr: [53229614.756, 18460335.204] },
  24: { sd: [56555392.895, 22590793], pr: [56007352.842, 20114788.264] },
  25: { sd: [50363770.968, 20030330.963], pr: [50072198.778, 17712373.119] },
  26: { sd: [53180011.63, 20603298.241], pr: [53027260.002, 18256245.412] },
};

const failures: string[] = [];
let checks = 0;

function check(ok: boolean, message: string): void {
  checks++;
  if (!ok) failures.push(message);
}

const near = (a: number, b: number) => Math.abs(a - b) <= EPS;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function checkArea(where: string, a: AreaVotes): void {
  const s = sum(Object.values(a.votes));
  check(near(s, a.total), `${where}: 党の合計 ${s} ≠ 合計 ${a.total}`);
  for (const [party, v] of Object.entries(a.votes)) {
    check(v > 0, `${where} ${party}: 得票が正でない ${v}`);
  }
}

function checkSystem(label: string, s: SystemVotes): void {
  checkArea(`${label} 全国`, s.national);

  check(
    PREFECTURES.every((a) => a in s.areas) && Object.keys(s.areas).length === PREFECTURES.length,
    `${label}: 都道府県が揃っていない（${Object.keys(s.areas).length}）`,
  );
  for (const [name, a] of Object.entries(s.areas)) checkArea(`${label} ${name}`, a);

  const totals = sum(Object.values(s.areas).map((a) => a.total));
  check(near(totals, s.national.total), `${label}: 都道府県の合計 ${totals} ≠ 全国 ${s.national.total}`);
  for (const [party, v] of Object.entries(s.national.votes)) {
    const byArea = sum(Object.values(s.areas).map((a) => a.votes[party] ?? 0));
    check(near(byArea, v), `${label} ${party}: 都道府県の合計 ${byArea} ≠ 全国 ${v}`);
  }
  for (const a of Object.values(s.areas)) {
    for (const party of Object.keys(a.votes)) {
      check(party in s.national.votes, `${label} ${party}: 都道府県にあって全国にない`);
    }
  }

  if (s.reported !== undefined) {
    const r = s.reported;
    check(near(r.total, s.national.total), `${label}: 全国表の合計 ${r.total} ≠ ${s.national.total}`);
    const a = Object.keys(r.votes).sort().join("、");
    const b = Object.keys(s.national.votes).sort().join("、");
    check(a === b, `${label}: 全国表と党が違う\n    全国表: ${a}\n    都道府県表: ${b}`);
    for (const [party, v] of Object.entries(r.votes)) {
      const mine = s.national.votes[party];
      check(mine !== undefined && near(mine, v), `${label} ${party}: 全国表 ${v} ≠ ${mine}`);
    }
  }
}

for (const e of ELECTIONS) {
  const data = JSON.parse(await readFile(resolve(DIR, `${e.n}.json`), "utf8")) as NormalizedElection;
  check(data.n === e.n, `第${e.n}回: ファイルの回が ${data.n}`);
  checkSystem(`第${e.n}回 選挙区`, data.sd);
  checkSystem(`第${e.n}回 比例`, data.pr);

  const confirmed = CONFIRMED[e.n];
  check((confirmed !== undefined) === (e.edition === "確定"), `第${e.n}回: 確定値の有無と版（${e.edition}）が合わない`);
  if (confirmed !== undefined) {
    for (const system of ["sd", "pr"] as const) {
      const [total, ldp] = confirmed[system];
      const s = data[system].national;
      check(near(s.total, total), `第${e.n}回 ${system}: 総得票 ${s.total} ≠ 確定 ${total}`);
      check(
        near(s.votes["自由民主党"] ?? NaN, ldp),
        `第${e.n}回 ${system}: 自由民主党 ${s.votes["自由民主党"]} ≠ 確定 ${ldp}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length}/${checks} 件が不一致`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ ${checks} 件すべて一致`);
