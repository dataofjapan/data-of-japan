/** 時代・出来事ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1987,
    label: "バブル期の流入",
    detail:
      "1980年代後半、東京圏への転入超過が大きく膨らんだ。地価高騰と本社機能の集中が重なる時期。",
  },
  {
    year: 2011,
    label: "東日本大震災",
    detail:
      "東北からの転出と首都圏の転入超過の落ち込みが同時に見える。被災県の転出超過が目立つ年。",
  },
  {
    year: 2020,
    label: "コロナ禍",
    detail:
      "東京圏の転入超過が急減し、一部の年は転出超過に振れた。リモート勤務と地方移住の議論が広がった。",
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
    from: 1987,
    to: 1991,
    label: "バブル",
    detail: "東京圏への純流入が特に大きい時期。",
    kind: "scope",
  },
  {
    from: 2020,
    to: 2021,
    label: "コロナ",
    detail: "東京一極の流れが一時的に弱まった時期。",
    kind: "scope",
  },
];

export const NOTES = [
  {
    term: "単位",
    detail: "人（移動者数・転入超過数）。住民票の届け出に基づく国内移動。人口そのものではない。",
  },
  {
    term: "日本人移動者",
    detail:
      "2014年以降「移動者」には外国人住民が含まれる。長期比較のため表示は日本人移動者に揃えている。",
  },
  {
    term: "三大都市圏",
    detail:
      "東京圏＝埼玉・千葉・東京・神奈川。名古屋圏＝岐阜・愛知・三重。大阪圏＝京都・大阪・兵庫・奈良。",
  },
  {
    term: "出典",
    detail: "総務省「住民基本台帳人口移動報告」（e-Stat）。1954年以降の年次系列を接続。",
  },
] as const;

/** 出来事ビュー用の説明カード。 */
export const EVENTS = [
  {
    id: "bubble",
    year: 1987,
    from: 1987,
    to: 1991,
    label: "バブルと東京圏",
    detail:
      "地価高騰と本社・金融の集中が重なり、東京圏の転入超過が大きく伸びた。名古屋・大阪圏との差も開く。",
  },
  {
    id: "quake",
    year: 2011,
    from: 2011,
    to: 2012,
    label: "東日本大震災",
    detail:
      "被災県からの転出と、東京圏の転入超過の落ち込みが同じ年に重なる。地域ビューで東北の転出超過を確認できる。",
  },
  {
    id: "covid",
    year: 2020,
    from: 2020,
    to: 2021,
    label: "コロナ禍",
    detail:
      "東京圏の転入超過が急減した。一極集中が「止まった」ように見えたが、その後の戻り方も時代ビューで追える。",
  },
] as const;
