/** 都道府県・年齢・滞在期間・旅行目的。出典の表記に合わせる。 */

export const PREFS = ([
  ["01", "北海道"],
  ["02", "青森"],
  ["03", "岩手"],
  ["04", "宮城"],
  ["05", "秋田"],
  ["06", "山形"],
  ["07", "福島"],
  ["08", "茨城"],
  ["09", "栃木"],
  ["10", "群馬"],
  ["11", "埼玉"],
  ["12", "千葉"],
  ["13", "東京"],
  ["14", "神奈川"],
  ["15", "新潟"],
  ["16", "富山"],
  ["17", "石川"],
  ["18", "福井"],
  ["19", "山梨"],
  ["20", "長野"],
  ["21", "岐阜"],
  ["22", "静岡"],
  ["23", "愛知"],
  ["24", "三重"],
  ["25", "滋賀"],
  ["26", "京都"],
  ["27", "大阪"],
  ["28", "兵庫"],
  ["29", "奈良"],
  ["30", "和歌山"],
  ["31", "鳥取"],
  ["32", "島根"],
  ["33", "岡山"],
  ["34", "広島"],
  ["35", "山口"],
  ["36", "徳島"],
  ["37", "香川"],
  ["38", "愛媛"],
  ["39", "高知"],
  ["40", "福岡"],
  ["41", "佐賀"],
  ["42", "長崎"],
  ["43", "熊本"],
  ["44", "大分"],
  ["45", "宮崎"],
  ["46", "鹿児島"],
  ["47", "沖縄"],
] as const).map(([code, label]) => ({ code, label }));

export const JAPAN = { code: "00", label: "全国" };
export const ABROAD = { code: "98", label: "外国" };
export const UNKNOWN_AREA = { code: "99", label: "不詳" };

/** 全角括弧・波ダッシュを NFKC で半角にそろえる。見出しの比較はこれを通す。 */
export function canon(s: string): string {
  return s.normalize("NFKC").replace(/\s+/g, "");
}

const PREF_CODE = new Map<string, string>(PREFS.map((p) => [p.label, p.code]));

export function areaCode(label: string): string | null {
  if (label === "総数") return JAPAN.code;
  if (label === "外国") return ABROAD.code;
  if (label === "不詳") return UNKNOWN_AREA.code;
  return PREF_CODE.get(label) ?? null;
}

export const SEXES = [
  { code: "total", label: "計" },
  { code: "male", label: "男" },
  { code: "female", label: "女" },
] as const;

export function sexCode(label: string): "total" | "male" | "female" | null {
  if (label === "総数") return "total";
  if (label === "男") return "male";
  if (label === "女") return "female";
  return null;
}

/** 5歳階級。表に無い年の「不詳」は null のまま残す。 */
export const AGES = [
  { code: "total", label: "計", match: "総数" },
  { code: "0", label: "0–4歳", match: "0～4歳" },
  { code: "5", label: "5–9歳", match: "5～9歳" },
  { code: "10", label: "10–14歳", match: "10～14歳" },
  { code: "15", label: "15–19歳", match: "15～19歳" },
  { code: "20", label: "20–24歳", match: "20～24歳" },
  { code: "25", label: "25–29歳", match: "25～29歳" },
  { code: "30", label: "30–34歳", match: "30～34歳" },
  { code: "35", label: "35–39歳", match: "35～39歳" },
  { code: "40", label: "40–44歳", match: "40～44歳" },
  { code: "45", label: "45–49歳", match: "45～49歳" },
  { code: "50", label: "50–54歳", match: "50～54歳" },
  { code: "55", label: "55–59歳", match: "55～59歳" },
  { code: "60", label: "60–64歳", match: "60～64歳" },
  { code: "65", label: "65–69歳", match: "65～69歳" },
  { code: "70", label: "70歳以上", match: "70歳以上" },
  { code: "unknown", label: "不詳", match: "不詳" },
] as const;

export function ageCode(label: string): string | null {
  const s = canon(label);
  return AGES.find((a) => canon(a.match) === s)?.code ?? null;
}

/**
 * 滞在期間。表記は上限で、隣の区分とは重ならない（合計が総数になる）。
 * 「10日以内」は「5日以内」の次の区分。
 */
export const DURATIONS = [
  { code: "d5", label: "5日以内", match: "5日以内" },
  { code: "d10", label: "10日以内", match: "10日以内" },
  { code: "d15", label: "15日以内", match: "15日以内" },
  { code: "d20", label: "20日以内", match: "20日以内" },
  { code: "m1", label: "1月以内", match: "1月以内" },
  { code: "m2", label: "2月以内", match: "2月以内" },
  { code: "m3", label: "3月以内", match: "3月以内" },
  { code: "m6", label: "6月以内", match: "6月以内" },
  { code: "y1", label: "1年以内", match: "1年以内" },
  { code: "y2", label: "2年以内", match: "2年以内" },
  { code: "y3", label: "3年以内", match: "3年以内" },
  { code: "y5", label: "5年以内", match: "5年以内" },
  { code: "y10", label: "10年以内", match: "10年以内" },
  { code: "y10p", label: "10年を超える", match: "10年を超える" },
  { code: "unknown", label: "不詳", match: "不詳" },
] as const;

export function durationCode(label: string): string | null {
  const s = canon(label);
  if (s === "総数") return "total";
  return DURATIONS.find((d) => canon(d.match) === s)?.code ?? null;
}

export const DESTINATIONS = [
  { code: "world", label: "合計", match: "主目的地" },
  { code: "asia", label: "アジア", match: "アジア州" },
  { code: "europe", label: "ヨーロッパ", match: "ヨーロッパ州" },
  { code: "namerica", label: "北アメリカ", match: "北アメリカ州" },
  { code: "samerica", label: "南アメリカ", match: "南アメリカ州" },
  { code: "africa", label: "アフリカ", match: "アフリカ州" },
  { code: "oceania", label: "大洋州", match: "大洋州" },
] as const;

export function destinationCode(label: string): string | null {
  const s = canon(label);
  return DESTINATIONS.find((d) => s.startsWith(canon(d.match)))?.code ?? null;
}

export const PURPOSES = [
  { code: "total", label: "計" },
  { code: "tourism", label: "観光・レクリエーション", match: "観光" },
  { code: "visit", label: "帰省・知人訪問", match: "帰省" },
  { code: "business", label: "出張・業務", match: "出張" },
] as const;

export function purposeCode(label: string): string | null {
  return PURPOSES.find((p) => "match" in p && label.includes(p.match))?.code ?? null;
}
