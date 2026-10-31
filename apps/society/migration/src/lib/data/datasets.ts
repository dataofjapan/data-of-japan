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
  nationalLong: {
    key: "national-long",
    statsDataId: "0003404079",
    label: "移動者数等の推移－全国（昭和29年～平成31年・令和元年）",
  },

  metroLong: {
    key: "metro-long",
    statsDataId: "0003404102",
    label: "３大都市圏の転入・転出・転入超過の推移（昭和29年～平成31年・令和元年）",
  },

  annualRecent: {
    key: "annual-recent",
    statsDataId: "0003422373",
    label: "都道府県・３大都市圏の転入出（2010年～・日本人・総数）",
    query: {
      cdCat01: "0",
      cdCat02: "61000",
    },
  },

  annualHist: {
    key: "annual-hist",
    statsDataId: "0004009738",
    label: "都道府県の転入出（1999年～2019年・日本人・今年）",
    query: {
      cdCat01: "61000",
      cdCat02: "03",
    },
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
