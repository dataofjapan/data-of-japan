/**
 * 配信データ（public/data/*.json）の型。scripts/build.ts が書き、画面が読む。
 * 回のメタ情報（執行日・版・定数）は elections.ts を正本とし、ここには回番号だけ持つ。
 */

/** 選挙区・比例代表。 */
export type System = "sd" | "pr";

/** 全国。votes[党][回]。その回に届出のない党は null。 */
export interface NationalCube {
  parties: string[];
  totals: number[];
  votes: (number | null)[][];
}

export interface EraJson {
  elections: number[];
  sd: NationalCube;
  pr: NationalCube;
}

/**
 * 都道府県。totals[回][都道府県]、votes[党][回][都道府県]。
 * その回に全国で届出のない党は votes[党][回] が null、その都道府県に候補のない党は要素が null。
 */
export interface AreaJson {
  elections: number[];
  areas: string[];
  parties: string[];
  totals: number[][];
  votes: ((number | null)[] | null)[][];
}
