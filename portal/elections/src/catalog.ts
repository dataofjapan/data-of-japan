export type CategoryId = "shugiin" | "sangiin" | "governors";

export type ProjectStatus = "published" | "pending";

export type CatalogEntry = {
  slug: string;
  title: string;
  description: string;
  source: string;
  period: string;
  category: CategoryId;
  status: ProjectStatus;
  url: string | null;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "shugiin", label: "衆議院" },
  { id: "sangiin", label: "参議院" },
  { id: "governors", label: "都道府県知事" },
];

export const CATALOG: CatalogEntry[] = [
  // —— 衆議院 ——
  {
    slug: "turnout",
    title: "衆議院選挙で、どれだけの人が投票したか",
    description: "全国・都道府県・年代別に、投票率と投票者数の変化をたどります。",
    source: "総務省 結果調ほか",
    period: "1946–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/turnout/",
  },
  {
    slug: "timeseries",
    title: "衆議院選挙で、どの党がどれだけ票を得てきたか",
    description: "政党別の得票数と得票率を、全国と地域ごとに比較します。",
    source: "総務省 結果調",
    period: "1996–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/votes/",
  },
  {
    slug: "candidates",
    title: "衆議院選挙で、誰が立候補し、誰が当選したか",
    description: "候補者と当選者の顔ぶれを、党派・性別・経歴などから見ます。",
    source: "総務省 結果調",
    period: "2005–2026",
    category: "shugiin",
    status: "published",
    url: "/politics/elections/shugiin/candidates/",
  },
  {
    slug: "seats",
    title: "衆議院選挙で、得た票はどれだけ議席になったか",
    description: "各党の得票率と議席率を比べ、票が議席につながる仕組みを探ります。",
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
    description: "全国・都道府県・年代別に、投票率と投票者数の変化をたどります。",
    source: "総務省 結果調ほか",
    period: "1947–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/turnout/",
  },
  {
    slug: "timeseries",
    title: "参議院選挙で、どの党がどれだけ票を得てきたか",
    description: "政党別の得票数と得票率を、全国と地域ごとに比較します。",
    source: "総務省 結果調",
    period: "2001–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/votes/",
  },
  {
    slug: "candidates",
    title: "参議院選挙で、誰が立候補し、誰が当選したか",
    description: "候補者と当選者の顔ぶれを、党派・性別・経歴などから見ます。",
    source: "総務省 結果調",
    period: "2001–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/candidates/",
  },
  {
    slug: "seats",
    title: "参議院選挙で、得た票はどれだけ議席になったか",
    description: "各党の得票率と議席率を比べ、票が議席につながる仕組みを探ります。",
    source: "総務省 結果調",
    period: "2001–2025",
    category: "sangiin",
    status: "published",
    url: "/politics/elections/sangiin/seats/",
  },
  {
    slug: "governors",
    title: "都道府県知事選挙で、誰がどれだけ票を得てきたか",
    description: "都道府県ごとの知事選挙を、陣営別得票・投票率・市町村別の変化から読み解きます。",
    source: "都道府県選挙管理委員会ほか",
    period: "—",
    category: "governors",
    status: "published",
    url: "/politics/elections/governors/",
  },
];
