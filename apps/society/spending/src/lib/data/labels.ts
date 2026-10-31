/**
 * 配信コードと e-Stat 用途分類・年齢コードの対応。
 */

export interface ItemDef {
  code: string;
  label: string;
  /** e-Stat 用途分類コード */
  estat: string;
  level: number;
  group?: string;
  /** 時代ビューの左リスト */
  era?: boolean;
  /** 費目ビュー（L4 構成） */
  item?: boolean;
  /** 属性ビューで選択可能な費目 */
  attrs?: boolean;
  /** エンゲル係数など、構成比を金額から作らない */
  kind?: "yen" | "engel";
}

export const CONSUMPTION_ESTAT = "059";

/** 物語の核＋十大費目。L4 は構成比合計用、L5 は時代の掘り下げ。 */
export const ITEMS: ItemDef[] = [
  {
    code: "food",
    label: "食料",
    estat: "060",
    level: 1,
    group: "生活基盤",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "eating_out",
    label: "外食",
    estat: "098",
    level: 2,
    group: "生活基盤",
    era: true,
  },
  {
    code: "housing",
    label: "住居",
    estat: "102",
    level: 1,
    group: "生活基盤",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "rent",
    label: "家賃地代",
    estat: "103",
    level: 2,
    group: "生活基盤",
    era: true,
  },
  {
    code: "utilities",
    label: "光熱・水道",
    estat: "107",
    level: 1,
    group: "生活基盤",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "furniture",
    label: "家具・家事用品",
    estat: "112",
    level: 1,
    group: "生活基盤",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "clothing",
    label: "被服及び履物",
    estat: "122",
    level: 1,
    group: "生活基盤",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "health",
    label: "保健医療",
    estat: "140",
    level: 1,
    group: "サービス",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "transport_comm",
    label: "交通・通信",
    estat: "145",
    level: 1,
    group: "サービス",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "telecom",
    label: "通信",
    estat: "151",
    level: 2,
    group: "サービス",
    era: true,
  },
  {
    code: "education",
    label: "教育",
    estat: "152",
    level: 1,
    group: "サービス",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "tuition",
    label: "授業料等",
    estat: "153",
    level: 2,
    group: "サービス",
    era: true,
  },
  {
    code: "cram",
    label: "補習教育",
    estat: "155",
    level: 2,
    group: "サービス",
    era: true,
  },
  {
    code: "culture",
    label: "教養娯楽",
    estat: "156",
    level: 1,
    group: "サービス",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "other",
    label: "その他の消費支出",
    estat: "165",
    level: 1,
    group: "その他",
    era: true,
    item: true,
    attrs: true,
  },
  {
    code: "engel",
    label: "エンゲル係数",
    estat: "263",
    level: 1,
    group: "指標",
    era: true,
    kind: "engel",
  },
];

export interface AgeDef {
  code: string;
  label: string;
  estat: string;
  group: "summary" | "band";
}

export const AGES: AgeDef[] = [
  { code: "avg", label: "平均", estat: "A00", group: "summary" },
  { code: "65plus", label: "65歳以上", estat: "565", group: "summary" },
  { code: "70plus", label: "70歳以上", estat: "570", group: "summary" },
  { code: "u24", label: "24歳以下", estat: "425", group: "band" },
  { code: "a25", label: "25～29歳", estat: "205", group: "band" },
  { code: "a30", label: "30～34歳", estat: "206", group: "band" },
  { code: "a35", label: "35～39歳", estat: "207", group: "band" },
  { code: "a40", label: "40～44歳", estat: "208", group: "band" },
  { code: "a45", label: "45～49歳", estat: "209", group: "band" },
  { code: "a50", label: "50～54歳", estat: "210", group: "band" },
  { code: "a55", label: "55～59歳", estat: "211", group: "band" },
  { code: "a60", label: "60～64歳", estat: "212", group: "band" },
  { code: "a65", label: "65～69歳", estat: "213", group: "band" },
  { code: "a70", label: "70～74歳", estat: "214", group: "band" },
  { code: "a75", label: "75～79歳", estat: "215", group: "band" },
  { code: "a80", label: "80～84歳", estat: "216", group: "band" },
  { code: "a85", label: "85歳以上", estat: "580", group: "band" },
];

/** 時代ビュー: 1985–1999 は農林漁家除く、2000– は二人以上総数。 */
export const YEAR_FROM = 1985;
export const YEAR_TO = 2025;
export const ATTRS_YEAR_FROM = 2000;

export function householdEstat(year: number): string {
  return year < 2000 ? "01" : "03";
}
