/**
 * シリーズ・ハブのカタログ。
 *
 * 院ごとに領域を分ける。
 * 衆議院: 公開 URL は election-shugiin-{slug}.visualizing.jp、ローカル作業ディレクトリは ../shugiin-{slug}/。
 * 参議院: 公開 URL は election-sangiin-{slug}.visualizing.jp、ローカル作業ディレクトリは ../sangiin-{slug}/。
 */

export type CategoryId = "shugiin" | "sangiin";

export type ProjectStatus = "published" | "pending";

export type CatalogEntry = {
  slug: string;
  title: string;
  source: string;
  period: string;
  category: CategoryId;
  status: ProjectStatus;
  url: string | null;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "shugiin", label: "衆議院" },
  { id: "sangiin", label: "参議院" },
];

export const CATALOG: CatalogEntry[] = [
  // —— 衆議院 ——
  {
    slug: "turnout",
    title: "衆議院選挙で、どれだけの人が投票したか",
    source: "総務省 結果調ほか",
    period: "1946–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/turnout/",
  },
  {
    slug: "timeseries",
    title: "衆議院選挙で、どの党がどれだけ票を得てきたか",
    source: "総務省 結果調",
    period: "1996–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/votes/",
  },
  {
    slug: "candidates",
    title: "衆議院選挙で、誰が立候補し、誰が当選したか",
    source: "総務省 結果調",
    period: "2005–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/candidates/",
  },
  {
    slug: "seats",
    title: "衆議院選挙で、得た票はどれだけ議席になったか",
    source: "総務省 結果調",
    period: "1996–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/seats/",
  },

  // —— 参議院 ——
  {
    slug: "turnout",
    title: "参議院選挙で、どれだけの人が投票したか",
    source: "総務省 結果調ほか",
    period: "1947–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/turnout/",
  },
  {
    slug: "timeseries",
    title: "参議院選挙で、どの党がどれだけ票を得てきたか",
    source: "総務省 結果調",
    period: "2001–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/votes/",
  },
  {
    slug: "candidates",
    title: "参議院選挙で、誰が立候補し、誰が当選したか",
    source: "総務省 結果調",
    period: "2001–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/candidates/",
  },
  {
    slug: "seats",
    title: "参議院選挙で、得た票はどれだけ議席になったか",
    source: "総務省 結果調",
    period: "2001–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/seats/",
  },
];
