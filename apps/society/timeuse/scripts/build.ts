/**
 * 生データから配信用 cube を組み立てて public/data/ に書き出す。
 *
 *   npm run data
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadTable, type Table } from "../src/lib/transform/table.ts";
import { Cube, round } from "../src/lib/transform/cube.ts";
import { formatBytes } from "../src/lib/cache.ts";
import {
  ACTIVITIES,
  ACTIVITY_CODES,
  activityCodeFromName,
  ageCodeFromName,
  dayFromName,
  prefCodeFromArea,
  sexFromName,
  shortAgeLabel,
  type DayType,
  type Sex,
} from "../src/lib/data/labels.ts";
import type { DictEntry } from "../src/app/data/cube.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

const YEARS_GEO = ["1996", "2001", "2006", "2011", "2016", "2021"] as const;
const YEARS_AGE = ["2016", "2021"] as const;
const SEXES: Sex[] = ["total", "male", "female"];
const DAYS: DayType[] = ["week", "weekday", "saturday", "sunday"];

/** 並びは全国→都道府県。Object.keys は "10" 等を整数キー扱いするので使わない。 */
const AREA_ENTRIES: { code: string; label: string }[] = [
  { code: "00", label: "全国" },
  { code: "01", label: "北海道" },
  { code: "02", label: "青森" },
  { code: "03", label: "岩手" },
  { code: "04", label: "宮城" },
  { code: "05", label: "秋田" },
  { code: "06", label: "山形" },
  { code: "07", label: "福島" },
  { code: "08", label: "茨城" },
  { code: "09", label: "栃木" },
  { code: "10", label: "群馬" },
  { code: "11", label: "埼玉" },
  { code: "12", label: "千葉" },
  { code: "13", label: "東京" },
  { code: "14", label: "神奈川" },
  { code: "15", label: "新潟" },
  { code: "16", label: "富山" },
  { code: "17", label: "石川" },
  { code: "18", label: "福井" },
  { code: "19", label: "山梨" },
  { code: "20", label: "長野" },
  { code: "21", label: "岐阜" },
  { code: "22", label: "静岡" },
  { code: "23", label: "愛知" },
  { code: "24", label: "三重" },
  { code: "25", label: "滋賀" },
  { code: "26", label: "京都" },
  { code: "27", label: "大阪" },
  { code: "28", label: "兵庫" },
  { code: "29", label: "奈良" },
  { code: "30", label: "和歌山" },
  { code: "31", label: "鳥取" },
  { code: "32", label: "島根" },
  { code: "33", label: "岡山" },
  { code: "34", label: "広島" },
  { code: "35", label: "山口" },
  { code: "36", label: "徳島" },
  { code: "37", label: "香川" },
  { code: "38", label: "愛媛" },
  { code: "39", label: "高知" },
  { code: "40", label: "福岡" },
  { code: "41", label: "佐賀" },
  { code: "42", label: "長崎" },
  { code: "43", label: "熊本" },
  { code: "44", label: "大分" },
  { code: "45", label: "宮崎" },
  { code: "46", label: "鹿児島" },
  { code: "47", label: "沖縄" },
];

const AREA_CODES = AREA_ENTRIES.map((e) => e.code);
const PREF_LABELS = Object.fromEntries(AREA_ENTRIES.map((e) => [e.code, e.label]));

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function activityDict(): DictEntry[] {
  return ACTIVITIES.map((a) => ({
    code: a.code,
    label: a.label,
    level: 1,
    parent: a.group,
  }));
}

function areaDict(): DictEntry[] {
  return AREA_CODES.map((code) => ({
    code,
    label: PREF_LABELS[code]!,
    level: code === "00" ? 0 : 1,
  }));
}

/** 軸名の候補から最初に見つかったものを返す。 */
function axisName(t: Table, candidates: string[]): string {
  for (const c of candidates) {
    try {
      t.axis(c);
      return c;
    } catch {
      // try next
    }
  }
  const names = [...t.axes.values()].map((a) => a.name).join(", ");
  throw new Error(`${t.key}: 軸が見つからない ${candidates.join("|")} / 候補: ${names}`);
}

type GeoRow = {
  activity: string;
  sex: Sex;
  day: DayType;
  area: string;
  minutes: number | null;
};

/**
 * 年次ごとにスキーマが違う地域表を、正規化された行に落とす。
 */
