/**
 * 交通事故指標・被害カテゴリの表示定義。
 */

export type MetricKind = "count" | "rate";
export type HarmDim = "state_death" | "state_injury" | "age_death" | "age_injury";

export interface MetricDef {
  code: string;
  label: string;
  group: string;
  kind: MetricKind;
  /** NPA 表章コード（0003281500）。 */
  npaTab?: string;
  /** SSDS 基礎データコード。 */
  ssdsCount?: string;
  /** SSDS 率コード。 */
  ssdsRate?: string;
  geo?: boolean;
}

export interface HarmCodeDef {
  code: string;
  label: string;
  dim: HarmDim;
  /** e-Stat の状態／年齢コード。 */
  raw: string;
  level: number;
}

/** 時代・地域の指標。 */
export const ERA_METRICS: readonly MetricDef[] = [
  {
    code: "accidents",
    label: "発生件数",
    group: "件数",
    kind: "count",
    npaTab: "1010",
    ssdsCount: "K3101",
    geo: true,
  },
  {
    code: "deaths",
    label: "死者数",
    group: "件数",
    kind: "count",
    npaTab: "1080",
    ssdsCount: "K3103",
    geo: true,
  },
  {
    code: "injuries",
    label: "負傷者数",
    group: "件数",
    kind: "count",
    npaTab: "1190",
    ssdsCount: "K3104",
    geo: true,
  },
  {
    code: "serious",
    label: "重傷者数",
    group: "件数",
    kind: "count",
    npaTab: "1250",
  },
  {
    code: "accidents_rate",
    label: "発生件数（人口10万人当たり）",
    group: "人口比",
    kind: "rate",
    ssdsRate: "#K04101",
    geo: true,
  },
  {
    code: "deaths_rate",
    label: "死者数（人口10万人当たり）",
    group: "人口比",
    kind: "rate",
    npaTab: "1470",
    ssdsRate: "#K04106",
    geo: true,
  },
  {
    code: "injuries_rate",
    label: "負傷者数（人口10万人当たり）",
    group: "人口比",
    kind: "rate",
    npaTab: "1480",
    ssdsRate: "#K04107",
    geo: true,
  },
] as const;

export const GEO_METRICS: readonly MetricDef[] = ERA_METRICS.filter((m) => m.geo);

export const HARM_DIMS: readonly { id: HarmDim; label: string }[] = [
  { id: "state_death", label: "状態・死者" },
  { id: "state_injury", label: "状態・負傷者" },
  { id: "age_death", label: "年齢・死者" },
  { id: "age_injury", label: "年齢・負傷者" },
] as const;

/** 状態別（死者: 0003287753 / 負傷者: 0003281503）。計・二輪計は除外。 */
export const HARM_STATE_CODES: readonly HarmCodeDef[] = [
  { code: "car", label: "自動車乗車中", dim: "state_death", raw: "130", level: 1 },
  { code: "motorcycle", label: "自動二輪車乗車中", dim: "state_death", raw: "140", level: 1 },
  { code: "moped", label: "原付乗車中", dim: "state_death", raw: "150", level: 1 },
  { code: "bicycle", label: "自転車乗用中", dim: "state_death", raw: "190", level: 1 },
  { code: "pedestrian", label: "歩行中", dim: "state_death", raw: "200", level: 1 },
  { code: "other", label: "その他", dim: "state_death", raw: "210", level: 1 },

  { code: "car", label: "自動車乗車中", dim: "state_injury", raw: "130", level: 1 },
  { code: "motorcycle", label: "自動二輪車乗車中", dim: "state_injury", raw: "170", level: 1 },
  { code: "moped", label: "原付乗車中", dim: "state_injury", raw: "180", level: 1 },
  { code: "bicycle", label: "自転車乗用中", dim: "state_injury", raw: "190", level: 1 },
  { code: "pedestrian", label: "歩行中", dim: "state_injury", raw: "200", level: 1 },
  { code: "other", label: "その他", dim: "state_injury", raw: "210", level: 1 },
] as const;

