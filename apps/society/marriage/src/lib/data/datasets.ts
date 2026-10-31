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

/** 人口動態総覧から婚姻・離婚の件数と率だけ取る。 */
const OVERVIEW_CODES = ["00270", "00280", "00420", "00430"].join(",");

export const DATASETS = {
  overview: {
    key: "overview",
    statsDataId: "0003411561",
    label: "上巻 年次別にみた人口動態総覧（婚姻・離婚）",
    query: { cdCat01: OVERVIEW_CODES },
  },

  avgAge: {
    key: "avg-age",
    statsDataId: "0003411844",
    label: "上巻 全婚姻－初婚別にみた年次別夫妻の平均婚姻年齢及び夫妻の年齢差",
  },

  firstRemarriage: {
    key: "first-remarriage",
    statsDataId: "0003411837",
    label: "上巻 年次・夫－妻別にみた初婚－再婚別婚姻件数及び再婚の占める割合",
  },

  cohabit: {
    key: "cohabit",
    statsDataId: "0003411864",
    label: "上巻 年次別にみた同居期間別離婚件数及び百分率並びに平均同居期間",
  },

  ageCount: {
    key: "age-count",
    statsDataId: "0003411840",
    label: "上巻 年齢（5歳階級）×初婚－再婚×夫－妻×年次 婚姻件数",
  },

  ageRate: {
    key: "age-rate",
    statsDataId: "0003413965",
    label: "上巻 年齢（5歳階級）×初婚－再婚×夫－妻×年次 婚姻率",
  },

  geoMarriage: {
    key: "geo-marriage",
    statsDataId: "0003411835",
    label: "上巻 都道府県別にみた年次別婚姻件数・婚姻率",
  },

  geoDivorce: {
    key: "geo-divorce",
    statsDataId: "0003411861",
    label: "上巻 都道府県別にみた年次別離婚件数・離婚率",
  },

  geoAvgAge: {
    key: "geo-avg-age",
    statsDataId: "0003411845",
    label: "上巻 都道府県別にみた年次別夫妻の平均初婚年齢",
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
