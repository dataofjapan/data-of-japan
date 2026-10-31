/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1990,
    label: "バブル期末",
    detail: "大規模調査として利用交通手段を把握。鉄道は JR と JR以外に分かれていた。",
  },
  {
    year: 2010,
    label: "自家用車が半数近く",
    detail: "単一手段では自家用車が最大。大都市圏では鉄道シェアが高い。",
  },
  {
    year: 2020,
    label: "コロナ禍の調査年",
    detail: "10月1日現在。テレワーク普及前の通勤構造を含む最終大規模調査時点。",
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
      "15歳以上の自宅外就業者・通学者（令和2年表では通勤者・通学者）。人口そのものではない。",
  },
  {
    term: "単一手段",
    detail:
      "表示は「その手段だけを使う人」の割合。鉄道＋バスなどの複合利用者は総数側に残るため、手段シェアの和は100%にならない。",
  },
  {
    term: "調査年",
    detail: "利用交通手段は大規模調査年（西暦末尾0）のみ。第1版は1990・2000・2010・2020。",
  },
  {
    term: "1990年の鉄道",
    detail: "JR（バスを除く）と JR以外の鉄道・電車を合算して「鉄道・電車」としている。",
  },
] as const;
