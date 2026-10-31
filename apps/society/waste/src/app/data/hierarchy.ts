/**
 * 指標・フローカテゴリのヘルパ。
 */

import type { DictEntry } from "./cube.ts";

export function listMetrics(items: DictEntry[]): DictEntry[] {
  return items;
}

export function geoMetrics(items: DictEntry[]): DictEntry[] {
  return items;
}

export function flowByGroup(
  items: DictEntry[],
  group: "discharge" | "process",
): DictEntry[] {
  return items.filter((c) => c.parent === group);
}
