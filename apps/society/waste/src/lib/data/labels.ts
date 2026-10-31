/**
 * ごみ指標・処理フローカテゴリの表示定義。
 */

export type MetricKind = "tonnes" | "intensity" | "rate" | "volume";

export interface MetricDef {
  code: string;
  label: string;
  group: string;
  kind: MetricKind;
  /** 基礎データ側のコード。 */
  countCode?: string;
  /** 社会生活統計指標側の率コード。 */
  rateCode?: string;
  /** 地域ビューに載せるか。 */
  geo: boolean;
}

export interface FlowCodeDef {
  code: string;
  label: string;
  /** 排出内訳 / 資源化・処分 */
  group: "discharge" | "process";
  countCode: string;
}

/** 時代・地域の指標。 */
export const METRICS: readonly MetricDef[] = [
  {
    code: "discharge",
    label: "ごみ総排出量",
    group: "排出",
    kind: "tonnes",
    countCode: "H5609",
    geo: false,
  },
  {
    code: "per_capita",
    label: "1人1日当たり排出量",
    group: "排出",
    kind: "intensity",
    countCode: "H5610",
    geo: true,
  },
  {
    code: "recycle_rate",
    label: "ごみのリサイクル率",
    group: "リサイクル",
    kind: "rate",
    countCode: "H5614",
    rateCode: "#H055031",
    geo: true,
  },
  {
    code: "direct_recycle",
    label: "直接資源化量",
    group: "リサイクル",
    kind: "tonnes",
    countCode: "H561201",
    geo: false,
  },
  {
    code: "after_recycle",
    label: "中間処理後再生利用量",
    group: "リサイクル",
    kind: "tonnes",
    countCode: "H5613",
    geo: false,
  },
  {
    code: "final_disposal",
    label: "ごみ最終処分量",
    group: "最終処分",
    kind: "tonnes",
    countCode: "H5615",
    geo: false,
  },
  {
    code: "landfill_rate",
    label: "ごみ埋立率",
    group: "最終処分",
    kind: "rate",
    rateCode: "#H055041",
    geo: true,
  },
  {
    code: "residual",
    label: "最終処分場残余容量",
    group: "最終処分",
    kind: "volume",
    countCode: "H5617",
    rateCode: "#H05505",
    geo: true,
  },
] as const;

/** 処理ビューのカテゴリ。 */
export const FLOW_CODES: readonly FlowCodeDef[] = [
  {
    code: "planned",
    label: "計画収集",
    group: "discharge",
    countCode: "H560901",
  },
  {
    code: "direct_in",
    label: "直接搬入",
    group: "discharge",
    countCode: "H560902",
  },
  {
    code: "self",
    label: "自家処理",
    group: "discharge",
    countCode: "H560903",
  },
  {
    code: "group",
    label: "集団回収",
    group: "discharge",
    countCode: "H560904",
  },
  {
    code: "direct_recycle",
    label: "直接資源化",
    group: "process",
    countCode: "H561201",
  },
  {
    code: "after_recycle",
    label: "中間処理後再生利用",
    group: "process",
    countCode: "H5613",
  },
  {
    code: "final_disposal",
    label: "最終処分",
    group: "process",
    countCode: "H5615",
  },
] as const;

/** ごみ系列が概ね揃い始める年（実測で調整可）。 */
export const ERA_FROM = 1999;
export const ERA_TO = 2023;

export const PREF_AREAS = [
  "00000",
  ...Array.from({ length: 47 }, (_, i) => String(i + 1).padStart(2, "0") + "000"),
] as const;
