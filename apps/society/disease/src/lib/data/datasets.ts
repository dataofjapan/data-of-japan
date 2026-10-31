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

export const DATASETS = {
  /** Z5-2 受療率の年次推移×傷病（平成8年～令和5年） */
  eraRateRecent: {
    key: "era-rate-recent",
    statsDataId: "0004025892",
    label: "Z5-2 受療率の年次推移，入院－外来 × 傷病分類別（平成8年～令和5年）",
    expectedCells: 1_800,
  },

  /** Z3-2 推計患者数の年次推移×傷病（平成8年～令和5年） */
  eraCountRecent: {
    key: "era-count-recent",
    statsDataId: "0004025886",
    label: "Z3-2 推計患者数の年次推移，入院－外来 × 傷病分類別（平成8年～令和5年）",
    expectedCells: 1_800,
  },

  /** Z9 性・年齢×傷病×施設（令和5年断面） */
  diseaseAge: {
    key: "disease-age",
    statsDataId: "0004025899",
    label: "Z9 推計患者数，性・年齢階級（５歳） × 傷病分類 × 病院－一般診療所別",
    expectedCells: 13_500,
  },

  /** T37 受療率×傷病×都道府県 */
  geoRate: {
    key: "geo-rate",
    statsDataId: "0004026105",
    label: "T37 受療率（人口10万対），入院－外来・施設の種類 × 傷病分類 × 都道府県別",
    expectedCells: 20_160,
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
