/** 男女別の有権者数と投票者数。[有権者 男, 有権者 女, 投票者 男, 投票者 女]。 */
export type Counts = [number, number, number, number];

/** 都道府県別有権者数、投票者数の表（1制度分）。 */
export interface PrefTable {
  prefs: Record<string, Counts>;
  /** 同じ表の全国の行（「計」または「合計」）。 */
  national: Counts;
}

/** 各回の結果ページの表（第19回以降）。 */
export interface NormalizedElection {
  n: number;
  sd: PrefTable;
  pr: PrefTable;
}

/** 確定結果調の全国の表（第1〜26回）。pr は第12回まで全国区、sd は地方区。 */
export interface NormalizedHistory {
  elections: { n: number; sd: Counts; pr: Counts }[];
}

/** 年代別投票率（抽出）。値は表に書かれた百分率のまま。 */
export interface NormalizedAge {
  elections: number[];
  /** rates[年代][回]。その回に調べていない年代は null。 */
  rates: (number | null)[][];
  /** 「全体」の行。 */
  total: number[];
}
