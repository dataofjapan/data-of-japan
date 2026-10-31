/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 1960,
    label: "米中心の食卓",
    detail: "1人1年当たりの米の供給純食料が大きく、小麦・肉・乳は相対的に小さい。",
  },
  {
    year: 1989,
    label: "魚介のピーク前後",
    detail: "魚介類の供給が長期で高水準だった時期。その後は減少し、肉類が上回る。",
  },
  {
    year: 2000,
    label: "肉が魚を上回る",
    detail: "1人当たり供給純食料で肉類が魚介類を追い抜く方向に転じた（年度により前後）。",
  },
] as const;

/** TrendStack が参照する帯注記（空）。 */
export const SPANS: readonly {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind: "missing" | "scope";
}[] = [];

export const NOTES = [
  {
    term: "供給純食料",
    detail:
      "可食部ベースの1人1年当たり供給量（kg）。家計調査の摂取量や外食の実測とは接続しない。",
  },
  {
    term: "供給熱量",
    detail: "1人1日当たりの供給熱量（kcal）。品目ビューの構成比は熱量合計を分母にする。",
  },
  {
    term: "自給率",
    detail:
      "重量ベースの品目別自給率と、熱量・生産額ベースの総合自給率。飼料自給率系列は除外。",
  },
  {
    term: "出典",
    detail: "農林水産省「食料需給表」令和5年度確報（e-Stat）。期間は1960–2023年度。",
  },
] as const;
