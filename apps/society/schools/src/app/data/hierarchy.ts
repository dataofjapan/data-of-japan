/**
 * 進路・学校種のヘルパ。
 */

import type { DictEntry } from "./cube.ts";

export function listItems(items: DictEntry[]): DictEntry[] {
  return items;
}

export function itemsInGroup(items: DictEntry[], group: string): DictEntry[] {
  return items.filter((d) => d.parent === group);
}
