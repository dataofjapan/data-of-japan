/**
 * 対象とする通常選挙の目録。出典の正本は docs/data-sources.md。
 *
 * 兄弟サイト（得票）と同じく、比例代表が非拘束名簿式になった第19回（2001年）から。
 * 第19回は HTML、第20回は PDF、第21回以降は Excel で公開されている。
 */

export type Edition = "確定" | "速報";

/** 総務省の結果ページから取る表。cand は候補者数、win は当選人数。 */
export const TABLES = ["candParty", "candPref", "winParty", "winPref"] as const;
export type TableId = (typeof TABLES)[number];

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
const h19 = (k: string): Source => ({ url: `${DATA}sangiin19/sangiin19_${k}.html`, format: "html" });
const p20 = (k: string): Source => ({ url: `https://www.soumu.go.jp/news/pdf/040711_${k}.pdf`, format: "pdf" });
const x21 = (k: string): Source => ({ url: `${DATA}sangiin21/xls/sangiin21_${k}.xls`, format: "xls" });

/** TABLES と同じ並び。 */
const tables = (...sources: Source[]) =>
  Object.fromEntries(TABLES.map((t, i) => [t, sources[i]!])) as Record<TableId, Source>;

export const ELECTIONS: Election[] = [
  {
    n: 19,
    date: "2001-07-29",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(19),
    tables: tables(h19("1_1"), h19("1_2"), h19("3_1"), h19("3_2")),
  },
  {
    n: 20,
    date: "2004-07-11",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(20),
    tables: tables(p20("1-1"), p20("1-2"), p20("3-01"), p20("3-02")),
  },
  {
    n: 21,
    date: "2007-07-29",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(21),
    tables: tables(x21("1_1"), x21("1_2"), x21("3_1"), x21("3_2")),
  },
  {
    n: 22,
    date: "2010-07-11",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(22, "index_1.html"),
    tables: tables(x("000074798.xls"), x("000074799.xls"), x("000074805.xls"), x("000074806.xls")),
  },
  {
    n: 23,
    date: "2013-07-21",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(23),
    tables: tables(x("000244359.xls"), x("000244360.xls"), x("000244365.xls"), x("000244366.xls")),
  },
  {
    n: 24,
    date: "2016-07-10",
    edition: "確定",
    seats: { sd: 73, pr: 48 },
    page: PAGE(24),
    tables: tables(x("000430600.xls"), x("000430601.xls"), x("000430606.xls"), x("000430607.xls")),
  },
  {
    n: 25,
    date: "2019-07-21",
    edition: "確定",
    seats: { sd: 74, pr: 50 },
    page: PAGE(25),
    tables: tables(x("000636664.xls"), x("000636665.xls"), x("000636671.xls"), x("000636672.xls")),
  },
  {
    n: 26,
    date: "2022-07-10",
    edition: "確定",
    seats: { sd: 75, pr: 50 },
    page: PAGE(26),
    tables: tables(x("000825819.xls"), x("000825820.xls"), x("000825825.xls"), x("000825826.xls")),
  },
  {
    n: 27,
    date: "2025-07-20",
    edition: "速報",
    seats: { sd: 75, pr: 50 },
    page: PAGE(27),
    tables: tables(x("001027807.xlsx"), x("001027808.xlsx"), x("001027813.xlsx"), x("001027814.xlsx")),
  },
];
