/**
 * 配信コードと e-Stat 品目コードの対応。
 * ラベルは表示用。親は UI のグループ見出しに使う。
 */

export interface ItemDef {
  code: string;
  label: string;
  /** e-Stat 類別・品目別コード（純食料・熱量で共通） */
  estat: string;
  level: number;
  group?: string;
  /** 時代ビューの左リストに出す */
  era?: boolean;
  /** 品目ビュー（L1 構成）に出す */
  item?: boolean;
}

/** 物語の核＋主要類別。二重計上を避けるため era は主に物語品目、item は L1。 */
export const ITEMS: ItemDef[] = [
  { code: "grains", label: "穀類", estat: "1001", level: 1, group: "炭水化物", era: true, item: true },
  { code: "rice", label: "米", estat: "1002", level: 2, group: "炭水化物", era: true },
  { code: "wheat", label: "小麦", estat: "1003", level: 2, group: "炭水化物", era: true },
  { code: "potatoes", label: "いも類", estat: "1009", level: 1, group: "炭水化物", era: true, item: true },
  { code: "starch", label: "でん粉", estat: "1012", level: 1, group: "炭水化物", item: true },
  { code: "pulses", label: "豆類", estat: "1013", level: 1, group: "植物性", era: true, item: true },
  { code: "vegetables", label: "野菜", estat: "1016", level: 1, group: "植物性", era: true, item: true },
  { code: "fruits", label: "果実", estat: "1019", level: 1, group: "植物性", era: true, item: true },
  { code: "meat", label: "肉類", estat: "1023", level: 1, group: "動物性", era: true, item: true },
  { code: "beef", label: "牛肉", estat: "1024", level: 2, group: "動物性", era: true },
  { code: "pork", label: "豚肉", estat: "1025", level: 2, group: "動物性", era: true },
  { code: "chicken", label: "鶏肉", estat: "1026", level: 2, group: "動物性", era: true },
  { code: "eggs", label: "鶏卵", estat: "1029", level: 1, group: "動物性", era: true, item: true },
  { code: "dairy", label: "牛乳及び乳製品", estat: "1030", level: 1, group: "動物性", era: true, item: true },
  { code: "fish", label: "魚介類", estat: "1041", level: 1, group: "動物性", era: true, item: true },
  { code: "seaweed", label: "海藻類", estat: "1046", level: 1, group: "植物性", item: true },
  { code: "sugar", label: "砂糖類", estat: "1047", level: 1, group: "調味・油脂", era: true, item: true },
  { code: "oils", label: "油脂類", estat: "1052", level: 1, group: "調味・油脂", era: true, item: true },
  { code: "miso", label: "みそ", estat: "1062", level: 1, group: "調味・油脂", item: true },
  { code: "soy_sauce", label: "しょうゆ", estat: "1063", level: 1, group: "調味・油脂", item: true },
  { code: "other_food", label: "その他食料計", estat: "1064", level: 1, group: "その他", item: true },
];

/** 熱量合計（構成比の分母）。純食料表には無い。 */
export const CALORIE_TOTAL_ESTAT = "1066";

export interface SupplyMetricDef {
  code: string;
  label: string;
  source: "total" | "item";
  estat: string;
  group: string;
}

export const SUPPLY_METRICS: SupplyMetricDef[] = [
  {
    code: "calorie_ssr",
    label: "総合自給率（熱量）",
    source: "total",
    estat: "1003",
    group: "総合",
  },
  {
    code: "value_ssr",
    label: "総合自給率（生産額）",
    source: "total",
    estat: "1005",
    group: "総合",
  },
  {
    code: "calorie_domestic",
    label: "食料国産率（熱量）",
    source: "total",
    estat: "1006",
    group: "総合",
  },
  {
    code: "value_domestic",
    label: "食料国産率（生産額）",
    source: "total",
    estat: "1007",
    group: "総合",
  },
  {
    code: "grain_ssr",
    label: "穀物自給率",
    source: "total",
    estat: "1001",
    group: "総合",
  },
  {
    code: "staple_grain_ssr",
    label: "主食用穀物自給率",
    source: "total",
    estat: "1002",
    group: "総合",
  },
  { code: "ss_rice", label: "米", source: "item", estat: "1001", group: "品目" },
  { code: "ss_wheat", label: "小麦", source: "item", estat: "1002", group: "品目" },
  { code: "ss_meat", label: "肉類", source: "item", estat: "1019", group: "品目" },
  { code: "ss_beef", label: "牛肉", source: "item", estat: "1023", group: "品目" },
  { code: "ss_pork", label: "豚肉", source: "item", estat: "1025", group: "品目" },
  { code: "ss_chicken", label: "鶏肉", source: "item", estat: "1027", group: "品目" },
  { code: "ss_eggs", label: "鶏卵", source: "item", estat: "1032", group: "品目" },
  { code: "ss_dairy", label: "牛乳及び乳製品", source: "item", estat: "1034", group: "品目" },
  { code: "ss_fish", label: "魚介類", source: "item", estat: "1036", group: "品目" },
  { code: "ss_oils", label: "油脂類", source: "item", estat: "1042", group: "品目" },
  { code: "ss_vegetables", label: "野菜", source: "item", estat: "1015", group: "品目" },
  { code: "ss_fruits", label: "果実", source: "item", estat: "1016", group: "品目" },
  { code: "ss_sugar", label: "砂糖類", source: "item", estat: "1040", group: "品目" },
  { code: "ss_pulses", label: "豆類", source: "item", estat: "1011", group: "品目" },
];

export const YEAR_FROM = 1960;
export const YEAR_TO = 2023;
