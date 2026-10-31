/** 令和6年の犯罪統計書。年次表は2015–2024年。 */

export const PAGE_URL = "https://www.npa.go.jp/toukei/soubunkan/R06/R06hanzaitoukei.htm";

export const TABLES = [
  { id: "129", url: "https://www.npa.go.jp/toukei/soubunkan/R06/excel/R06_129.xlsx" },
  { id: "132", url: "https://www.npa.go.jp/toukei/soubunkan/R06/excel/R06_132.xlsx" },
  { id: "133", url: "https://www.npa.go.jp/toukei/soubunkan/R06/excel/R06_133.xlsx" },
] as const;
