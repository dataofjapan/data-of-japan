/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1973,
    label: "石油危機前後",
    detail: "高度成長期の終わり。完全失業率はなお低水準だが、その後の構造変化の起点。",
  },
  {
    year: 1991,
    label: "バブル崩壊",
    detail: "以後、失業率の上昇と正規雇用の伸び悩みが続く。",
  },
  {
    year: 2002,
    label: "失業率ピーク近傍",
    detail: "バブル後の調整と金融危機の余波。完全失業率は戦後高い水準。",
  },
  {
    year: 2011,
    label: "東日本大震災",
    detail: "岩手・宮城・福島の一部で調査実施が困難。年次系列に影響。",
  },
  {
    year: 2013,
    label: "正規・非正規のAPI接続開始",
    detail: "雇用形態別の年平均は本ダッシュボードでは2013年〜（それ以前は長期時系列ファイル）。",
  },
] as const;

export const SPANS: readonly {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind: "missing" | "scope";
}[] = [];

export const NOTES = [
  {
    term: "単位",
    detail:
      "率は％（表示は小数を百分率に戻す）。人数は労働力調査の万人単位（標本推計）。",
  },
  {
    term: "分母",
    detail:
      "就業率・労働力人口比率の分母は15歳以上人口。完全失業率は労働力人口。正規・非正規比は役員を除く雇用者。地位の構成比は就業者総数。",
  },
  {
    term: "正規・非正規",
    detail:
      "API上の年平均は2013年〜。1984年〜の長期時系列はe-Statのファイル提供のみで、第1版では未接続。",
  },
  {
    term: "出典",
    detail: "総務省「労働力調査」基本集計（年平均・全国、e-Stat）。",
  },
] as const;
