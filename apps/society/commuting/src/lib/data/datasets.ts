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
  census2020: {
    key: "census-2020",
    statsDataId: "0003454512",
    label: "令和2年国勢調査 利用交通手段（全国・都道府県・常住地）",
  },

  census2010: {
    key: "census-2010",
    statsDataId: "0003410872",
    label: "平成22年国勢調査 最終報告書 利用交通手段9区分（全国・都道府県）",
  },

  census2000: {
    key: "census-2000",
    statsDataId: "0003389171",
    label: "平成12年国勢調査 最終報告書 利用交通手段9区分（全国・都道府県）",
  },

  census1990: {
    key: "census-1990",
    statsDataId: "0000031735",
    label: "平成2年国勢調査 利用交通手段（常住地・全国・都道府県）",
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
