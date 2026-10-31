/**
 * 年齢階級のヘルパ。
 */

import type { DictEntry } from "./cube.ts";
import { SUMMARY_AGE_CODES } from "../../lib/data/labels.ts";

export function listAges(items: DictEntry[]): DictEntry[] {
  return items;
}

export function isSummaryAge(code: string): boolean {
  return SUMMARY_AGE_CODES.has(code);
}
