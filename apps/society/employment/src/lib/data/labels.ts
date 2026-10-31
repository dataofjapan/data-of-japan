/**
 * 働き方ダッシュボードの表示定義。
 */

export type Sex = "total" | "male" | "female";
export type MetricKind = "rate" | "share" | "count";

export const SEX_LABEL_LFS = {
  total: "総数",
  male: "男",
  female: "女",
} as const satisfies Record<Sex, string>;

export interface MetricDef {
  code: string;
  label: string;
  group: string;
  kind: MetricKind;
  /** 時代リストのスパークに使う measure。 */
  spark: "value" | "workers";
}

/** 時代ビューの指標。 */
export const ERA_METRICS: readonly MetricDef[] = [
  { code: "emp_rate", label: "就業率", group: "率", kind: "rate", spark: "value" },
  { code: "unemp_rate", label: "完全失業率", group: "率", kind: "rate", spark: "value" },
  { code: "lfpr", label: "労働力人口比率", group: "率", kind: "rate", spark: "value" },
  {
    code: "self_employed",
    label: "自営業主",
    group: "従業上の地位",
    kind: "count",
    spark: "workers",
  },
  {
    code: "family",
    label: "家族従業者",
    group: "従業上の地位",
    kind: "count",
    spark: "workers",
  },
  {
    code: "employee",
    label: "雇用者",
    group: "従業上の地位",
    kind: "count",
    spark: "workers",
  },
  {
    code: "regular",
    label: "正規の職員・従業員",
    group: "雇用形態",
    kind: "count",
    spark: "workers",
  },
  {
    code: "nonregular",
    label: "非正規の職員・従業員",
    group: "雇用形態",
    kind: "count",
    spark: "workers",
  },
] as const;

export interface FormDef {
  code: string;
  label: string;
  /** status 表の従業上の地位コード。 */
  statusCode?: string;
  /** form-age 表の雇用形態コード。 */
  formCode?: string;
  /** share の分母: status総数 / 役員を除く雇用者 / 非正規。 */
  shareOf: "employed" | "ex_exec" | "nonregular";
  level: number;
  group: string;
}

/** 就業形態ビューの一覧。 */
export const STATUS_FORMS: readonly FormDef[] = [
  {
    code: "self_employed",
    label: "自営業主",
    statusCode: "01",
    shareOf: "employed",
    level: 1,
    group: "地位",
  },
  {
    code: "family",
    label: "家族従業者",
    statusCode: "06",
    shareOf: "employed",
    level: 1,
    group: "地位",
  },
  {
    code: "employee",
    label: "雇用者",
    statusCode: "08",
    shareOf: "employed",
    level: 1,
    group: "地位",
  },
  {
    code: "regular",
    label: "正規の職員・従業員",
    formCode: "03",
    shareOf: "ex_exec",
    level: 1,
    group: "雇用形態",
  },
  {
    code: "nonregular",
    label: "非正規の職員・従業員",
    formCode: "10",
    shareOf: "ex_exec",
    level: 1,
    group: "雇用形態",
  },
  {
    code: "part",
    label: "パート・アルバイト",
    formCode: "04",
    shareOf: "nonregular",
    level: 2,
    group: "非正規内訳",
  },
  {
    code: "dispatch",
    label: "派遣社員",
    formCode: "07",
    shareOf: "nonregular",
    level: 2,
    group: "非正規内訳",
  },
  {
    code: "contract",
    label: "契約社員",
    formCode: "11",
    shareOf: "nonregular",
    level: 2,
    group: "非正規内訳",
  },
  {
    code: "entrust",
    label: "嘱託",
    formCode: "12",
    shareOf: "nonregular",
    level: 2,
    group: "非正規内訳",
  },
  {
    code: "other_nr",
    label: "その他（非正規）",
    formCode: "09",
    shareOf: "nonregular",
    level: 2,
    group: "非正規内訳",
  },
] as const;

/** 属性ビューに載せる年齢（左から若年）。合算行を含む。 */
export const ATTR_AGE_CODES = [
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
