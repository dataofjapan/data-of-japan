/**
 * シリーズ・ハブのカタログ。
 *
 * 公開 URL は japan-foreigners-{slug}.Data of Japan、ローカル作業ディレクトリは ../japan-foreigners-{slug}/。
 * 住民基本台帳でみる居住地は japan-data シリーズの foreign-residents が受け持つので、ここでは扱わない。
 */

export type CategoryId = "visit" | "live" | "work" | "arrest";

export type ProjectStatus = "published" | "pending";

export type CatalogEntry = {
  slug: string;
  title: string;
  source: string;
  period: string;
  category: CategoryId;
  status: ProjectStatus;
  url: string | null;
  art: string;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "visit", label: "訪れる" },
  { id: "live", label: "住む" },
  { id: "work", label: "働く" },
  { id: "arrest", label: "検挙" },
];

export const CATALOG: CatalogEntry[] = [
  // —— 訪れる ——
  {
    slug: "visitors",
    title: "日本には、どれだけの外国人が訪れてきたか",
    source: "JNTO 訪日外客統計",
    period: "1964–2026",
    category: "visit",
    status: "published",
    url: "/foreigners/visitors/",
    art: "/foreigners/art/visitors.svg",
  },
  {
    slug: "spending",
    title: "訪れた外国人は、いくら使ってきたか",
    source: "観光庁 インバウンド消費動向調査",
    period: "2010–2026",
    category: "visit",
    status: "published",
    url: "/foreigners/spending/",
    art: "/foreigners/art/spending.svg",
  },
  {
    slug: "stays",
    title: "訪れた外国人は、どこに泊まってきたか",
    source: "観光庁 宿泊旅行統計調査",
    period: "2011–2025",
    category: "visit",
    status: "published",
    url: "/foreigners/stays/",
    art: "/foreigners/art/stays.svg",
  },

  // —— 住む ——
  {
    slug: "status",
    title: "日本に住む外国人は、どんな在留資格でいるか",
    source: "出入国在留管理庁 在留外国人統計",
    period: "2006–2025",
    category: "live",
    status: "published",
    url: "/foreigners/status/",
    art: "/foreigners/art/status.svg",
  },

  // —— 働く ——
  {
    slug: "workers",
    title: "日本で働く外国人は、どこから来たか",
    source: "厚生労働省 外国人雇用状況",
    period: "2016–2025",
    category: "work",
    status: "published",
    url: "/foreigners/workers/",
    art: "/foreigners/art/workers.svg",
  },

  // —— 検挙 ——
  {
    slug: "crime",
    title: "日本で検挙された外国人は、どこから来たか",
    source: "警察庁 犯罪統計書",
    period: "2015–2024",
    category: "arrest",
    status: "published",
    url: "/foreigners/crime/",
    art: "/foreigners/art/crime.svg",
  },
];
