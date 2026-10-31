/**
 * 婚姻・離婚指標の表示定義。
 */

export type MetricUnit = "count" | "per_mille" | "years" | "share";

export interface MetricDef {
  code: string;
  label: string;
  group: string;
  unit: MetricUnit;
  /** 地域ビューに載せるか。 */
  geo: boolean;
}

/** 時代ビューの指標。 */
export const ERA_METRICS: readonly MetricDef[] = [
  { code: "marriage_count", label: "婚姻件数", group: "件数", unit: "count", geo: false },
  { code: "divorce_count", label: "離婚件数", group: "件数", unit: "count", geo: false },
  { code: "marriage_rate", label: "婚姻率", group: "率", unit: "per_mille", geo: true },
  { code: "divorce_rate", label: "離婚率", group: "率", unit: "per_mille", geo: true },
  {
    code: "avg_age_first_husband",
    label: "平均初婚年齢（夫）",
    group: "初婚年齢",
    unit: "years",
    geo: true,
  },
  {
    code: "avg_age_first_wife",
    label: "平均初婚年齢（妻）",
    group: "初婚年齢",
    unit: "years",
    geo: true,
  },
  {
    code: "remarriage_share_husband",
    label: "再婚割合（夫）",
    group: "初再婚",
    unit: "share",
    geo: false,
  },
  {
    code: "remarriage_share_wife",
    label: "再婚割合（妻）",
    group: "初再婚",
    unit: "share",
    geo: false,
  },
  {
    code: "avg_cohabit",
    label: "平均同居期間",
    group: "同居期間",
    unit: "years",
    geo: false,
  },
  {
    code: "cohabit_under5_share",
    label: "同居5年未満の離婚割合",
    group: "同居期間",
    unit: "share",
    geo: false,
  },
] as const;

/** 地域ビューの指標（全国比が意味を持つもの）。 */
export const GEO_METRICS: readonly MetricDef[] = ERA_METRICS.filter((m) => m.geo);

/** 年齢ビュー: 年齢コード（率表と揃えた5歳階級）。 */
export const AGE_BANDS: readonly { code: string; label: string }[] = [
  { code: "00210", label: "19歳以下" },
  { code: "00230", label: "20〜24歳" },
  { code: "00240", label: "25〜29歳" },
  { code: "00250", label: "30〜34歳" },
  { code: "00260", label: "35〜39歳" },
  { code: "00280", label: "40〜44歳" },
  { code: "00300", label: "45〜49歳" },
  { code: "00320", label: "50〜54歳" },
  { code: "00340", label: "55〜59歳" },
  { code: "00350", label: "60〜64歳" },
  { code: "00360", label: "65〜69歳" },
  { code: "00370", label: "70〜74歳" },
  { code: "00380", label: "75〜79歳" },
  { code: "00390", label: "80歳以上" },
] as const;

export const SEXES = [
  { code: "husband", label: "夫", estat: "00100" },
  { code: "wife", label: "妻", estat: "00110" },
] as const;

export const MARRIAGE_TYPES = [
  { code: "first", label: "初婚", estat: "00110" },
  { code: "remarriage", label: "再婚", estat: "00120" },
] as const;

export const PREF_AREAS = [
  "00000",
  ...Array.from({ length: 47 }, (_, i) => String(i + 1).padStart(2, "0") + "000"),
] as const;

/** e-Stat 時間コード YYYY000000 → "YYYY" */
export function yearFromTime(code: string): string {
  return code.slice(0, 4);
}

export function timeFromYear(year: string): string {
  return `${year}000000`;
}
