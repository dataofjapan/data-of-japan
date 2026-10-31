/**
 * 対象とする通常選挙の目録。出典の正本は docs/data-sources.md。
 *
 * 兄弟サイト（得票・候補者）と同じく、比例代表が非拘束名簿式になった第19回（2001年）から。
 */

export type Edition = "確定" | "速報";

export interface Election {
  n: number;
  date: string;
  edition: Edition;
  /** 選挙すべき議員の数（選挙区・比例代表）。選挙区は合併して行われた補欠選挙を含む。 */
  seats: { sd: number; pr: number };
}

const S121 = { sd: 73, pr: 48 };
const S124 = { sd: 74, pr: 50 };
/** 選挙区に補欠選挙1人を合併して行った回（第26回 神奈川県、第27回 東京都）。 */
const S125 = { sd: 75, pr: 50 };

export const ELECTIONS: Election[] = [
  { n: 19, date: "2001-07-29", edition: "確定", seats: S121 },
  { n: 20, date: "2004-07-11", edition: "確定", seats: S121 },
  { n: 21, date: "2007-07-29", edition: "確定", seats: S121 },
  { n: 22, date: "2010-07-11", edition: "確定", seats: S121 },
  { n: 23, date: "2013-07-21", edition: "確定", seats: S121 },
  { n: 24, date: "2016-07-10", edition: "確定", seats: S121 },
  { n: 25, date: "2019-07-21", edition: "確定", seats: S124 },
  { n: 26, date: "2022-07-10", edition: "確定", seats: S125 },
  { n: 27, date: "2025-07-20", edition: "速報", seats: S125 },
];