function extractGeoRows(t: Table, year: string): GeoRow[] {
  const rows: GeoRow[] = [];

  if (year === "2011") {
    // cat03 に「総平均時間（睡眠）」などが並ぶ。area 軸あり。
    const dayAxis = t.axis("曜日");
    const sexAxis = t.axis("性別");
    const actAxis = t.axis("行動");
    const areaAxis = t.axis("地域");
    const timeAxis = t.axis("時間軸");
    const timeCode = timeAxis.items[0]!["@code"];

    for (const dayItem of dayAxis.items) {
      const day = dayFromName(dayItem["@name"]);
      if (!day) continue;
      for (const sexItem of sexAxis.items) {
        const sex = sexFromName(sexItem["@name"]);
        if (!sex) continue;
        for (const areaItem of areaAxis.items) {
          const area = prefCodeFromArea(areaItem["@code"], areaItem["@name"]);
          if (!area) continue;
          for (const actItem of actAxis.items) {
            const name = actItem["@name"];
            if (!name.includes("総平均時間")) continue;
            if (name.includes("１次") || name.includes("２次") || name.includes("３次")) continue;
            const activity = activityCodeFromName(name);
            if (!activity) continue;
            const minutes = t.get({
              曜日: dayItem["@code"],
              性別: sexItem["@code"],
              行動: actItem["@code"],
              地域: areaItem["@code"],
              時間軸: timeCode,
            });
            rows.push({ activity, sex, day, area, minutes });
          }
        }
      }
    }
    return rows;
  }

  // 共通: 曜日・男女・行動・地域・時間（＋任意で表章・人口集中）
  const dayKey = axisName(t, ["曜日", "曜日（４A）", "曜日（４Ａ）", "曜日（４）"]);
  const sexKey = axisName(t, ["男女", "男女の別", "男女３"]);
  const actKey = axisName(t, ["行動の種類", "行動の種類２３", "１０上行動総時"]);
  const areaKey = axisName(t, ["地域区分", "地域", "全県地域圏階級", "全県１４７都市", "地域区分48"]);
  const timeKey = axisName(t, ["時間軸", "時間軸(年次)"]);

  let tabKey: string | null = null;
  let tabCode: string | null = null;
  try {
    const tab = t.axis("表章項目");
    tabKey = "表章項目";
    const hit = tab.items.find((i) => i["@name"].includes("総平均時間"));
    tabCode = hit?.["@code"] ?? tab.items[0]!["@code"];
  } catch {
    // 表章なし（2001/1996 等）
  }

  let densKey: string | null = null;
  let densCode: string | null = null;
  try {
    const dens = t.axis("人口集中");
    densKey = dens.name;
    const total = dens.items.find((i) => i["@name"].includes("総数"));
    densCode = total?.["@code"] ?? dens.items[0]!["@code"];
  } catch {
    // なし
  }

  const timeCode = t.axis(timeKey).items[0]!["@code"];

  for (const dayItem of t.axis(dayKey).items) {
    const day = dayFromName(dayItem["@name"]);
    if (!day) continue;
    for (const sexItem of t.axis(sexKey).items) {
      const sex = sexFromName(sexItem["@name"]);
      if (!sex) continue;
      for (const areaItem of t.axis(areaKey).items) {
        const area = prefCodeFromArea(areaItem["@code"], areaItem["@name"]);
        if (!area) continue;
        for (const actItem of t.axis(actKey).items) {
          const activity = activityCodeFromName(actItem["@name"]);
          if (!activity) continue;
          const selector: Record<string, string> = {
            [dayKey]: dayItem["@code"],
            [sexKey]: sexItem["@code"],
            [actKey]: actItem["@code"],
            [areaKey]: areaItem["@code"],
            [timeKey]: timeCode,
          };
          if (tabKey && tabCode) selector[tabKey] = tabCode;
          if (densKey && densCode) selector[densKey] = densCode;
          const minutes = t.get(selector);
          rows.push({ activity, sex, day, area, minutes });
        }
      }
    }
  }
  return rows;
}

type AgeRow = {
  activity: string;
  age: string;
  sex: Sex;
  day: DayType;
  minutes: number | null;
};

function extractAgeRows(t: Table): { rows: AgeRow[]; ages: DictEntry[] } {
  const dayKey = axisName(t, ["曜日"]);
  const sexKey = axisName(t, ["男女"]);
  const ageKey = axisName(t, ["年齢"]);
  const actKey = axisName(t, ["行動の種類"]);
  const timeKey = axisName(t, ["時間軸", "時間軸(年次)"]);
  const tab = t.axis("表章項目");
  const tabCode =
    tab.items.find((i) => i["@name"].includes("総平均時間"))?.["@code"] ?? tab.items[0]!["@code"];
  const timeCode = t.axis(timeKey).items[0]!["@code"];

  const ageEntries: DictEntry[] = [];
  for (const item of t.axis(ageKey).items) {
    const code = ageCodeFromName(item["@name"]);
    if (!code) continue;
    ageEntries.push({ code, label: shortAgeLabel(code), level: 1 });
  }

  const rows: AgeRow[] = [];
  for (const dayItem of t.axis(dayKey).items) {
    const day = dayFromName(dayItem["@name"]);
    if (!day) continue;
    for (const sexItem of t.axis(sexKey).items) {
      const sex = sexFromName(sexItem["@name"]);
      if (!sex) continue;
      for (const ageItem of t.axis(ageKey).items) {
        const age = ageCodeFromName(ageItem["@name"]);
        if (!age) continue;
        for (const actItem of t.axis(actKey).items) {
          const activity = activityCodeFromName(actItem["@name"]);
          if (!activity) continue;
          const minutes = t.get({
            [dayKey]: dayItem["@code"],
            [sexKey]: sexItem["@code"],
            [ageKey]: ageItem["@code"],
            [actKey]: actItem["@code"],
            [timeKey]: timeCode,
            表章項目: tabCode,
          });
          rows.push({ activity, age, sex, day, minutes });
        }
      }
    }
  }
  return { rows, ages: ageEntries };
}

