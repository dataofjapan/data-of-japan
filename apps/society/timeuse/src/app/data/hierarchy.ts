import {
  ACTIVITIES,
  GROUP_COLORS,
  GROUP_LABELS,
  GROUP_ORDER,
  type ActivityGroup,
} from "../../lib/data/labels.ts";
import type { DictEntry } from "./cube.ts";

export { GROUP_LABELS, GROUP_COLORS, GROUP_ORDER };

export function activityLabel(code: string, dict: DictEntry[]): string {
  return dict.find((d) => d.code === code)?.label ?? code;
}

export function groupOf(code: string): ActivityGroup {
  return ACTIVITIES.find((a) => a.code === code)?.group ?? "other";
}

export function groupMinutes(
  getMinutes: (activityCode: string) => number | null,
): { group: ActivityGroup; label: string; color: string; minutes: number }[] {
  return GROUP_ORDER.map((group) => {
    const minutes = ACTIVITIES.filter((a) => a.group === group).reduce((sum, a) => {
      const v = getMinutes(a.code);
      return sum + (v ?? 0);
    }, 0);
    return {
      group,
      label: GROUP_LABELS[group],
      color: GROUP_COLORS[group],
      minutes,
    };
  });
}
