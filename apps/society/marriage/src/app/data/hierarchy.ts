/**
 * 指標ヘルパ。
 */

import type { DictEntry } from "./cube.ts";
import { ERA_METRICS, type MetricUnit } from "../../lib/data/labels.ts";

export function listMetrics(items: DictEntry[]): DictEntry[] {
  return items;
}

export function geoMetrics(items: DictEntry[]): DictEntry[] {
  return items;
}

export function unitOf(code: string): MetricUnit {
  return ERA_METRICS.find((m) => m.code === code)?.unit ?? "count";
}
