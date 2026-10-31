/** 図上の注記。 */

export const SPANS: readonly {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind: "missing" | "scope";
}[] = [];

export const MARKS: { year: number; label: string; detail: string }[] = [
  {
    year: 2020,
    label: "新型コロナ",
    detail: "出国日本人数は317万人で、前年の16%。2021年はさらに減り、2023年から戻り始めた。",
  },
];

export const NOTES: string[] = [
  "出国日本人数は出国した回数。同じ人が1年に2回出れば2と数える。ある時点で海外に住んでいる人数（在留邦人）の内訳ではない。",
];
