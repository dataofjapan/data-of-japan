/**
 * 傷病リストのヘルパ。
 */

import type { DictEntry } from "./cube.ts";

/** 章（大分類）＋総数。再掲は除外。 */
export function listChapters(items: DictEntry[]): DictEntry[] {
  return items.filter((d) => d.level === 1);
}

/** 章＋再掲すべて。 */
export function listAllDiseases(items: DictEntry[]): DictEntry[] {
  return items;
}

export function listSubDiseases(items: DictEntry[], _chapter?: string): DictEntry[] {
  return items.filter((d) => d.level === 2);
}
