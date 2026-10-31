/**
 * 表の読み方。表の中の「計」との突き合わせは読むたびに行い、合わなければ止める。
 */

import { PREFECTURES } from "../data/areas.ts";
import { AGE_GROUPS } from "../data/elections.ts";
import { clean } from "./cells.ts";
import type { Line } from "./sources.ts";
import type { Counts, NormalizedAge, NormalizedHistory, PrefTable } from "./types.ts";

/** 百分率を小数第2位で四捨五入する（結果調の投票率の書き方）。 */
export function percent(part: number, whole: number): number {
  return Math.round((part / whole) * 10000) / 100;
}

const PREF_SET = new Set<string>(PREFECTURES);

/**
 * 都道府県別有権者数、投票者数、投票率の表。行は 都道府県 + 9つの数
 * （有権者・投票者・棄権者 × 男・女・計）。全国の行は「計」か「合計」。
 * 第24回からの選挙区の表には、合区（「鳥取県・島根県」）が「（再掲）」として付く。2県の和と一致するのを確かめて読み飛ばす。
 */
export function parsePrefTable(lines: Line[]): PrefTable {
  const prefs: Record<string, Counts> = {};
  const merged: [string, Counts][] = [];
  const totals: Counts[] = [];
  for (const { label, nums } of lines) {
    if (nums.length !== 9) continue;
    const [em, ef, et, vm, vf, vt, am, af, at] = nums as [number, number, number, number, number, number, number, number, number];
    const where = label === "" ? "(ラベルなし)" : label;
    if (em + ef !== et || vm + vf !== vt || am + af !== at) throw new Error(`${where}: 男 + 女 ≠ 計`);
    if (em - vm !== am || ef - vf !== af) throw new Error(`${where}: 有権者 − 投票者 ≠ 棄権者`);
    const counts: Counts = [em, ef, vm, vf];
    if (PREF_SET.has(label)) {
      if (label in prefs) throw new Error(`${label} が2度ある`);
      prefs[label] = counts;
    } else if (label.includes("・") && label.split("・").every((p) => PREF_SET.has(p))) {
      merged.push([label, counts]);
    } else if (label === "計" || label === "合計") {
      totals.push(counts);
    } else {
      throw new Error(`読めない行: ${where}`);
    }
  }
  const missing = PREFECTURES.filter((p) => !(p in prefs));
  if (missing.length > 0) throw new Error(`都道府県がない: ${missing.join("、")}`);
  for (const [label, counts] of merged) {
    const sum = label.split("・").reduce((acc, p) => acc.map((v, i) => v + prefs[p]![i]!), [0, 0, 0, 0]);
    if (sum.some((v, i) => v !== counts[i])) throw new Error(`${label}: 再掲 ${counts} ≠ 県の和 ${sum}`);
  }
  if (totals.length !== 1) throw new Error(`全国の行が1つに決まらない（${totals.length}）`);
  return { prefs, national: totals[0]! };
}

/** 確定結果調の区分。第12回までは全国区・地方区、第13回からは比例代表・選挙区。 */
const KIND: Record<string, "pr" | "sd"> = { 全国区: "pr", 比例代表: "pr", 地方区: "sd", 選挙区: "sd" };

interface HistoryLine {
  n: number | null;
  kind: "pr" | "sd" | null;
  nums: number[];
  rates: number[];
}

/** 行頭の区分（全国区…）か「第n回」と、その右の数。括弧（第1回の地方区）は外す。 */
function historyLine(line: string): HistoryLine {
  const s = line.normalize("NFKC");
  const round = /^\s*第\s*(\d+)\s*回(.*)$/.exec(s);
  const at = s.search(/[\d(]/);
  const rest = round !== null ? round[2]! : at < 0 ? "" : s.slice(at);
  const prefix = round !== null ? "" : clean(at < 0 ? s : s.slice(0, at));
  return {
    n: round !== null ? Number(round[1]) : null,
    kind: KIND[prefix] ?? null,
    nums: [...rest.matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replace(/,/g, ""))),
    rates: [...rest.matchAll(/\d+\.\d+/g)].map((m) => Number(m[0])),
  };
}

/**
 * 確定結果調の「当日有権者数、投票者数」と「男女別投票率」。どちらも回ごとに 全国区（比例代表）・第n回・地方区（選挙区）の3行。
 * 有権者数は、第2〜18回は両区分に共通で「第n回」の行に、第1回と第19回からは区分ごとの行にある。
 * 第1回の地方区の有権者数は無投票選挙区を除いた数（括弧書き）。投票率はこの数で割ってある。
 * 投票率は、投票者数 ÷ 有権者数を小数第2位で四捨五入したものが印字と一致するかを確かめる。
 */
