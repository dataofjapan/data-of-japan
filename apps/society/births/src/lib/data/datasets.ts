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

/** 4-1 から出生数総数・率・性比・TFR だけ取る。 */
const BIRTHS_YEAR_CODES = ["00100", "00130", "00140", "00150"].join(",");

export const DATASETS = {
  birthsYear: {
    key: "births-year",
    statsDataId: "0003411595",
    label: "上巻 年次別にみた出生数・出生率・出生性比及び合計特殊出生率",
    query: { cdCat01: BIRTHS_YEAR_CODES },
  },

  avgAge: {
    key: "avg-age",
    statsDataId: "0003411609",
    label: "上巻 出生順位別にみた年次別父・母の平均年齢",
  },

  ageMother: {
    key: "age-mother",
    statsDataId: "0003411599",
    label: "上巻 母の年齢（5歳階級）別にみた年次別出生数・百分率及び出生率",
  },

  geoBirth: {
    key: "geo-birth",
    statsDataId: "0003411597",
    label: "上巻 都道府県別にみた年次別出生数・出生率",
  },

  geoTfr: {
    key: "geo-tfr",
    statsDataId: "0003411598",
    label: "上巻 都道府県別にみた年次別合計特殊出生率",
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
