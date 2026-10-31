/** 時代ビューの注記・図中マーク。 */

export const MARKS = [
  {
    year: 2020,
    label: "コロナ禍の調査年",
    detail:
      "令和2年患者調査。外来受療の抑制などが傷病構成に影響した可能性がある。",
  },
  {
    year: 2023,
    label: "最新・令和5年",
    detail: "令和5年患者調査。受療率・推計患者数の最新時点。",
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
    term: "受療率",
    detail: "推計患者数を人口10万人あたりにした値。公表値をそのまま表示する。",
  },
  {
    term: "推計患者数",
    detail: "調査日における推計。単位は千人。年間の延べ患者数ではない。",
  },
  {
    term: "調査周期",
    detail: "患者調査は3年に1回。時代ビューの点は調査年のみ。",
  },
  {
    term: "死因との違い",
    detail:
      "人口動態の死因は死亡の全数。患者調査は生きている人の受療。傷病構成は一致しない。",
  },
] as const;
