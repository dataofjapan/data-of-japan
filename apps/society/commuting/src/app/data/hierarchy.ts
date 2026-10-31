/**
 * 指標ヘルパ。
 */

import type { DictEntry } from "./cube.ts";

export function listMetrics(items: DictEntry[]): DictEntry[] {
  return items.filter((m) => m.code !== "total");
}

export function geoMetrics(items: DictEntry[]): DictEntry[] {
  return items;
}
