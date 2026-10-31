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

/** 基礎データのごみ関連コード。 */
const COUNT_CODES = [
  "H5608",
  "H5609",
  "H560901",
  "H560902",
  "H560903",
  "H560904",
  "H5610",
  "H5612",
  "H561201",
  "H5613",
  "H5614",
  "H5615",
  "H5616",
  "H5617",
].join(",");

/** 社会生活統計指標のごみ関連コード。 */
const RATE_CODES = ["#H055031", "#H055041", "#H05505"].join(",");

export const DATASETS = {
  ssdsCount: {
    key: "ssds-count",
    statsDataId: "0000010108",
    label: "社会・人口統計体系 基礎データ Ｈ居住（ごみ排出・処理）",
    query: { cdCat01: COUNT_CODES },
  },

  ssdsRate: {
    key: "ssds-rate",
    statsDataId: "0000010208",
    label: "社会・人口統計体系 社会生活統計指標 Ｈ居住（ごみ比率）",
    query: { cdCat01: RATE_CODES },
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
