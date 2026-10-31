/**
 * 取得対象の e-Stat 統計表。
 * 各表の素性・注意点は docs/data-sources.md を参照。
 */

export interface DatasetDef {
  key: string;
  statsDataId: string;
  label: string;
  expectedCells?: number;
  query?: Record<string, string>;
}

/** 用途分類: 消費支出・L4・物語用 L5・エンゲル。 */
const USE_CAT01 = [
  "059",
  "060",
  "098",
  "102",
  "103",
  "107",
  "112",
  "122",
  "140",
  "145",
  "151",
  "152",
  "153",
  "155",
  "156",
  "165",
  "263",
].join(",");

/** 属性ビュー用の年齢階級（重複合算の 34歳以下を除く）。 */
const AGE_CODES = [
  "A00",
  "425",
  "205",
  "206",
  "207",
  "208",
  "209",
  "210",
  "211",
  "212",
  "213",
  "214",
  "215",
  "216",
  "580",
  "565",
  "570",
].join(",");

export const DATASETS = {
  useTotal: {
    key: "use-total",
    statsDataId: "0002070003",
    label: "家計調査 用途分類（総数）二人以上の世帯",
    // 絞り込み後の実測件数（疎セルは API が返さない）
    expectedCells: 1258,
    query: {
      cdCat01: USE_CAT01,
      cdCat02: "01,03",
      cdArea: "00000",
    },
  },

  useAge: {
    key: "use-age",
    statsDataId: "0002070011",
    label: "家計調査 用途分類（世帯主の年齢階級別）二人以上の世帯",
    // 絞り込み後の実測件数（若年など標本小で欠測あり）
    expectedCells: 8806,
    query: {
      cdCat01: USE_CAT01,
      cdCat02: "03",
      cdCat03: AGE_CODES,
      cdArea: "00000",
    },
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
