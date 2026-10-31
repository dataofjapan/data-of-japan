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
  ratesAge: {
    key: "rates-age",
    statsDataId: "0002060049",
    label: "労働力調査 年齢階級別労働力人口比率・就業率・完全失業率（1953年～）",
  },

  status: {
    key: "status",
    statsDataId: "0002060046",
    label: "労働力調査 農林業・非農林業，従業上の地位別就業者数（1953年～）",
  },

  formAge: {
    key: "form-age",
    statsDataId: "0003078065",
    label: "労働力調査 雇用形態，年齢階級別雇用者数（2013年～）",
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
