import { ArrowRightLeft, ChartColumn, ChartLine, Landmark, Map, Percent, Users, type LucideIcon } from "lucide-react";

/** 元の選挙一覧と統合サイトの入口で同じ線画を使う。 */
export const MARKS: Record<string, LucideIcon> = {
  turnout: Percent,
  timeseries: ChartColumn,
  candidates: Users,
  seats: ArrowRightLeft,
  governors: Map,
  politics: Landmark,
  society: ChartLine,
  shugiin: Landmark,
  sangiin: Landmark,
};
