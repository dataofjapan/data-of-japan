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
  perCapitaPure: {
    key: "per-capita-pure",
    statsDataId: "0004047565",
    label: "食料需給表 国民１人・１年当たり供給純食料",
  },

  calories: {
    key: "calories",
    statsDataId: "0004047567",
    label: "食料需給表 国民１人・１日当たり供給熱量",
  },

  selfSuffItem: {
    key: "self-suff-item",
    statsDataId: "0004047599",
    label: "食料需給表 品目別自給率（重量ベース）の推移",
  },

  selfSuffTotal: {
    key: "self-suff-total",
    statsDataId: "0004047600",
    label: "食料需給表 総合自給率等の推移",
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