export function parseHistory(text: string): NormalizedHistory {
  const pages = text.split("\f");
  const countsPage = pages.find((p) => p.includes("当日有権者数、投票者数") && p.includes("第１回"));
  const ratesPage = pages.find((p) => p.includes("男女別投票率") && p.includes("男女投票率の差"));
  if (countsPage === undefined) throw new Error("「当日有権者数、投票者数」の表がない");
  if (ratesPage === undefined) throw new Error("「男女別投票率」の表がない");

  const elections: NormalizedHistory["elections"] = [];
  let a: number[] | null = null;
  let mid: number[] | null = null;
  let n = 0;
  for (const line of countsPage.split("\n").map(historyLine)) {
    if (line.n !== null) {
      n = line.n;
      mid = line.nums;
    } else if (line.kind === "pr") {
      a = line.nums;
      mid = null;
    } else if (line.kind === "sd") {
      if (a === null || mid === null) throw new Error(`第${n}回: 区分の行がそろわない`);
      const b = line.nums;
      const split = (own: number[]): Counts => {
        const [em, ef, et, vm, vf, vt] = own.length === 6 ? own : [...mid!, ...own];
        if (em! + ef! !== et || vm! + vf! !== vt) throw new Error(`第${n}回: 男 + 女 ≠ 計`);
        return [em!, ef!, vm!, vf!];
      };
      if (elections.length > 0 && elections.at(-1)!.n !== n - 1) throw new Error(`第${n}回: 回が飛んでいる`);
      elections.push({ n, pr: split(a), sd: split(b) });
      a = null;
      mid = null;
    }
  }

  const rates = ratesPage
    .split("\n")
    .map(historyLine)
    .filter((l) => l.kind !== null && l.rates.length >= 3);
  if (rates.length !== elections.length * 2) throw new Error(`投票率の行が ${rates.length}（${elections.length}回分の2倍でない）`);
  elections.forEach((e, i) => {
    for (const [k, kind] of [[0, "pr"], [1, "sd"]] as const) {
      const r = rates[i * 2 + k]!;
      if (r.kind !== kind) throw new Error(`第${e.n}回: 投票率の行の区分が違う`);
      const [em, ef, vm, vf] = e[kind];
      const mine = [percent(vm, em), percent(vf, ef), percent(vm + vf, em + ef)];
      if (mine.some((v, j) => v !== r.rates[j])) throw new Error(`第${e.n}回 ${kind}: 投票率 ${r.rates.slice(0, 3)} ≠ ${mine}`);
    }
  });
  return { elections };
}

const AGE_ROW = new RegExp(`^\\s*(${[...AGE_GROUPS, "全体"].join("|")})\\s+([\\d.\\s]+)$`);

/**
 * 「参議院議員通常選挙における年代別投票率（抽出）の推移」の下の表。上のグラフにも同じ数字と年代の名前が散らばっているので、
 * 表の見出し（最後の「回」の行）より下だけを読む。値は右詰めで、欠けているのは古い回（10歳代は第24回から）。
 */
export function parseAge(text: string): NormalizedAge {
  const lines = text.split("\n");
  const head = lines.findLastIndex((l) => /^\s*回(\s+\d+)+\s*$/.test(l));
  if (head < 0) throw new Error("表の見出し（回）がない");
  const elections = lines[head]!.trim().split(/\s+/).slice(1).map(Number);

  const rows = new Map<string, number[]>();
  for (const line of lines.slice(head + 1)) {
    const m = AGE_ROW.exec(line);
    if (m === null) continue;
    if (rows.has(m[1]!)) throw new Error(`${m[1]} の行が2つある`);
    rows.set(m[1]!, m[2]!.trim().split(/\s+/).map(Number));
  }
  const pad = (key: string): (number | null)[] => {
    const values = rows.get(key);
    if (values === undefined) throw new Error(`${key} の行がない`);
    if (values.length > elections.length) throw new Error(`${key}: 値が回より多い`);
    return [...Array<null>(elections.length - values.length).fill(null), ...values];
  };
  const total = pad("全体");
  if (total.some((v) => v === null)) throw new Error("全体の行に欠けた回がある");
  return { elections, rates: AGE_GROUPS.map(pad), total: total as number[] };
}
