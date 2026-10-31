/**
 * 対象とする通常選挙の目録。出典の正本は docs/data-sources.md。
 *
 * 比例代表が非拘束名簿式になった第19回（2001年）から。
 * 第19回は HTML、第20回は PDF、第21回以降は Excel で公開されている。
 */

export type Edition = "確定" | "速報";

/** 総務省の結果ページから取る表。 */
export type TableId = "sdNational" | "prNational" | "sdPref" | "prPref";

export interface Source {
  url: string;
  format: "html" | "pdf" | "xls" | "xlsx";
}

export interface Election {
  n: number;
  date: string;
  edition: Edition;
  /** 選挙すべき議員の数（選挙区・比例代表）。選挙区は合併して行われた補欠選挙を含む。 */
  seats: { sd: number; pr: number };
  page: string;
  tables: Record<TableId, Source>;
}

const MAIN = "https://www.soumu.go.jp/main_content/";
const DATA = "https://www.soumu.go.jp/senkyo/senkyo_s/data/";
const PAGE = (n: number, file = "index.html") => `${DATA}sangiin${n}/${file}`;

const x = (id: string): Source => ({ url: `${MAIN}${id}`, format: id.endsWith(".xlsx") ? "xlsx" : "xls" });

/** 表の並びは どの回も 党派別得票数（比例代表・選挙区）、都道府県別党派別得票数（比例代表・選挙区）。 */
function tables(pr: Source, sd: Source, prPref: Source, sdPref: Source): Record<TableId, Source> {
  return { prNational: pr, sdNational: sd, prPref, sdPref };
}

const h19 = (k: string): Source => ({ url: `${DATA}sangiin19/sangiin19_${k}.html`, format: "html" });
const p20 = (k: string): Source => ({ url: `https://www.soumu.go.jp/news/pdf/040711_${k}.pdf`, format: "pdf" });
const x21 = (k: string): Source => ({ url: `${DATA}sangiin21/xls/sangiin21_${k}.xls`, format: "xls" });

export const ELECTIONS: Election[] = [
  {
    n: 19,
    date: "2001-07-29",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(19),
    tables: tables(h19("3_3"), h19("3_4"), h19("3_5"), h19("3_6")),
  },
  {
    n: 20,
    date: "2004-07-11",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(20),
    tables: tables(p20("3-03"), p20("3-04"), p20("3-05"), p20("3-06")),
  },
  {
    n: 21,
    date: "2007-07-29",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(21),
    tables: tables(x21("3_3"), x21("3_4"), x21("3_5"), x21("3_6")),
  },
  {
    n: 22,
    date: "2010-07-11",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(22, "index_1.html"),
    tables: tables(x("000074807.xls"), x("000074808.xls"), x("000074810.xls"), x("000074811.xls")),
  },
  {
    n: 23,
    date: "2013-07-21",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(23),
    tables: tables(x("000244367.xls"), x("000244368.xls"), x("000244369.xls"), x("000244370.xls")),
  },
  {
    n: 24,
    date: "2016-07-10",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(24),
    tables: tables(x("000430608.xls"), x("000430609.xls"), x("000430610.xls"), x("000430611.xls")),
  },
  {
    n: 25,
    date: "2019-07-21",
    edition: "確定",
    seats: { sd: 74, pr: 50 },
    page: PAGE(25),
    tables: tables(x("000636673.xls"), x("000636674.xls"), x("000636675.xls"), x("000636676.xls")),
  },
  {
    n: 26,
    date: "2022-07-10",
    edition: "確定",
    seats: { sd: 75, pr: 50 },
    page: PAGE(26),
    tables: tables(x("000825827.xls"), x("000825829.xls"), x("000825832.xls"), x("000825834.xls")),
  },
  {
    n: 27,
    date: "2025-07-20",
    edition: "速報",
    seats: { sd: 75, pr: 50 },
    page: PAGE(27),
    tables: tables(x("001027815.xlsx"), x("001027816.xlsx"), x("001027818.xlsx"), x("001027819.xlsx")),
  },
];
