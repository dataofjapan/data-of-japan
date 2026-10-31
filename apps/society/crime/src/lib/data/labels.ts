/**
 * 犯罪指標・罪種カテゴリの表示定義。
 */

export type MetricKind = "cases" | "rate" | "share";

export interface MetricDef {
  code: string;
  label: string;
  group: string;
  kind: MetricKind;
  /** 基礎データ側の件数コード。 */
  countCode?: string;
  /** 社会生活統計指標側の率コード。 */
  rateCode?: string;
  /** 地域ビューに載せるか。 */
  geo: boolean;
}

export interface TypeCodeDef {
  code: string;
  label: string;
  countCode?: string;
  clearCode?: string;
  /** 指標表の構成比コード（あれば）。 */
  shareCode?: string;
  /** 残差（その他）か。 */
  residual?: boolean;
}

/** 時代・地域の指標。 */
export const METRICS: readonly MetricDef[] = [
  {
    code: "cognized",
    label: "刑法犯認知件数",
    group: "認知",
    kind: "cases",
    countCode: "K4201",
    geo: false,
  },
  {
    code: "cognized_rate",
    label: "認知件数（人口千人当たり）",
    group: "認知",
    kind: "rate",
    rateCode: "#K06101",
    geo: true,
  },
  {
    code: "cleared",
    label: "刑法犯検挙件数",
    group: "検挙",
    kind: "cases",
    countCode: "K4202",
    geo: false,
  },
  {
    code: "clearance",
    label: "刑法犯検挙率",
    group: "検挙",
    kind: "rate",
    rateCode: "#K06201",
    geo: true,
  },
  {
    code: "theft",
    label: "窃盗犯認知件数",
    group: "罪種",
    kind: "cases",
    countCode: "K420103",
    geo: false,
  },
  {
    code: "theft_rate",
    label: "窃盗認知（人口千人当たり）",
    group: "罪種",
    kind: "rate",
    rateCode: "#K06104",
    geo: true,
  },
  {
    code: "theft_clearance",
    label: "窃盗犯検挙率",
    group: "罪種",
    kind: "rate",
    rateCode: "#K06204",
    geo: true,
  },
  {
    code: "cleared_persons",
    label: "刑法犯検挙人員",
    group: "検挙",
    kind: "cases",
    countCode: "K4203",
    geo: false,
  },
  {
    code: "juvenile",
    label: "少年刑法犯検挙人員",
    group: "検挙",
    kind: "cases",
    countCode: "K4204",
    geo: false,
  },
  {
    code: "special",
    label: "特別法犯検挙件数",
    group: "特別法",
    kind: "cases",
    countCode: "K4301",
    geo: false,
  },
  {
    code: "stimulant",
    label: "覚醒剤取締検挙件数",
    group: "特別法",
    kind: "cases",
    countCode: "K4303",
    geo: false,
  },
] as const;

/** 罪種ビューのカテゴリ。 */
export const TYPE_CODES: readonly TypeCodeDef[] = [
  {
    code: "heinous",
    label: "凶悪犯",
    countCode: "K420101",
    clearCode: "K420201",
    shareCode: "#K06401",
  },
  {
    code: "violent",
    label: "粗暴犯",
    countCode: "K420102",
    clearCode: "K420202",
    shareCode: "#K06402",
  },
  {
    code: "theft",
    label: "窃盗犯",
    countCode: "K420103",
    clearCode: "K420203",
    shareCode: "#K06403",
  },
  {
    code: "intellectual",
    label: "知能犯",
    countCode: "K420104",
    clearCode: "K420204",
  },
  {
    code: "moral",
    label: "風俗犯",
    countCode: "K420105",
    clearCode: "K420205",
    shareCode: "#K06405",
  },
  {
    code: "other",
    label: "その他",
    residual: true,
  },
] as const;

export const ERA_FROM = 1975;
export const ERA_TO = 2024;

export const PREF_AREAS = [
  "00000",
  ...Array.from({ length: 47 }, (_, i) => String(i + 1).padStart(2, "0") + "000"),
] as const;
