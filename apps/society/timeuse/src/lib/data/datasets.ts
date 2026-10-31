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
  geo2021: {
    key: "geo-2021",
    statsDataId: "0003457337",
    label: "2021 曜日×性×行動 総平均時間（全国・都道府県）",
    // 人口集中地区 = 総数のみ
    query: { cdCat02: "99000" },
    expectedCells: 13_248,
  },
  geo2016: {
    key: "geo-2016",
    statsDataId: "0003198750",
    label: "2016 曜日×性×行動 総平均時間（全国・都道府県）",
    query: { cdCat03: "0" },
    expectedCells: 14_400,
  },
  geo2011: {
    key: "geo-2011",
    statsDataId: "0003066915",
    label: "2011 曜日×性×行動 総平均時間等（全国・都道府県ほか）",
    expectedCells: 148_248,
  },
  geo2006: {
    key: "geo-2006",
    statsDataId: "0003003341",
    label: "2006 曜日×性×行動 総平均時間（全国・都道府県ほか）",
    query: { cdTab: "006" },
    expectedCells: 47_472,
  },
  geo2001: {
    key: "geo-2001",
    statsDataId: "0000092128",
    label: "2001 曜日×性×行動 総平均時間（全国・都道府県ほか）",
    expectedCells: 21_312,
  },
  geo1996: {
    key: "geo-1996",
    statsDataId: "0000091272",
    label: "1996 曜日×性×行動 総平均時間（全国・都道府県ほか）",
    expectedCells: 35_712,
  },
  age2021: {
    key: "age-2021",
    statsDataId: "0003462756",
    label: "2021 曜日×性×年齢×行動 総平均時間（全国・調査票A区分）",
    expectedCells: 7_176,
  },
  age2016: {
    key: "age-2016",
    statsDataId: "0003212980",
    label: "2016 曜日×性×年齢×行動 総平均時間（全国・調査票A区分）",
    expectedCells: 7_800,
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
