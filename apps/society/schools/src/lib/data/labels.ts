/**
 * 教育経路・学校種・性別の表示定義。
 * コードは e-Stat メタ（0000010105）で確認済み。推測で作らない。
 */

export type Sex = "total" | "male" | "female";

export interface PathDef {
  code: string;
  label: string;
  group: string;
  /** SSDS 件数コード（計）。 */
  countCode: string;
  /** 性別がある系列だけ。短大・大学進学者の男女はメタに無し。 */
  sexCodes?: { male: string; female: string };
}

export interface SchoolDef {
  code: string;
  label: string;
  group: string;
  countCode: string;
  sexCodes?: { male: string; female: string };
}

export const SEXES: readonly { code: Sex; label: string }[] = [
  { code: "total", label: "計" },
  { code: "male", label: "男" },
  { code: "female", label: "女" },
] as const;

/** 高校卒業者の進路（時代ビュー）。分母は E4601。 */
export const PATHS: readonly PathDef[] = [
  {
    code: "university",
    label: "大学進学",
    group: "進学",
    countCode: "E460220",
  },
  {
    code: "junior_college",
    label: "短期大学進学",
    group: "進学",
    countCode: "E460210",
  },
  {
    code: "senmon",
    label: "専修学校等",
    group: "進学以外",
    countCode: "E4603",
    sexCodes: { male: "E460301", female: "E460302" },
  },
  {
    code: "employment",
    label: "就職",
    group: "進学以外",
    countCode: "E4604",
    sexCodes: { male: "E460401", female: "E460402" },
  },
  {
    code: "other",
    label: "その他（家事・留学・未定等）",
    group: "進学以外",
    countCode: "E4605",
    sexCodes: { male: "E460501", female: "E460502" },
  },
] as const;

/** 進学者計（大学+短大）。検証・注記用。 */
export const ADVANCED_TOTAL = {
  code: "advanced",
  label: "進学者（大学・短大）",
  countCode: "E4602",
  sexCodes: { male: "E460201", female: "E460202" },
} as const;

export const GRADUATES = {
  code: "graduates",
  label: "高等学校卒業者",
  countCode: "E4601",
  sexCodes: { male: "E460101", female: "E460102" },
} as const;

/**
 * 学校種ビューの在学者。
 * education の学校種は義務教育含む全体構成。こちらは高等教育経路に寄せる。
 */
export const SCHOOLS: readonly SchoolDef[] = [
  {
    code: "high_school",
    label: "高等学校",
    group: "中等",
    countCode: "E4501",
    sexCodes: { male: "E450101", female: "E450102" },
  },
  {
    code: "junior_college",
    label: "短期大学",
    group: "高等教育",
    countCode: "E6301",
    sexCodes: { male: "E630101", female: "E630102" },
  },
  {
    code: "university",
    label: "大学",
    group: "高等教育",
    countCode: "E6302",
    sexCodes: { male: "E630201", female: "E630202" },
  },
  {
    code: "senmon",
    label: "専修学校",
    group: "高等教育",
    countCode: "E7201",
  },
  {
    code: "kakushu",
    label: "各種学校",
    group: "高等教育",
    countCode: "E7202",
  },
] as const;

/** SSDS 基礎データの表示年域。 */
export const YEAR_FROM = 1975;
export const YEAR_TO = 2024;
