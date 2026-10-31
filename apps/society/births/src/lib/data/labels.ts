/**
 * 出生指標の表示定義。
 */

export type MetricUnit = "count" | "per_mille" | "tfr" | "ratio" | "years";

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
  { code: "birth_count", label: "出生数", group: "件数", unit: "count", geo: false },
  { code: "birth_rate", label: "出生率", group: "率", unit: "per_mille", geo: true },
  { code: "tfr", label: "合計特殊出生率", group: "率", unit: "tfr", geo: true },
  { code: "sex_ratio", label: "出生性比", group: "性比", unit: "ratio", geo: false },
  {
    code: "avg_age_mother",
    label: "母の平均年齢",
    group: "平均年齢",
    unit: "years",
    geo: false,
  },
  {
    code: "avg_age_father",
    label: "父の平均年齢",
    group: "平均年齢",
    unit: "years",
    geo: false,
  },
] as const;

/** 地域ビューの指標（全国比が意味を持つもの）。 */
export const GEO_METRICS: readonly MetricDef[] = ERA_METRICS.filter((m) => m.geo);

/**
 * 年齢ビュー: 件数コードと率コードが別物なので両方持つ。
 * 率がある15〜49歳に限定。
 */
export const AGE_BANDS: readonly {
  code: string;
  label: string;
  countCode: string;
  rateCode: string;
}[] = [
  { code: "15-19", label: "15〜19歳", countCode: "00120", rateCode: "00290" },
  { code: "20-24", label: "20〜24歳", countCode: "00130", rateCode: "00300" },
  { code: "25-29", label: "25〜29歳", countCode: "00140", rateCode: "00310" },
  { code: "30-34", label: "30〜34歳", countCode: "00150", rateCode: "00320" },
  { code: "35-39", label: "35〜39歳", countCode: "00160", rateCode: "00330" },
  { code: "40-44", label: "40〜44歳", countCode: "00170", rateCode: "00340" },
  { code: "45-49", label: "45〜49歳", countCode: "00180", rateCode: "00350" },
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
