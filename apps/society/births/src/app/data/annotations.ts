/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1949,
    label: "第1次ベビーブーム",
    detail: "戦後直後の出生数がピーク帯。その後は急減する。",
  },
  {
    year: 1966,
    label: "丙午",
    detail: "迷信の影響で出生数が大きく落ち込み、翌年に反動増。",
  },
  {
    year: 1973,
    label: "第2次ベビーブーム",
    detail: "団塊世代の子ども世代で出生数が再び高水準。以降は長期低下。",
  },
  {
    year: 2005,
    label: "TFRの戦後最低近傍",
    detail: "合計特殊出生率が1.26前後まで低下した年次のひとつ。",
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
    detail: "出生の年次系列に1944–1946年の欠落がある。",
    kind: "missing",
  },
];

export const NOTES = [
  {
    term: "単位",
    detail:
      "出生数は届出に基づく全数。出生率は人口千対（‰）。合計特殊出生率は女性1人あたり。出生性比は女児100に対する男児。平均年齢は歳。",
  },
  {
    term: "合計特殊出生率",
    detail:
      "その年の年齢別出生率を合計した指標。1人の女性が一生に生む子どもの数の目安。",
  },
  {
    term: "母親の年齢",
    detail:
      "年齢ビューは母の年齢5歳階級別。率は女性人口千対。時代ビューの平均年齢は出生順位総数の父母平均。",
  },
  {
    term: "出典",
    detail: "厚生労働省「人口動態調査」確定数（e-Stat）。",
  },
] as const;
