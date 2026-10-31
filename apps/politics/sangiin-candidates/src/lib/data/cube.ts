/**
 * 配信データ（public/data/*.json）の型。scripts/build.ts が書き、画面が読む。
 * 回のメタ情報（執行日・版・改選数）は elections.ts を正本とし、ここには回番号だけ持つ。
 */

/** sd 選挙区、pr 比例代表、all 全体（選挙区 + 比例代表）。 */
export type System = "sd" | "pr" | "all";

/** cand 候補者、win 当選者。 */
export type Kind = "cand" | "win";

/**
 * 全国。counts[候補者/当選者][制度][党][回] = [新男, 新女, 前男, 前女, 元男, 元女]。
 * その回に候補のない党は 0 が並ぶ。
 */
export interface NationalJson {
  elections: number[];
  parties: string[];
  counts: Record<Kind, Record<System, number[][][]>>;
}

/**
 * 選挙区。都道府県の並びで持つ。
 * districts[回][県] はその県が入る選挙区の名前（合区は「鳥取県・島根県」）、seats[回][県] はその選挙区の定数、
 * counts[候補者/当選者][党][回][県] はその選挙区の人数。合区の2県は同じ値を持つので、足すときは選挙区ごとに1度だけ。
 */
export interface PrefJson {
  elections: number[];
  prefs: string[];
  parties: string[];
  districts: string[][];
  seats: number[][];
  counts: Record<Kind, number[][][]>;
}
