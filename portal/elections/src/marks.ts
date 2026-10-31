import { Factory, Globe, ArrowRightLeft, ChartColumn, ChartLine, Landmark, Map, Percent, Users, type LucideIcon } from "lucide-react";

/** 元の選挙一覧と統合サイトの入口で同じ線画を使う。 */
export const MARKS: Record<string, LucideIcon> = {
  turnout: Percent,
  timeseries: ChartColumn,
  candidates: Users,
  seats: Factory, Globe, ArrowRightLeft,
  governors: Map,
  politics: Landmark,
  society: ChartLine,
  foreigners: Globe,
  industry: Factory,
  shugiin: Landmark,
  sangiin: Landmark,
};
