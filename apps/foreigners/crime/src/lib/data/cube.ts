import type { Group, LawId } from "./labels.ts";

/**
 * 配信データ。年は暦年。
 * cases / people は [法][来日・その他][年]。
 * byNation も [法][国][年]。国は来日外国人の表だけ。
 */
export interface CrimeJson {
  years: number[];
  laws: { id: LawId; label: string; note: string }[];
  groups: Group[];
  cases: number[][][];
  people: number[][][];
  nations: string[];
  nationCases: number[][][];
  nationPeople: number[][][];
}
