/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1970,
    label: "死者ピーク",
    detail:
      "モータリゼーションの進展と重なり、24時間以内の交通事故死者が約1.7万人に達した。以降は長期に減少する。",
  },
  {
    year: 2004,
    label: "発生件数の山",
    detail:
      "発生件数・負傷者数が戦後でも特に多い時期のひとつ。死者数はこの頃すでにピークから大きく下がっている。",
  },
  {
    year: 2020,
    label: "コロナ禍",
    detail: "交通量の減少も背景に、発生件数・死傷者数がさらに落ち込んだ年。",
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
    from: 1965,
    to: 1973,
    label: "モータリゼーション",
    detail: "自動車の普及と交通事故死傷の急増が重なる時期。",
    kind: "scope",
  },
] as const;

export const NOTES = [
  {
    term: "単位",
    detail:
      "発生件数は件、死者・負傷者は人。死者は交通事故発生から24時間以内。人口比は人口10万人当たり。",
  },
  {
    term: "接続",
    detail:
      "1948–2018年は警察庁の発生状況推移表、2019年以降は社会・人口統計体系（Ｋ安全）で延長。2018年で突合一致を確認。",
  },
  {
    term: "被害ビュー",
    detail: "状態別・年齢別の内訳は e-Stat DB が2018年まで。構成比は各切り口の計を分母とする。",
  },
  {
    term: "出典",
    detail: "警察庁「道路の交通に関する統計」（社会・人口統計体系経由含む、e-Stat）。",
  },
] as const;
