/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1972,
    label: "婚姻件数のピーク近傍",
    detail: "第2次ベビーブーム世代が結婚適齢期に入る前後で婚姻件数が高水準。",
  },
  {
    year: 2002,
    label: "離婚件数のピーク近傍",
    detail: "人口動態統計の離婚件数が戦後の高水準帯。その後は緩やかに減少。",
  },
  {
    year: 2020,
    label: "コロナ禍",
    detail: "婚姻件数が大きく落ち込み、その後も回復は限定的。",
  },
] as const;

/** TrendStack が参照する帯注記。 */
export const SPANS: readonly {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind: "missing" | "scope";
}[] = [
  {
    from: 1944,
    to: 1946,
    label: "戦時欠測",
    detail: "人口動態総覧に1944–1946年の欠落がある。",
    kind: "missing",
  },
];

export const NOTES = [
  {
    term: "単位",
    detail:
      "件数は届出に基づく全数。婚姻率・離婚率は人口千対（‰）。平均年齢・同居期間は年。再婚割合・同居5年未満は構成比。",
  },
  {
    term: "初婚年齢",
    detail:
      "「各届出年に結婚生活に入り届け出たもの」の平均。全婚姻ではなく初婚の夫妻。",
  },
  {
    term: "同居期間",
    detail:
      "離婚時の同居期間。平均同居期間と、5年未満の離婚が占める割合を時代ビューに載せる。",
  },
  {
    term: "出典",
    detail: "厚生労働省「人口動態調査」確定数（e-Stat）。",
  },
] as const;
