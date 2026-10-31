/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1973,
    label: "石油危機前後",
    detail: "高度成長期の終わり。以後、就業構造と引退年齢の前提が変わり始める。",
  },
  {
    year: 1991,
    label: "バブル崩壊",
    detail: "以後、失業率の上昇と雇用慣行の見直しが進む。",
  },
  {
    year: 2000,
    label: "高齢者就業の底近傍",
    detail: "65歳以上の就業率は長期で低い水準。その後の上昇の起点として見る。",
  },
  {
    year: 2011,
    label: "東日本大震災",
    detail: "岩手・宮城・福島の一部で調査実施が困難。年次系列に影響。",
  },
  {
    year: 2013,
    label: "高年齢者雇用安定法改正",
    detail: "希望者全員の65歳までの雇用確保措置が義務化。高齢就業の制度的転機。",
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
    from: 1953,
    to: 1967,
    label: "就業率は1968年〜",
    detail: "就業率の公表系列は1968年〜。労働力人口比率・失業率は1953年〜。",
    kind: "missing",
  },
];

export const NOTES = [
  {
    term: "単位",
    detail: "率は％（表示は小数を百分率に戻す）。公表値を ÷100 した小数で配信。",
  },
  {
    term: "分母",
    detail:
      "就業率・労働力人口比率の分母は当該年齢階級の人口。完全失業率は当該年齢の労働力人口。",
  },
  {
    term: "就業率の開始年",
    detail: "就業率は1968年〜。それ以前の年次は欠測。",
  },
  {
    term: "出典",
    detail: "総務省「労働力調査」基本集計（年平均・全国、e-Stat）。",
  },
] as const;
