/**
 * 年齢別就業率ダッシュボードの表示定義。
 */

export type Sex = "total" | "male" | "female";

export const SEX_LABEL_LFS = {
  total: "総数",
  male: "男",
  female: "女",
} as const satisfies Record<Sex, string>;

export const SEX_OPTIONS = [
  { value: "total", label: "総数" },
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const satisfies readonly { value: Sex; label: string }[];

/** 配信する年齢階級。合算行＋5歳階級（重複・細分は除外）。 */
export const AGE_CODES = [
  "00", // 15歳以上
  "27", // 15～64歳
  "18", // 65歳以上
  "02", // 15～19
  "05", // 20～24
  "07", // 25～29
  "08", // 30～34
  "10", // 35～39
  "11", // 40～44
  "13", // 45～49
  "14", // 50～54
  "16", // 55～59
  "17", // 60～64
  "19", // 65～69
  "28", // 70～74
  "29", // 75歳以上
] as const;

/** 合算行（一覧の上段）。 */
export const SUMMARY_AGE_CODES = new Set(["00", "27", "18"]);

/** プロファイル図用の5歳階級（合算なし）。 */
export const BAND_AGE_CODES = AGE_CODES.filter((c) => !SUMMARY_AGE_CODES.has(c));

/** 時代ビュー既定の年齢（「何歳まで働くか」の核）。 */
export const DEFAULT_AGE = "18";