/** 年齢層（再掲・全年齢層は除外）。死者・負傷者で同じコードを共有。 */
const AGE_BANDS = [
  { code: "a0_4", label: "4歳以下", raw: "120" },
  { code: "a5_9", label: "5–9歳", raw: "130" },
  { code: "a10_14", label: "10–14歳", raw: "140" },
  { code: "a15_19", label: "15–19歳", raw: "160" },
  { code: "a20_24", label: "20–24歳", raw: "180" },
  { code: "a25_29", label: "25–29歳", raw: "190" },
  { code: "a30_34", label: "30–34歳", raw: "200" },
  { code: "a35_39", label: "35–39歳", raw: "210" },
  { code: "a40_44", label: "40–44歳", raw: "220" },
  { code: "a45_49", label: "45–49歳", raw: "230" },
  { code: "a50_54", label: "50–54歳", raw: "240" },
  { code: "a55_59", label: "55–59歳", raw: "250" },
  { code: "a60_64", label: "60–64歳", raw: "260" },
  { code: "a65_69", label: "65–69歳", raw: "270" },
  { code: "a70_74", label: "70–74歳", raw: "280" },
  { code: "a75_79", label: "75–79歳", raw: "290" },
  { code: "a80_84", label: "80–84歳", raw: "300" },
  { code: "a85p", label: "85歳以上", raw: "310" },
] as const;

export const HARM_AGE_CODES: readonly HarmCodeDef[] = AGE_BANDS.flatMap((b) => [
  { code: b.code, label: b.label, dim: "age_death" as const, raw: b.raw, level: 1 },
  { code: b.code, label: b.label, dim: "age_injury" as const, raw: b.raw, level: 1 },
]);

export const HARM_CODES: readonly HarmCodeDef[] = [...HARM_STATE_CODES, ...HARM_AGE_CODES];

export const ERA_FROM = 1948;
export const ERA_TO = 2024;
/** NPA DB 表はここまで。以降は SSDS で延長。 */
export const NPA_TREND_TO = 2018;
export const HARM_FROM = 2005;
export const HARM_TO = 2018;
export const GEO_FROM = 1975;

export const PREF_AREAS = [
  "00000",
  ...Array.from({ length: 47 }, (_, i) => String(i + 1).padStart(2, "0") + "000"),
] as const;

export const PREF_LABELS: Record<string, string> = {
  "00000": "全国",
  "01000": "北海道",
  "02000": "青森県",
  "03000": "岩手県",
  "04000": "宮城県",
  "05000": "秋田県",
  "06000": "山形県",
  "07000": "福島県",
  "08000": "茨城県",
  "09000": "栃木県",
  "10000": "群馬県",
  "11000": "埼玉県",
  "12000": "千葉県",
  "13000": "東京都",
  "14000": "神奈川県",
  "15000": "新潟県",
  "16000": "富山県",
  "17000": "石川県",
  "18000": "福井県",
  "19000": "山梨県",
  "20000": "長野県",
  "21000": "岐阜県",
  "22000": "静岡県",
  "23000": "愛知県",
  "24000": "三重県",
  "25000": "滋賀県",
  "26000": "京都府",
  "27000": "大阪府",
  "28000": "兵庫県",
  "29000": "奈良県",
  "30000": "和歌山県",
  "31000": "鳥取県",
  "32000": "島根県",
  "33000": "岡山県",
  "34000": "広島県",
  "35000": "山口県",
  "36000": "徳島県",
  "37000": "香川県",
  "38000": "愛媛県",
  "39000": "高知県",
  "40000": "福岡県",
  "41000": "佐賀県",
  "42000": "長崎県",
  "43000": "熊本県",
  "44000": "大分県",
  "45000": "宮崎県",
  "46000": "鹿児島県",
  "47000": "沖縄県",
};