async function buildEraAndGeo(): Promise<void> {
  const era = new Cube(
    [
      { name: "activity", codes: [...ACTIVITY_CODES] },
      { name: "sex", codes: [...SEXES] },
      { name: "day", codes: [...DAYS] },
      { name: "year", codes: [...YEARS_GEO] },
    ],
    ["minutes"],
  );

  const geo = new Cube(
    [
      { name: "activity", codes: [...ACTIVITY_CODES] },
      { name: "sex", codes: [...SEXES] },
      { name: "day", codes: [...DAYS] },
      { name: "year", codes: [...YEARS_GEO] },
      { name: "area", codes: [...AREA_CODES] },
    ],
    ["minutes", "relative"],
  );

  for (const year of YEARS_GEO) {
    const t = await loadTable(`geo-${year}`);
    const rows = extractGeoRows(t, year);
    console.log(`  geo-${year}: ${rows.length.toLocaleString()} rows`);
    for (const r of rows) {
      const m = round(r.minutes, 1);
      if (r.area === "00") {
        era.set("minutes", [r.activity, r.sex, r.day, year], m);
      }
      geo.set("minutes", [r.activity, r.sex, r.day, year, r.area], m);
    }
  }

  // relative = 県 / 全国
  const geoJson = geo.toJSON();
  const minutes = geoJson.measures["minutes"]!;
  const dims = geoJson.dims;
  const stride = {
    activity: dims.slice(1).reduce((n, d) => n * d.codes.length, 1),
    sex: dims.slice(2).reduce((n, d) => n * d.codes.length, 1),
    day: dims.slice(3).reduce((n, d) => n * d.codes.length, 1),
    year: dims.slice(4).reduce((n, d) => n * d.codes.length, 1),
    area: 1,
  };
  const area00 = dims[4]!.codes.indexOf("00");

  for (let ai = 0; ai < ACTIVITY_CODES.length; ai++) {
    for (let si = 0; si < SEXES.length; si++) {
      for (let di = 0; di < DAYS.length; di++) {
        for (let yi = 0; yi < YEARS_GEO.length; yi++) {
          const nat =
            minutes[
              ai * stride.activity +
                si * stride.sex +
                di * stride.day +
                yi * stride.year +
                area00 * stride.area
            ] ?? null;
          for (let ari = 0; ari < AREA_CODES.length; ari++) {
            const offset =
              ai * stride.activity +
              si * stride.sex +
              di * stride.day +
              yi * stride.year +
              ari * stride.area;
            const v = minutes[offset] ?? null;
            const rel =
              nat !== null && nat !== 0 && v !== null ? round(v / nat, 4) : null;
            geo.set(
              "relative",
              [ACTIVITY_CODES[ai]!, SEXES[si]!, DAYS[di]!, YEARS_GEO[yi]!, AREA_CODES[ari]!],
              rel,
            );
          }
        }
      }
    }
  }

  await writeJson("era", {
    ...era.toJSON(),
    activities: activityDict(),
  });
  await writeJson("geo", {
    ...geo.toJSON(),
    activities: activityDict(),
    areas: areaDict(),
  });

  console.log(`  era filled ${era.filled("minutes").toLocaleString()}`);
  console.log(`  geo filled ${geo.filled("minutes").toLocaleString()}`);
}

async function buildAge(): Promise<void> {
  // ages は最初の年の辞書で固定（両年とも同じ階級想定）
  const first = await loadTable("age-2016");
  const { ages: ageEntries } = extractAgeRows(first);
  const ageCodes = ageEntries.map((a) => a.code);

  const cube = new Cube(
    [
      { name: "activity", codes: [...ACTIVITY_CODES] },
      { name: "age", codes: ageCodes },
      { name: "sex", codes: [...SEXES] },
      { name: "day", codes: [...DAYS] },
      { name: "year", codes: [...YEARS_AGE] },
    ],
    ["minutes"],
  );

  for (const year of YEARS_AGE) {
    const t = await loadTable(`age-${year}`);
    const { rows } = extractAgeRows(t);
    console.log(`  age-${year}: ${rows.length.toLocaleString()} rows`);
    for (const r of rows) {
      if (!ageCodes.includes(r.age)) continue;
      cube.set("minutes", [r.activity, r.age, r.sex, r.day, year], round(r.minutes, 1));
    }
  }

  await writeJson("age", {
    ...cube.toJSON(),
    activities: activityDict(),
    ages: ageEntries,
  });
  console.log(`  age filled ${cube.filled("minutes").toLocaleString()}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("build era + geo");
  await buildEraAndGeo();
  console.log("build age");
  await buildAge();
  console.log("done");
}

await main();
