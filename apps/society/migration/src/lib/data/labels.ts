/**
 * 移動指標の表示定義。
 */

export interface MetricDef {
  code: string;
  label: string;
  /** 時代リストのグループ表示用。 */
  group: string;
  /** 負値がありうる（転入超過）。 */
  signed?: boolean;
  geo?: boolean;
}

/** 時代ビューの指標。 */
export const ERA_METRICS: readonly MetricDef[] = [
  { code: "movers", label: "移動者数", group: "全国" },
  { code: "intra", label: "都道府県内移動", group: "全国" },
  { code: "inter", label: "都道府県間移動", group: "全国" },
  { code: "tokyo_net", label: "東京圏 転入超過", group: "東京圏", signed: true },
  { code: "tokyo_in", label: "東京圏 転入", group: "東京圏" },
  { code: "tokyo_out", label: "東京圏 転出", group: "東京圏" },
  { code: "nagoya_net", label: "名古屋圏 転入超過", group: "名古屋圏", signed: true },
  { code: "osaka_net", label: "大阪圏 転入超過", group: "大阪圏", signed: true },
];

/** 地域ビューの指標。 */
export const GEO_METRICS: readonly MetricDef[] = [
  { code: "net", label: "転入超過", group: "純移動", signed: true, geo: true },
  { code: "in", label: "転入", group: "転入・転出", geo: true },
  { code: "out", label: "転出", group: "転入・転出", geo: true },
];

export const ERA_FROM = 1954;
export const ERA_TO = 2025;

export const METRO_AREA = {
  tokyo: "51000",
  nagoya: "52000",
  osaka: "53000",
} as const;

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
