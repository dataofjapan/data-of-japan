/**
 * 通勤・通学手段の表示定義と年次コード対応。
 */

export type ModeCode =
  | "total"
  | "walk"
  | "rail"
  | "bus"
  | "company_bus"
  | "car"
  | "taxi"
  | "motorcycle"
  | "bicycle"
  | "other";

export interface ModeDef {
  code: ModeCode;
  label: string;
  group: string;
  /** 時代・地域の指標リストに載せるか（total 以外）。 */
  selectable: boolean;
  geo: boolean;
}

/** 配信で使う調査年。大規模調査年のみ。 */
export const SURVEY_YEARS = ["1990", "2000", "2010", "2020"] as const;
export type SurveyYear = (typeof SURVEY_YEARS)[number];

export const ERA_FROM = 1990;
export const ERA_TO = 2020;

/** 手段マスタ。total は分母専用。 */
export const MODES: readonly ModeDef[] = [
  { code: "total", label: "通勤・通学者総数", group: "全体", selectable: false, geo: false },
  { code: "walk", label: "徒歩", group: "主な手段", selectable: true, geo: true },
  { code: "rail", label: "鉄道・電車", group: "主な手段", selectable: true, geo: true },
  { code: "car", label: "自家用車", group: "主な手段", selectable: true, geo: true },
  { code: "bicycle", label: "自転車", group: "主な手段", selectable: true, geo: true },
  { code: "bus", label: "乗合バス", group: "その他", selectable: true, geo: true },
  { code: "motorcycle", label: "オートバイ", group: "その他", selectable: true, geo: true },
  { code: "company_bus", label: "勤め先・学校のバス", group: "その他", selectable: true, geo: true },
  { code: "taxi", label: "ハイヤー・タクシー", group: "その他", selectable: true, geo: true },
  { code: "other", label: "その他", group: "その他", selectable: true, geo: true },
] as const;

export const MODE_CODES = MODES.filter((m) => m.code !== "total").map((m) => m.code);

export const SELECTABLE_MODES = MODES.filter((m) => m.selectable);
export const GEO_MODES = MODES.filter((m) => m.geo);

/**
 * 年次表ごとの生コード → 正規化コード。
 * 1990年の鉄道は JR + JR以外を配列で合算。
 */
export const MODE_CODE_MAP: Record<SurveyYear, Record<ModeCode, string | readonly string[]>> = {
  "2020": {
    total: "0",
    walk: "1",
    rail: "21",
    bus: "22",
    company_bus: "23",
    car: "24",
    taxi: "25",
    motorcycle: "26",
    bicycle: "27",
    other: "28",
  },
  "2010": {
    total: "000",
    walk: "002",
    rail: "003",
    bus: "004",
    company_bus: "005",
    car: "006",
    taxi: "007",
    motorcycle: "008",
    bicycle: "009",
    other: "010",
  },
  "2000": {
    total: "100",
    walk: "110",
    rail: "120",
    bus: "130",
    company_bus: "140",
    car: "150",
    taxi: "160",
    motorcycle: "170",
    bicycle: "180",
    other: "190",
  },
  "1990": {
    total: "000",
    walk: "002",
    rail: ["003", "004"],
    bus: "005",
    company_bus: "006",
    car: "007",
    taxi: "008",
    motorcycle: "009",
    bicycle: "010",
    other: "011",
  },
};

export const PREF_AREAS = [
  "00000",
  ...Array.from({ length: 47 }, (_, i) => String(i + 1).padStart(2, "0") + "000"),
] as const;

export const PREF_LABELS: Record<string, string> = {
  "00000": "全国",
  "01000": "北海道",
  "02000": "青森",
  "03000": "岩手",
  "04000": "宮城",
  "05000": "秋田",
  "06000": "山形",
  "07000": "福島",
  "08000": "茨城",
  "09000": "栃木",
  "10000": "群馬",
  "11000": "埼玉",
  "12000": "千葉",
  "13000": "東京",
  "14000": "神奈川",
  "15000": "新潟",
  "16000": "富山",
  "17000": "石川",
  "18000": "福井",
  "19000": "山梨",
  "20000": "長野",
  "21000": "岐阜",
  "22000": "静岡",
  "23000": "愛知",
  "24000": "三重",
  "25000": "滋賀",
  "26000": "京都",
  "27000": "大阪",
  "28000": "兵庫",
  "29000": "奈良",
  "30000": "和歌山",
  "31000": "鳥取",
  "32000": "島根",
  "33000": "岡山",
  "34000": "広島",
  "35000": "山口",
  "36000": "徳島",
  "37000": "香川",
  "38000": "愛媛",
  "39000": "高知",
  "40000": "福岡",
  "41000": "佐賀",
  "42000": "長崎",
  "43000": "熊本",
  "44000": "大分",
  "45000": "宮崎",
  "46000": "鹿児島",
  "47000": "沖縄",
};
