/** 時代・男女ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1975,
    label: "高校進学がほぼ普遍化",
    detail: "中学校卒業者の高校等進学率は9割超。戦後の「どこまで学ぶか」の第一段階が定着した。",
  },
  {
    year: 1990,
    label: "大学・短大の大衆化",
    detail: "過年度含む大学・短大進学率が上昇し続け、短大から大学へのシフトも進む。",
  },
  {
    year: 2016,
    label: "年次統計の終点",
    detail: "学校基本調査年次統計の進学率表は e-Stat 上 2016 年まで。以降は SSDS で一部系列を延長。",
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
    from: 2017,
    to: 2023,
    label: "SSDS延長",
    detail: "高校（通信制除く）と大学・短大現役は社会・人口統計体系で延長。",
    kind: "scope",
  },
];

export const NOTES = [
  {
    term: "進学率",
    detail:
      "指標ごとに定義が異なる。現役／過年度含む、通信制の扱いをラベルで区別している。",
  },
  {
    term: "2017年以降",
    detail:
      "年次統計は2016年まで。高校（通信制除く）と大学・短大現役は、定義が近い SSDS 指標で2023年まで接続。",
  },
  {
    term: "学校種",
    detail:
      "在学者数は社会・人口統計体系「Ｅ　教育」（学校基本調査由来）。構成比は表示中の学校種合計を分母とする。",
  },
  {
    term: "出典",
    detail: "文部科学省「学校基本調査」（社会・人口統計体系経由含む、e-Stat）。",
  },
] as const;
