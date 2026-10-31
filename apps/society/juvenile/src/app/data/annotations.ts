/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1951,
    label: "戦後の入院ピーク",
    detail: "少年院入院が約1万1千人。戦後直後に施設が膨らんだ年。",
  },
  {
    year: 2000,
    label: "平成の入院ピーク",
    detail: "入院 6,052人。その後は長期に減り、2019年以降は最小を更新した。",
  },
  {
    year: 2023,
    label: "減少が止まった年",
    detail: "入院が再び増えた。2024年は 1,828人。特定少年の扱いもこの前後で変わる。",
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
    term: "少年院入院",
    detail: "新たに少年院送致となった人。白書の「少年院入院者」。新収容者等に相当する。",
  },
  {
    term: "鑑別所の被収容者",
    detail: "観護措置などで入り、その年に移送・逃走・死亡以外で退所した人。入所のフローに近い。1982年から。",
  },
  {
    term: "処遇",
    detail: "鑑別所を出たあとの分かれ方。保護観察、少年院、検察官送致、審判不開始など。1975年から。",
  },
  {
    term: "18歳以上",
    detail: "入院時に20歳に達している人がいるため、最も高い年齢層を18歳以上としている。",
  },
  {
    term: "出典",
    detail: "法務省「犯罪白書」令和7年版。原統計は少年矯正統計年報。",
  },
] as const;
