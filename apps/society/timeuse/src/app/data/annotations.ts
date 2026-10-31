/** UI に短く出す注記・区切り。 */

export const NOTES = {
  era: "単位は1日あたりの総平均時間（分）。全員平均。葉20種類の合計は概ね1440分。2021年は新型コロナウイルス感染症の影響を受けた調査年。",
  age: "年齢は5歳階級（10歳以上）。2016年・2021年のみ（調査票B結果の調査票A区分表）。",
  geo: "相対値は全国=1。都道府県の当該行動時間を全国で割った比。1996–2021年。",
} as const;

export const MARKS: { year: number; label: string; detail: string }[] = [
  {
    year: 2021,
    label: "コロナ下の調査",
    detail: "令和3年調査は新型コロナウイルス感染症の影響下で実施された。",
  },
];

/** TrendStack が参照する区切り帯。生活時間では未使用のため空。 */
export const SPANS: { from: number; to: number; label: string; kind: "missing" | "scope" }[] =
  [];