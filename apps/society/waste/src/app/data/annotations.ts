/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 2005,
    label: "原単位の起点",
    detail: "1人1日当たり排出量の SSDS 収録が揃い始める年。この年は 1,131g。",
  },
  {
    year: 2010,
    label: "減量の定着",
    detail: "総排出・最終処分の縮小が続き、リサイクル率が二桁台後半に乗る時期。",
  },
  {
    year: 2020,
    label: "コロナ禍",
    detail: "生活様式の変化と重なり、排出の動きにも影響が見える年。",
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
    from: 1999,
    to: 2004,
    label: "内訳の欠測期",
    detail: "総排出・リサイクル率はあるが、排出内訳・直接資源化などは 2005 年度以降。",
    kind: "missing",
  },
] as const;

export const NOTES = [
  {
    term: "一般廃棄物",
    detail: "市町村等が処理するごみ。産業廃棄物は含まない。",
  },
  {
    term: "1人1日当たり",
    detail: "住民1人・1日あたりの排出量（g）。総量ではなく原単位の比較に使う。",
  },
  {
    term: "リサイクル率",
    detail: "資源化された量の割合。直接資源化と中間処理後の再生利用などを含む。",
  },
  {
    term: "出典",
    detail:
      "環境省「一般廃棄物処理事業実態調査」を社会・人口統計体系（Ｈ居住）経由で取得（e-Stat）。",
  },
] as const;
