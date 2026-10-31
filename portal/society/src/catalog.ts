/**
 * シリーズ・ハブのカタログ。
 *
 * 公開 URL の slug とローカル作業ディレクトリが一致しないもの:
 * - occupation → ../japan-data-work-people/
 * - salary → ../japan-data-work-category/
 * - death → ../data-death/
 * それ以外は ../japan-data-{slug}/
 */

export type CategoryId = "life" | "work" | "home" | "justice" | "sea";

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
  { id: "life", label: "生きる・死ぬ" },
  { id: "work", label: "学ぶ・働く" },
  { id: "home", label: "暮らす・移る" },
  { id: "justice", label: "裁く・守る" },
  { id: "sea", label: "海を越える" },
];

export const CATALOG: CatalogEntry[] = [
  { slug: "payroll", title: "事業所は人をどう雇い、いくら払い、何時間働かせてきたか", source: "毎月勤労統計調査", period: "—", category: "work", status: "published", url: "/society/payroll/", art: "/society/art/employment.svg" },
  // —— 生きる・死ぬ ——
  {
    slug: "births",
    title: "日本人はどれだけ子どもを産んできたか",
    source: "人口動態統計",
    period: "—",
    category: "life",
    status: "published",
    url: "/society/births/",
    art: "/society/art/births.svg",
  },
  {
    slug: "marriage",
    title: "日本人はいつ結婚し、別れてきたか",
    source: "人口動態調査",
    period: "1899–2024",
    category: "life",
    status: "published",
    url: "/society/marriage/",
    art: "/society/art/marriage.svg",
  },
  {
    slug: "timeuse",
    title: "日本人は1日をどう使ってきたか",
    source: "社会生活基本調査",
    period: "1996–2021",
    category: "life",
    status: "published",
    url: "/society/timeuse/",
    art: "/society/art/timeuse.svg",
  },
  {
    slug: "disease",
    title: "日本人はどんな病気で病院にかかってきたか",
    source: "患者調査",
    period: "—",
    category: "life",
    status: "published",
    url: "/society/disease/",
    art: "/society/art/disease.svg",
  },
  {
    slug: "traffic-accidents",
    title: "日本人は交通事故でどれだけ傷ついてきたか",
    source: "警察庁交通事故統計",
    period: "—",
    category: "life",
    status: "published",
    url: "/society/traffic-accidents/",
    art: "/society/art/traffic-accidents.svg",
  },
  {
    slug: "death",
    title: "日本人は何で死んできたか",
    source: "人口動態調査",
    period: "1899–2024",
    category: "life",
    status: "published",
    url: "https://japan-data-death.visualizing.jp/",
    art: "/society/art/death.svg",
  },

  // —— 学ぶ・働く ——
  {
    slug: "schools",
    title: "日本人はどんな学校に通ってきたか",
    source: "学校基本調査",
    period: "—",
    category: "work",
    status: "published",
    url: "/society/schools/",
    art: "/society/art/schools.svg",
  },
  {
    slug: "education",
    title: "日本人はどこまで学ぶようになったか",
    source: "学校基本調査",
    period: "1948–2023",
    category: "work",
    status: "published",
    url: "/society/education/",
    art: "/society/art/education.svg",
  },
  {
    slug: "commuting",
    title: "日本人はどう通勤・通学してきたか",
    source: "国勢調査",
    period: "—",
    category: "work",
    status: "published",
    url: "/society/commuting/",
    art: "/society/art/commuting.svg",
  },
  {
    slug: "occupation",
    title: "日本人はどんな仕事をしてきたか",
    source: "労働力調査・国勢調査",
    period: "2009–2025",
    category: "work",
    status: "published",
    url: "/society/work-people/",
    art: "/society/art/occupation.svg",
  },
  {
    slug: "employment",
    title: "日本人はどんな働き方をしてきたか",
    source: "労働力調査",
    period: "1953–2025",
    category: "work",
    status: "published",
    url: "/society/employment/",
    art: "/society/art/employment.svg",
  },
  {
    slug: "salary",
    title: "業種で給与はどれだけ違うか",
    source: "民間給与実態統計調査",
    period: "2014–2024",
    category: "work",
    status: "published",
    url: "/society/work-category/",
    art: "/society/art/salary.svg",
  },
  {
    slug: "working-age",
    title: "日本人は何歳まで働くようになったか",
    source: "労働力調査",
    period: "1953–2025",
    category: "work",
    status: "published",
    url: "/society/working-age/",
    art: "/society/art/working-age.svg",
  },

  // —— 暮らす・移る ——
  {
    slug: "food",
    title: "日本人は何を食べてきたか",
    source: "食料需給表",
    period: "1960–2023",
    category: "home",
    status: "published",
    url: "/society/food/",
    art: "/society/art/food.svg",
  },
  {
    slug: "households",
    title: "日本人はどう暮らしてきたか",
    source: "国勢調査・世帯数推計",
    period: "1995–2050",
    category: "home",
    status: "published",
    url: "/society/households/",
    art: "/society/art/households.svg",
  },
  {
    slug: "housing",
    title: "日本人はどんな家に住んできたか",
    source: "住宅・土地統計調査",
    period: "1978–2023",
    category: "home",
    status: "published",
    url: "/society/housing/",
    art: "/society/art/housing.svg",
  },
  {
    slug: "spending",
    title: "日本人は何にお金を使ってきたか",
    source: "家計調査",
    period: "—",
    category: "home",
    status: "published",
    url: "/society/spending/",
    art: "/society/art/spending.svg",
  },
  {
    slug: "migration",
    title: "日本人はどこへ移り住んできたか",
    source: "住民基本台帳人口移動報告",
    period: "1954–2025",
    category: "home",
    status: "published",
    url: "/society/migration/",
    art: "/society/art/migration.svg",
  },
  {
    slug: "foreign-residents",
    title: "日本の外国人住民はどこにいるか",
    source: "住民基本台帳",
    period: "2013–2026",
    category: "home",
    status: "published",
    url: "/society/foreign-residents/",
    art: "/society/art/foreign-residents.svg",
  },
  {
    slug: "registry",
    title: "日本の土地と建物はどう名義が動いてきたか",
    source: "登記統計",
    period: "2010–2024",
    category: "home",
    status: "published",
    url: "/society/registry/",
    art: "/society/art/registry.svg",
  },
  {
    slug: "waste",
    title: "日本はどれだけごみを出してきたか",
    source: "一般廃棄物処理実態調査",
    period: "—",
    category: "home",
    status: "published",
    url: "/society/waste/",
    art: "/society/art/waste.svg",
  },
  {
    slug: "environment",
    title: "日本では空気と水はどれだけきれいになったか",
    source: "環境統計",
    period: "—",
    category: "home",
    status: "published",
    url: "/society/environment/",
    art: "/society/art/environment.svg",
  },

  // —— 裁く・守る ——
  {
    slug: "crime",
    title: "日本ではどんな犯罪が起きてきたか",
    source: "犯罪統計・警察白書",
    period: "—",
    category: "justice",
    status: "published",
    url: "/society/crime/",
    art: "/society/art/crime.svg",
  },
  {
    slug: "prosecution",
    title: "日本では捕まえた人をどれだけ起訴してきたか",
    source: "検察統計",
    period: "1955–2024",
    category: "justice",
    status: "published",
    url: "/society/prosecution/",
    art: "/society/art/prosecution.svg",
  },
  {
    slug: "prisons",
    title: "日本はどれだけ人を刑務所に入れてきたか",
    source: "矯正統計・保護統計",
    period: "1946–2024",
    category: "justice",
    status: "published",
    url: "/society/prisons/",
    art: "/society/art/prisons.svg",
  },
  {
    slug: "juvenile",
    title: "日本では非行少年をどう処遇してきたか",
    source: "少年矯正統計",
    period: "1949–2024",
    category: "justice",
    status: "published",
    url: "/society/juvenile/",
    art: "/society/art/juvenile.svg",
  },

  // —— 海を越える ——
  {
    slug: "overseas",
    title: "日本人は海外のどこに住んできたか",
    source: "海外在留邦人数調査統計",
    period: "1991–2025",
    category: "sea",
    status: "published",
    url: "/society/overseas/",
    art: "/society/art/overseas.svg",
  },
  {
    slug: "outbound",
    title: "日本人はどれだけ海外へ出てきたか",
    source: "出入国管理統計・JNTO",
    period: "1964–2025",
    category: "sea",
    status: "published",
    url: "/society/outbound/",
    art: "/society/art/outbound.svg",
  },
];
