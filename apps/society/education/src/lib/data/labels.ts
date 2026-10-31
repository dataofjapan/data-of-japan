/**
 * 進学率指標・学校種・性別の表示定義。
 */

export type Sex = "total" | "male" | "female";

export interface RateMetricDef {
  code: string;
  label: string;
  group: string;
  /** 年次統計 cat02 コード。 */
  annualCode: string;
  /**
   * SSDS で 2017 年以降を埋めるときの計・男・女コード。
   * 定義が近接する系列だけ接続する（docs/data-sources.md）。
   */
  ssds?: { total: string; male: string; female: string };
}

export interface SchoolDef {
  code: string;
  label: string;
  /** SSDS 在学者数コード。 */
  countCode: string;
}

export const SEXES: readonly { code: Sex; label: string; annualCode: string }[] = [
  { code: "total", label: "計", annualCode: "0000000010" },
  { code: "male", label: "男", annualCode: "0000000020" },
  { code: "female", label: "女", annualCode: "0000000030" },
] as const;

export const RATE_METRICS: readonly RateMetricDef[] = [
  {
    code: "kindergarten",
    label: "幼稚園就園率",
    group: "就園",
    annualCode: "0000000010",
  },
  {
    code: "kodomoen",
    label: "認定こども園就園率",
    group: "就園",
    annualCode: "0000000090",
  },
  {
    code: "hs",
    label: "高等学校等への進学率",
    group: "高校",
    annualCode: "0000000020",
  },
  {
    code: "hs_no_corr",
    label: "高校進学率（通信制除く）",
    group: "高校",
    annualCode: "0000000030",
    ssds: { total: "E3801", male: "E380101", female: "E380102" },
  },
  {
    code: "univ_immediate",
    label: "大学・短大等への現役進学率",
    group: "大学・短大",
    annualCode: "0000000040",
    ssds: { total: "E4701", male: "E470101", female: "E470102" },
  },
  {
    code: "univ_immediate_no_corr",
    label: "大学・短大現役（通信除く）",
    group: "大学・短大",
    annualCode: "0000000050",
  },
  {
    code: "univ_jr",
    label: "大学・短大進学率（過年度含む）",
    group: "大学・短大",
    annualCode: "0000000060",
  },
  {
    code: "univ",
    label: "大学（学部）進学率（過年度含む）",
    group: "大学・短大",
    annualCode: "0000000070",
  },
  {
    code: "jr_college",
    label: "短期大学進学率（過年度含む）",
    group: "大学・短大",
    annualCode: "0000000080",
  },
] as const;

export const SCHOOLS: readonly SchoolDef[] = [
  { code: "kindergarten", label: "幼稚園", countCode: "E1501" },
  { code: "kodomoen", label: "認定こども園", countCode: "E1701" },
  { code: "elementary", label: "小学校", countCode: "E2501" },
  { code: "junior_high", label: "中学校", countCode: "E3501" },
  { code: "high_school", label: "高等学校", countCode: "E4501" },
  { code: "junior_college", label: "短期大学", countCode: "E6301" },
  { code: "university", label: "大学", countCode: "E6302" },
  { code: "senmon", label: "専修学校", countCode: "E7201" },
] as const;

/** 時代・男女ビューの表示年域。 */
export const RATE_FROM = 1948;
export const RATE_TO = 2023;

/** 学校種ビューの表示年域（SSDS）。 */
export const SCHOOL_FROM = 1975;
export const SCHOOL_TO = 2024;
