/**
 * 都道府県の目録。
 *
 * 公開 URL は governor-election-{slug}.visualizing.jp、ローカル作業ディレクトリは ../{code}_{slug}/。
 * サイトを公開したら、その県の site を埋める。
 */

export interface Site {
  url: string;
  /** 県全体の記録の範囲。 */
  period: string;
  /** 市町村別を持つ範囲。 */
  municipal: string;
}

export interface Prefecture {
  code: string;
  name: string;
  slug: string;
  region: RegionId;
  site: Site | null;
}

export type RegionId = "hokkaido-tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu-okinawa";

export const REGIONS: { id: RegionId; label: string }[] = [
  { id: "hokkaido-tohoku", label: "北海道・東北" },
  { id: "kanto", label: "関東" },
  { id: "chubu", label: "中部" },
  { id: "kinki", label: "近畿" },
  { id: "chugoku", label: "中国" },
  { id: "shikoku", label: "四国" },
  { id: "kyushu-okinawa", label: "九州・沖縄" },
];

const p = (code: string, name: string, slug: string, region: RegionId, site: Site | null = null): Prefecture => ({
  code,
  name,
  slug,
  region,
  site,
});

export const PREFECTURES: Prefecture[] = [
  p("01", "北海道", "hokkaido", "hokkaido-tohoku"),
  p("02", "青森県", "aomori", "hokkaido-tohoku"),
  p("03", "岩手県", "iwate", "hokkaido-tohoku"),
  p("04", "宮城県", "miyagi", "hokkaido-tohoku"),
  p("05", "秋田県", "akita", "hokkaido-tohoku"),
  p("06", "山形県", "yamagata", "hokkaido-tohoku"),
  p("07", "福島県", "fukushima", "hokkaido-tohoku"),
  p("08", "茨城県", "ibaraki", "kanto"),
  p("09", "栃木県", "tochigi", "kanto"),
  p("10", "群馬県", "gunma", "kanto"),
  p("11", "埼玉県", "saitama", "kanto"),
  p("12", "千葉県", "chiba", "kanto"),
  p("13", "東京都", "tokyo", "kanto"),
  p("14", "神奈川県", "kanagawa", "kanto"),
  p("15", "新潟県", "niigata", "chubu"),
  p("16", "富山県", "toyama", "chubu"),
  p("17", "石川県", "ishikawa", "chubu"),
  p("18", "福井県", "fukui", "chubu"),
  p("19", "山梨県", "yamanashi", "chubu"),
  p("20", "長野県", "nagano", "chubu"),
  p("21", "岐阜県", "gifu", "chubu"),
  p("22", "静岡県", "shizuoka", "chubu"),
  p("23", "愛知県", "aichi", "chubu"),
  p("24", "三重県", "mie", "kinki"),
  p("25", "滋賀県", "shiga", "kinki"),
  p("26", "京都府", "kyoto", "kinki"),
  p("27", "大阪府", "osaka", "kinki"),
  p("28", "兵庫県", "hyogo", "kinki"),
  p("29", "奈良県", "nara", "kinki"),
  p("30", "和歌山県", "wakayama", "kinki"),
  p("31", "鳥取県", "tottori", "chugoku"),
  p("32", "島根県", "shimane", "chugoku"),
  p("33", "岡山県", "okayama", "chugoku"),
  p("34", "広島県", "hiroshima", "chugoku"),
  p("35", "山口県", "yamaguchi", "chugoku"),
  p("36", "徳島県", "tokushima", "shikoku"),
  p("37", "香川県", "kagawa", "shikoku"),
  p("38", "愛媛県", "ehime", "shikoku"),
  p("39", "高知県", "kochi", "shikoku"),
  p("40", "福岡県", "fukuoka", "kyushu-okinawa"),
  p("41", "佐賀県", "saga", "kyushu-okinawa"),
  p("42", "長崎県", "nagasaki", "kyushu-okinawa"),
  p("43", "熊本県", "kumamoto", "kyushu-okinawa"),
  p("44", "大分県", "oita", "kyushu-okinawa"),
  p("45", "宮崎県", "miyazaki", "kyushu-okinawa"),
  p("46", "鹿児島県", "kagoshima", "kyushu-okinawa"),
  p("47", "沖縄県", "okinawa", "kyushu-okinawa", {
    url: "/politics/elections/governors/okinawa/",
    period: "1972–2026",
    municipal: "2002–2026",
  }),
];
