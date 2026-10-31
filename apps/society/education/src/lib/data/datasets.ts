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

/** 基礎データ側の進学率・在学者数コード（カンマ区切り、仕様上限100）。 */
const SSDS_CODES = [
  "E3801",
  "E380101",
  "E380102",
  "E4701",
  "E470101",
  "E470102",
  "E1501",
  "E1701",
  "E2501",
  "E3501",
  "E4501",
  "E6301",
  "E6302",
  "E7201",
].join(",");

export const DATASETS = {
  advancement: {
    key: "advancement",
    statsDataId: "0003147040",
    label: "学校基本調査 年次統計 進学率（1948–2016）",
    expectedCells: 1236,
  },

  ssdsEdu: {
    key: "ssds-edu",
    statsDataId: "0000010105",
    label: "社会・人口統計体系 基礎データ Ｅ教育（進学率・在学者数）",
    query: { cdCat01: SSDS_CODES },
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
