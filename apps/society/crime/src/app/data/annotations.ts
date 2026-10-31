/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 2002,
    label: "認知のピーク",
    detail:
      "刑法犯認知件数が戦後的な高水準に達し、検挙率も大きく下がった年として知られる。",
  },
  {
    year: 2012,
    label: "長期減少の途上",
    detail: "ピーク後の減少が続き、窃盗を中心に件数が縮んだ時期。",
  },
  {
    year: 2020,
    label: "コロナ禍",
    detail: "外出制約などと重なり、認知件数の動きにも影響が見える年。",
  },
] as const;

export const SPANS: readonly {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind: "missing" | "scope";
}[] = [
  {
    from: 2001,
    to: 2003,
    label: "ピーク期",
    detail: "認知件数の高止まりと検挙率低下が重なる時期。",
    kind: "scope",
  },
];

export const NOTES = [
  {
    term: "認知件数",
    detail: "警察が認知した刑法犯の件数。暗数（未届出・未認知）は含まない。",
  },
  {
    term: "検挙率",
    detail: "検挙件数 ÷ 認知件数。認知が増えると下がって見えることがある。",
  },
  {
    term: "罪種",
    detail:
      "凶悪・粗暴・窃盗・知能・風俗、および残差のその他。窃盗が件数の大半を占める。",
  },
  {
    term: "出典",
    detail:
      "警察庁「犯罪統計」を社会・人口統計体系（Ｋ安全）経由で取得（e-Stat・1975年以降）。",
  },
] as const;
