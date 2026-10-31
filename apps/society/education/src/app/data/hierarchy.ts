/**
 * 指標・学校種のヘルパ。
 */

import type { DictEntry } from "./cube.ts";

export function listMetrics(items: DictEntry[]): DictEntry[] {
  return items;
}

export function metricsInGroup(items: DictEntry[], group: string): DictEntry[] {
  return items.filter((d) => d.parent === group);
}
