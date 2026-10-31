/**
 * 生活時間の正規ラベル・グループ。年次ごとの表記ゆれは ACTIVITY_ALIASES で吸収する。
 */

export type Sex = "total" | "male" | "female";
export type DayType = "week" | "weekday" | "saturday" | "sunday";

export type ActivityGroup =
  | "sleep"
  | "work"
  | "care"
  | "necessary"
  | "leisure"
  | "other";

export interface ActivityDef {
  code: string;
  label: string;
  group: ActivityGroup;
}

export const ACTIVITIES: readonly ActivityDef[] = [
  { code: "01", label: "睡眠", group: "sleep" },
  { code: "02", label: "身の回りの用事", group: "necessary" },
  { code: "03", label: "食事", group: "necessary" },
  { code: "04", label: "通勤・通学", group: "work" },
  { code: "05", label: "仕事", group: "work" },
  { code: "06", label: "学業", group: "other" },
  { code: "07", label: "家事", group: "care" },
  { code: "08", label: "介護・看護", group: "care" },
  { code: "09", label: "育児", group: "care" },
  { code: "10", label: "買い物", group: "care" },
  { code: "11", label: "移動（通勤・通学を除く）", group: "other" },
  { code: "12", label: "テレビ・ラジオ・新聞・雑誌", group: "leisure" },
  { code: "13", label: "休養・くつろぎ", group: "leisure" },
  { code: "14", label: "学習・自己啓発・訓練", group: "leisure" },
  { code: "15", label: "趣味・娯楽", group: "leisure" },
  { code: "16", label: "スポーツ", group: "leisure" },
  { code: "17", label: "ボランティア・社会参加", group: "leisure" },
  { code: "18", label: "交際・付き合い", group: "leisure" },
  { code: "19", label: "受診・療養", group: "necessary" },
  { code: "20", label: "その他", group: "other" },
] as const;

export const ACTIVITY_CODES = ACTIVITIES.map((a) => a.code);

export const GROUP_LABELS: Record<ActivityGroup, string> = {
  sleep: "睡眠",
  work: "仕事・通勤",
  care: "家事・ケア",
  necessary: "食事・身支度など",
  leisure: "余暇",
  other: "その他",
};

export const GROUP_ORDER: readonly ActivityGroup[] = [
  "sleep",
  "necessary",
  "work",
  "care",
  "leisure",
  "other",
];

/** 構成チャート用の色（paper 上で区別できる無彩色寄り）。 */
export const GROUP_COLORS: Record<ActivityGroup, string> = {
  sleep: "#5c6b7a",
  necessary: "#8a7e6d",
  work: "#b0392a",
  care: "#c47a3a",
  leisure: "#3d7a6a",
  other: "#a8a299",
};

/**
 * e-Stat の行動名 → 正規コード。
 * 括弧・空白・旧称のゆれをここで潰す。
 */
const ACTIVITY_ALIASES: Record<string, string> = {
  睡眠: "01",
  身の回りの用事: "02",
  食事: "03",
  "通勤・通学": "04",
  仕事: "05",
  学業: "06",
  家事: "07",
  "介護・看護": "08",
  育児: "09",
  買い物: "10",
  "移動（通勤・通学を除く）": "11",
  "移動(通勤・通学を除く)": "11",
  "テレビ・ラジオ・新聞・雑誌": "12",
  "テレビ・ラジオ　・新聞・雑誌": "12",
  "休養・くつろぎ": "13",
  "学習・自己啓発・訓練(学業以外)": "14",
  "学習・自己啓発・訓練（学業以外）": "14",
  "学習・研究（学業以外）": "14",
  "学習・研究　（学業以外）": "14",
  "趣味・娯楽": "15",
  スポーツ: "16",
  "ボランティア活動・社会参加活動": "17",
  社会的活動: "17",
  "交際・付き合い": "18",
  "受診・療養": "19",
  "受診・診療": "19",
  その他: "20",
};

/** 名前から番号接頭辞や全角スペースを落として正規化する。 */
export function normalizeActivityName(raw: string): string {
  let s = raw.trim();
  // 総平均時間（睡眠）形式 → 睡眠
  const avg = s.match(/^総平均時間[（(](.+)[）)]$/);
  if (avg) s = avg[1]!;
  s = s
    .replace(/^[0-9０-９]{1,2}[_＿]?\s*/, "")
    .replace(/\s+/g, "")
    .replace(/　/g, "")
    .trim();
  return s;
}

export function activityCodeFromName(raw: string): string | null {
  const cleaned = normalizeActivityName(raw);
  if (ACTIVITY_ALIASES[cleaned] !== undefined) return ACTIVITY_ALIASES[cleaned]!;
  // 括弧の半角/全角を揃えて再試行
  const alt = cleaned.replace(/（/g, "(").replace(/）/g, ")");
  if (ACTIVITY_ALIASES[alt] !== undefined) return ACTIVITY_ALIASES[alt]!;
  // 直接 01_睡眠 形式
  const m = raw.match(/^([0-9]{2})[_＿]/);
  if (m && ACTIVITY_CODES.includes(m[1]!)) return m[1]!;
  return null;
}

export function sexFromName(raw: string): Sex | null {
  const n = raw.replace(/^[0-9]_/, "").trim();
  if (n === "総数" || n === "男女計") return "total";
  if (n === "男") return "male";
  if (n === "女") return "female";
  return null;
}

export function dayFromName(raw: string): DayType | null {
  const n = raw.replace(/^[0-9]_/, "").trim();
  if (n === "週全体") return "week";
  if (n === "平日") return "weekday";
  if (n === "土曜日" || n === "土曜") return "saturday";
  if (n === "日曜日" || n === "日曜") return "sunday";
  return null;
}

/** 都道府県コードを 2桁に正規化（全国=00）。 */
export function prefCodeFromArea(code: string, name: string): string | null {
  const bare = name.replace(/^[0-9]+_/, "").trim();
  if (
    bare === "全国" ||
    code === "00000" ||
    code === "00" ||
    code === "0"
  ) {
    return "00";
  }
  const m = code.match(/^(\d{2})/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 47) return null;
  // 都道府県名らしいものだけ（「14地域」等を除外）
  if (
    bare.includes("地域") ||
    bare.includes("都市") ||
    bare.includes("圏") ||
    bare.includes("再掲")
  ) {
    return null;
  }
  return m[1]!.padStart(2, "0");
}

export function ageCodeFromName(raw: string): string | null {
  const n = raw.replace(/^[0-9]{2}_/, "").trim();
  if (n === "総数") return null;
  // 10～14歳 → 10-14
  const range = n.match(/^(\d+)[～〜\-](\d+)歳?$/);
  if (range) return `${range[1]}-${range[2]}`;
  const plus = n.match(/^(\d+)歳以上$/);
  if (plus) return `${plus[1]}+`;
  return null;
}

export function shortAgeLabel(code: string): string {
  return code.replace(/-/g, "–");
}
