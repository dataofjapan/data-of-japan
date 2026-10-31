/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1985,
    label: "被服の比重",
    detail: "二人以上世帯で被服・履物の支出が大きく、通信はまだ小さい。",
  },
  {
    year: 2000,
    label: "世帯定義の切替",
    detail:
      "農林漁家世帯を含む「二人以上の世帯」系列へ接続。それ以前は農林漁家を除く系列。",
  },
  {
    year: 2020,
    label: "コロナ前後",
    detail: "外食・教養娯楽の落ち込みと、食料・通信の相対的な持ち上がりが見える年がある。",
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
    from: 1985,
    to: 1999,
    label: "農林漁家除く",
    detail: "1985–1999年は農林漁家世帯を除く二人以上世帯。",
    kind: "scope",
  },
];

export const NOTES = [
  {
    term: "金額",
    detail: "世帯あたり月平均（円・名目）。物価補正はしていない。",
  },
  {
    term: "構成比",
    detail: "消費支出に占める割合。エンゲル係数は公表系列（食料／消費支出）。",
  },
  {
    term: "住居",
    detail: "家賃地代・設備修繕等。持ち家の帰属家賃は含まない。",
  },
  {
    term: "出典",
    detail: "総務省「家計調査」家計収支編・二人以上の世帯・用途分類（e-Stat）。",
  },
] as const;
