/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1949,
    label: "戦後のピーク",
    detail:
      "年末収容が約9万7千人。戦後直後の刑事施設が最も膨らんだ年。",
  },
  {
    year: 2002,
    label: "収容率100%超",
    detail:
      "収容定員を上回る過密。全体の収容率は約106%。平成一桁後半から18年頃までの混雑の頂点。",
  },
  {
    year: 2006,
    label: "平成の収容ピーク",
    detail:
      "年末収容が8万1,255人。その後は減少が続き、2024年は約4万1千人。",
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
    from: 1998,
    to: 2007,
    label: "過密の十年",
    detail: "収容率が高く、平成の収容人員が増えた時期。",
    kind: "scope",
  },
];

export const NOTES = [
  {
    term: "年末収容",
    detail: "各年末に刑事施設にいる人。受刑者のほか、未決の被告人・被疑者などを含む。",
  },
  {
    term: "入所受刑者",
    detail: "その年に刑の執行のため入所した人。ストックではなくフロー。",
  },
  {
    term: "収容率",
    detail: "収容人員÷収容定員。100%を超えると定員オーバー。1972年以降。",
  },
  {
    term: "再入者率",
    detail: "入所受刑者のうち、過去にも受刑した人の割合。1989年以降。",
  },
  {
    term: "仮釈放率",
    detail: "出所受刑者のうち仮釈放で出た人の割合。満期釈放との対。",
  },
  {
    term: "保護観察",
    detail:
      "刑務所の外で見る仕組み。仮釈放と、執行猶予に付く保護観察がある。少年は別コンテンツ。",
  },
  {
    term: "出典",
    detail: "法務省「犯罪白書」令和7年版。原統計は矯正統計年報・保護統計年報。",
  },
] as const;
