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

/** 社会・人口統計体系 基礎データ Ｋ安全の件数コード。 */
const SSDS_COUNT_CODES = ["K3101", "K3103", "K3104"].join(",");

/** 社会生活統計指標 Ｋ安全の率コード。 */
const SSDS_RATE_CODES = ["#K04101", "#K04106", "#K04107"].join(",");

export const DATASETS = {
  npaTrend: {
    key: "npa-trend",
    statsDataId: "0003281500",
    label: "交通事故の発生状況 交通事故発生状況の推移（1948–2018）",
  },

  ssdsCount: {
    key: "ssds-count",
    statsDataId: "0000010111",
    label: "社会・人口統計体系 基礎データ Ｋ安全（発生件数・死者・負傷者）",
    query: { cdCat01: SSDS_COUNT_CODES },
  },

  ssdsRate: {
    key: "ssds-rate",
    statsDataId: "0000010211",
    label: "社会・人口統計体系 社会生活統計指標 Ｋ安全（人口10万人当たり）",
    query: { cdCat01: SSDS_RATE_CODES },
  },

  stateCasualties: {
    key: "state-casualties",
    statsDataId: "0003287753",
    label: "交通事故の発生状況 状態別死傷者数の推移",
  },

  stateInjuries: {
    key: "state-injuries",
    statsDataId: "0003281503",
    label: "交通事故の発生状況 状態別負傷者数の推移",
  },

  ageDeaths: {
    key: "age-deaths",
    statsDataId: "0003281495",
    label: "交通死亡事故の発生状況 年齢層別死者数の推移",
  },

  ageInjuries: {
    key: "age-injuries",
    statsDataId: "0003281502",
    label: "交通事故の発生状況 年齢層別負傷者数の推移",
  },
} as const satisfies Record<string, DatasetDef>;

export const ALL_DATASETS: DatasetDef[] = Object.values(DATASETS);

export const BUILD_DATASETS: DatasetDef[] = ALL_DATASETS;
