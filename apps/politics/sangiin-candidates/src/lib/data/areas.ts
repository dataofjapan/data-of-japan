/**
 * 都道府県と選挙区。名前は結果調の表記（空白を除いたもの）と一致させる。
 */

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

const PREF_SET = new Set<string>(PREFECTURES);

/** 2桁の都道府県コード（01〜47）。 */
export function prefCode(name: string): string {
  const i = PREFECTURES.indexOf(name as (typeof PREFECTURES)[number]);
  if (i < 0) throw new Error(`都道府県名ではない: ${name}`);
  return String(i + 1).padStart(2, "0");
}

/** 選挙区に含まれる都道府県。合区（第24回から）は「鳥取県・島根県」のように「・」でつなぐ。 */
export function prefsOf(district: string): string[] {
  return district.split("・");
}

/** 選挙区の名前か。都道府県1つ、または都道府県を「・」でつないだ合区。 */
export function isDistrict(name: string): boolean {
  return name !== "" && prefsOf(name).every((p) => PREF_SET.has(p));
}
