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

/**
 * 基礎データ「Ｅ教育」の進路・在学者コード（カンマ区切り、仕様上限100）。
 * 進学率系列は education 側。ここでは経路構成に必要な件数のみ。
 */
const SSDS_CODES = [
  // 高校卒業後の進路（件数）
  "E4601",
  "E460101",
  "E460102",
  "E4602",
  "E460201",
  "E460202",
  "E460210",
  "E460220",
  "E4603",
  "E460301",
  "E460302",
  "E4604",
  "E460401",
  "E460402",
  "E4605",
  "E460501",
  "E460502",
  // 在学者（学校種）
  "E4501",
  "E450101",
  "E450102",
  "E6301",
  "E630101",
  "E630102",
  "E6302",
  "E630201",
  "E630202",
  "E7201",
  "E7202",
].join(",");

export const DATASETS = {
  ssdsEdu: {
    key: "ssds-edu",
    statsDataId: "0000010105",
    label: "社会・人口統計体系 基礎データ Ｅ教育（進路・在学者数）",
    query: { cdCat01: SSDS_CODES },
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
