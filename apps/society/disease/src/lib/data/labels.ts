/**
 * 傷病・入院外来・年齢などの正規化ヘルパ。
 * 表示ラベルはメタの名称からビルド時に生成する（ここにはコード体系の定数のみ）。
 */

/** 入院–外来（時代・人数表）。 */
export const SETTINGS = [
  { code: "total", label: "総数" },
  { code: "inpatient", label: "入院" },
  { code: "outpatient", label: "外来" },
] as const;

/** 地域表の施設軸（総数がないため入院・外来のみ）。 */
export const GEO_SETTINGS = [
  { code: "inpatient", label: "入院", rawName: "入院（総数）" },
  { code: "outpatient", label: "外来", rawName: "外来（総数）" },
] as const;

export const SEXES = [
  { code: "total", label: "総数" },
  { code: "male", label: "男" },
  { code: "female", label: "女" },
] as const;

/** 和暦年次名 → 西暦。 */
const ERA_YEAR_MAP: Record<string, string> = {
  平成8年: "1996",
  平成11年: "1999",
  平成14年: "2002",
  平成17年: "2005",
  平成20年: "2008",
  平成23年: "2011",
  平成26年: "2014",
  平成29年: "2017",
  令和2年: "2020",
  令和5年: "2023",
};

export function yearFromLabel(name: string): string | null {
  return ERA_YEAR_MAP[name] ?? null;
}

/** 都道府県メタコード（1=全国…48=沖縄）→ 5桁コード。 */
export function prefCodeFromIndex(index1based: number): string {
  if (index1based === 1) return "00000";
  const pref = index1based - 1; // 2→1=北海道 … 48→47=沖縄
  return String(pref).padStart(2, "0") + "000";
}

export function padDiseaseCode(code: string): string {
  if (/^\d+$/.test(code)) return code.padStart(2, "0");
  return code;
}

/** 再掲・補助項目か。章（大分類）以外はリストの折りたたみ用。 */
export function isSubDisease(name: string): boolean {
  return name.includes("再掲") || name.includes("（再掲）") || /^\s|　/.test(name);
}

export function cleanDiseaseLabel(name: string): string {
  let n = name;
  n = n.replace(/^[０-９0-9]+　/, "");
  n = n.replace(/＜腫瘍＞/g, "");
  n = n.replace(/（再掲）/g, "").replace(/\(再掲\)/g, "");
  // 「章名(内訳)」→ 内訳
  const m = n.match(/^.+?[（(](.+)[）)]$/);
  if (m && (name.includes("再掲") || name.includes("("))) {
    n = m[1]!;
  }
  n = n.replace(/^[　\s]+/, "").replace(/[　\s]+$/, "");
  n = n.replace(/^（/, "").replace(/）$/, "");
  return n || name;
}
