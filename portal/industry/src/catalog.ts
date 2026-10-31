/**
 * シリーズ・ハブのカタログ。ローカル作業ディレクトリは ../japan-industry-{slug}/。
 */

export type CategoryId = "energy";

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
  { id: "energy", label: "エネルギー" },
];

export const CATALOG: CatalogEntry[] = [
  {
    slug: "energy",
    title: "日本は何のエネルギーに頼ってきたか",
    source: "総合エネルギー統計",
    period: "1990–2024",
    category: "energy",
    status: "published",
    // 本番ドメインが決まるまでは、energy のローカル開発サーバを指す。
    url: "/industry/energy/",
  },
  {
    slug: "energy-pref",
    title: "どの県が、何にエネルギーを使っているか",
    source: "都道府県別エネルギー消費統計",
    period: "1990–2023",
    category: "energy",
    status: "published",
    url: "/industry/energy-pref/",
  },
];
