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

/** 基礎データの犯罪関連コード。 */
const COUNT_CODES = [
  "K4201",
  "K420101",
  "K420102",
  "K420103",
  "K420104",
  "K420105",
  "K4202",
  "K420201",
  "K420202",
  "K420203",
  "K420204",
  "K420205",
  "K4203",
  "K4204",
  "K4301",
  "K4303",
].join(",");

/** 社会生活統計指標の犯罪関連コード。 */
const RATE_CODES = [
  "#K06101",
  "#K06104",
  "#K06201",
  "#K06204",
  "#K06301",
  "#K06401",
  "#K06402",
  "#K06403",
  "#K06405",
  "#K06501",
  "#K06503",
].join(",");

export const DATASETS = {
  ssdsCount: {
    key: "ssds-count",
    statsDataId: "0000010111",
    label: "社会・人口統計体系 基礎データ Ｋ安全（犯罪件数）",
    query: { cdCat01: COUNT_CODES },
  },

  ssdsRate: {
    key: "ssds-rate",
    statsDataId: "0000010211",
    label: "社会・人口統計体系 社会生活統計指標 Ｋ安全（犯罪比率）",
    query: { cdCat01: RATE_CODES },
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
