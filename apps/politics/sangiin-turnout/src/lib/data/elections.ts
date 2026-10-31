/**
 * 対象とする通常選挙の目録。出典の正本は docs/data-sources.md。
 *
 * 全国の投票率は第1回（1947年）から。
 * 都道府県別の有権者数・投票者数の表は、兄弟サイトと同じ第19回（2001年）から読む。
 */

export type Edition = "確定" | "速報";

/** 各回の結果ページから取る表。都道府県別有権者数、投票者数、投票率（選挙区・比例代表）。 */
export const TABLES = ["sdPref", "prPref"] as const;
export type TableId = (typeof TABLES)[number];

export interface Source {
  url: string;
  format: "html" | "pdf" | "xls" | "xlsx";
}

export interface Election {
  n: number;
  date: string;
  edition: Edition;
  page: string | null;
  /** 空なら都道府県別の表は読まない（全国値だけ）。 */
  tables: Partial<Record<TableId, Source>>;
}

const MAIN = "https://www.soumu.go.jp/main_content/";
const DATA = "https://www.soumu.go.jp/senkyo/senkyo_s/data/";
const PAGE = (n: number, file = "index.html") => `${DATA}sangiin${n}/${file}`;

/** 第1〜26回の全国の男女別有権者数・投票者数（第26回確定結果調「当日有権者数、投票者数」「男女別投票率」）。 */
export const HISTORY_SOURCE: Source = {
  url: "https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040269606&fileKind=2",
  format: "pdf",
};

/** 年代別投票率（抽出）の推移（第15回以降）。総務省が通常選挙のたびに同じ URL で差し替える。 */
export const AGE_SOURCE: Source = { url: `${MAIN}000646811.pdf`, format: "pdf" };
export const AGE_PAGE = "https://www.soumu.go.jp/senkyo/senkyo_s/news/sonota/nendaibetu/index.html";

const x = (id: string): Source => ({ url: `${MAIN}${id}`, format: id.endsWith(".xlsx") ? "xlsx" : "xls" });
const h19 = (k: string): Source => ({ url: `${DATA}sangiin19/sangiin19_${k}.html`, format: "html" });
const p20 = (k: string): Source => ({ url: `https://www.soumu.go.jp/news/pdf/040711_${k}.pdf`, format: "pdf" });
const x21 = (k: string): Source => ({ url: `${DATA}sangiin21/xls/sangiin21_${k}.xls`, format: "xls" });

/** 全国値だけの回（確定結果調の表が正本）。 */
const old = (n: number, date: string): Election => ({ n, date, edition: "確定", page: null, tables: {} });

export const ELECTIONS: Election[] = [
  old(1, "1947-04-20"),
  old(2, "1950-06-04"),
  old(3, "1953-04-24"),
  old(4, "1956-07-08"),
  old(5, "1959-06-02"),
  old(6, "1962-07-01"),
  old(7, "1965-07-04"),
  old(8, "1968-07-07"),
  old(9, "1971-06-27"),
  old(10, "1974-07-07"),
  old(11, "1977-07-10"),
  old(12, "1980-06-22"),
  old(13, "1983-06-26"),
  old(14, "1986-07-06"),
  old(15, "1989-07-23"),
  old(16, "1992-07-26"),
  old(17, "1995-07-23"),
  old(18, "1998-07-12"),
  { n: 19, date: "2001-07-29", edition: "確定", page: PAGE(19), tables: { sdPref: h19("2_3"), prPref: h19("2_1") } },
  { n: 20, date: "2004-07-11", edition: "確定", page: PAGE(20), tables: { sdPref: p20("2-2"), prPref: p20("2-1_1") } },
  { n: 21, date: "2007-07-29", edition: "確定", page: PAGE(21), tables: { sdPref: x21("2_3"), prPref: x21("2_1") } },
  { n: 22, date: "2010-07-11", edition: "確定", page: PAGE(22, "index_1.html"), tables: { sdPref: x("000074802.xls"), prPref: x("000074800.xls") } },
  { n: 23, date: "2013-07-21", edition: "確定", page: PAGE(23), tables: { sdPref: x("000244363.xls"), prPref: x("000244361.xls") } },
  { n: 24, date: "2016-07-10", edition: "確定", page: PAGE(24), tables: { sdPref: x("000430604.xls"), prPref: x("000430602.xls") } },
  { n: 25, date: "2019-07-21", edition: "確定", page: PAGE(25), tables: { sdPref: x("000636669.xls"), prPref: x("000636666.xls") } },
  { n: 26, date: "2022-07-10", edition: "確定", page: PAGE(26), tables: { sdPref: x("000825823.xls"), prPref: x("000825821.xls") } },
  { n: 27, date: "2025-07-20", edition: "速報", page: PAGE(27), tables: { sdPref: x("001027811.xlsx"), prPref: x("001027809.xlsx") } },
];

/** 比例代表の最初の回。これより前（第12回まで）の全国単位の選挙は全国区、都道府県単位は地方区。 */
export const FIRST_PR = 13;

/** 確定結果調（HISTORY_SOURCE）に載っている最後の回。 */
export const LAST_HISTORY = 26;

/** 年代別投票率の年代。10歳代は選挙権年齢が18歳に下がった第24回から。 */
export const AGE_GROUPS = ["10歳代", "20歳代", "30歳代", "40歳代", "50歳代", "60歳代", "70歳代以上"] as const;
