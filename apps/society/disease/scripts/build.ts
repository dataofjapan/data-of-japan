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
import type { DictEntry } from "../src/app/data/cube.ts";
import {
  GEO_SETTINGS,
  SETTINGS,
  SEXES,
  cleanDiseaseLabel,
  isSubDisease,
  padDiseaseCode,
  prefCodeFromIndex,
  yearFromLabel,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function diseaseDict(table: Table, axisFrag: string): DictEntry[] {
  return table.axis(axisFrag).items.map((it) => {
    const code = padDiseaseCode(it["@code"]);
    const raw = it["@name"];
    const sub = isSubDisease(raw);
    return {
      code,
      label: cleanDiseaseLabel(raw),
      level: sub ? 2 : 1,
      parent: sub ? "sub" : "chapter",
    };
  });
}

function sexCodeFromName(name: string): string | null {
  if (name === "総数") return "total";
  if (name === "男") return "male";
  if (name === "女") return "female";
  return null;
}

async function buildEra(rates: Table, counts: Table) {
  const diseases = diseaseDict(rates, "傷病");
  const diseaseCodes = diseases.map((d) => d.code);
  const settingCodes = SETTINGS.map((s) => s.code);

  const years: string[] = [];
  const yearAxis = rates.axis("年次");
  for (const it of yearAxis.items) {
    const y = yearFromLabel(it["@name"]);
    if (y) years.push(y);
  }

  const cube = new Cube(
    [
      { name: "setting", codes: settingCodes },
      { name: "disease", codes: diseaseCodes },
      { name: "year", codes: years },
    ],
    ["rate", "patients"],
  );

  const tabRate = rates.axis("表章").items[0]!["@code"];
  const tabCount = counts.axis("表章").items[0]!["@code"];

  // 率表は 01/02/03、人数表は 1/2/3。コードではなく名称で揃える。
  const rateSettingByName = new Map(
    rates.axis("入院").items.map((it) => [it["@name"], it["@code"]]),
  );
  const countSettingByName = new Map(
    counts.axis("入院").items.map((it) => [it["@name"], it["@code"]]),
  );
  const countYearByName = new Map(
    counts.axis("年次").items.map((it) => [it["@name"], it["@code"]]),
  );

  for (const settingDef of SETTINGS) {
    const rateSetting = rateSettingByName.get(settingDef.label);
    const countSetting = countSettingByName.get(settingDef.label);
    if (!rateSetting || !countSetting) {
      throw new Error(`入院–外来「${settingDef.label}」のコードが見つからない`);
    }
    for (const dit of rates.axis("傷病").items) {
      const disease = padDiseaseCode(dit["@code"]);
      for (const yit of yearAxis.items) {
        const year = yearFromLabel(yit["@name"]);
        if (!year) continue;
        const countYear = countYearByName.get(yit["@name"]);
        if (!countYear) continue;
        const rate = rates.get({
          表章: tabRate,
          傷病: dit["@code"],
          入院: rateSetting,
          年次: yit["@code"],
        });
        const patients = counts.get({
          表章: tabCount,
          傷病: dit["@code"],
          入院: countSetting,
          年次: countYear,
        });
        cube.set("rate", [settingDef.code, disease, year], rate === null ? null : round(rate, 1));
        // 推計患者数は千人単位（メタ @unit）。配信は千人のまま。
        cube.set(
          "patients",
          [settingDef.code, disease, year],
          patients === null ? null : round(patients, 1),
        );
      }
    }
  }

  await writeJson("era", {
    ...cube.toJSON(),
    diseases,
    settings: SETTINGS.map((s) => ({ code: s.code, label: s.label, level: 1 })),
  });
}

async function buildDisease(t: Table) {
  const diseases = diseaseDict(t, "傷病");
  const diseaseCodes = diseases.map((d) => d.code);
  const sexCodes = SEXES.map((s) => s.code);

  const ageItems = t.axis("年齢").items.filter((it) => {
    const n = it["@name"];
    if (n === "総数") return false;
    if (n.includes("再掲")) return false;
    return Number(it["@level"]) === 2;
  });
  const ages: DictEntry[] = ageItems.map((it) => ({
    code: it["@code"],
    label: it["@name"].replace(/歳$/, "歳"),
    level: 1,
  }));
  const ageCodes = ages.map((a) => a.code);

  const facilityTotal = t.codeOf("病院", "総数");
  const tab = t.axis("表章").items[0]!["@code"];

  const cube = new Cube(
    [
      { name: "sex", codes: sexCodes },
      { name: "disease", codes: diseaseCodes },
      { name: "age", codes: ageCodes },
    ],
    ["patients"],
  );

  for (const sit of t.axis("性別").items) {
    const sex = sexCodeFromName(sit["@name"]);
    if (!sex) continue;
    for (const dit of t.axis("傷病").items) {
      const disease = padDiseaseCode(dit["@code"]);
      for (const ait of ageItems) {
        const patients = t.get({
          表章: tab,
          傷病: dit["@code"],
          病院: facilityTotal,
          年齢: ait["@code"],
          性別: sit["@code"],
        });
        cube.set(
          "patients",
          [sex, disease, ait["@code"]],
          patients === null ? null : round(patients, 1),
        );
      }
    }
  }

  await writeJson("disease", {
    ...cube.toJSON(),
    diseases,
    ages,
    sexes: SEXES.map((s) => ({ code: s.code, label: s.label, level: 1 })),
    surveyYear: "2023",
  });
}

async function buildGeo(t: Table) {
  const diseases = diseaseDict(t, "傷病");
  const diseaseCodes = diseases.map((d) => d.code);
  const settingCodes = GEO_SETTINGS.map((s) => s.code);

  const areas: DictEntry[] = t.axis("都道府県").items.map((it) => {
    const idx = Number(it["@code"]);
    return {
      code: prefCodeFromIndex(idx),
      label: it["@name"] === "全国" ? "全国" : `${it["@name"]}${prefSuffix(it["@name"])}`,
      level: it["@name"] === "全国" ? 1 : 2,
    };
  });
  const areaCodes = areas.map((a) => a.code);

  const tab = t.axis("表章").items[0]!["@code"];
  const facilityBySetting = new Map(
    GEO_SETTINGS.map((s) => [s.code, t.codeOf("施設", s.rawName)]),
  );

  const cube = new Cube(
    [
      { name: "setting", codes: settingCodes },
      { name: "disease", codes: diseaseCodes },
      { name: "area", codes: areaCodes },
    ],
    ["rate", "relative"],
  );

  for (const setting of settingCodes) {
    const fac = facilityBySetting.get(setting)!;
    for (const dit of t.axis("傷病").items) {
      const disease = padDiseaseCode(dit["@code"]);
      const national = t.get({
        表章: tab,
        傷病: dit["@code"],
        都道府県: "1",
        施設: fac,
      });

      for (const ait of t.axis("都道府県").items) {
        const area = prefCodeFromIndex(Number(ait["@code"]));
        const rate = t.get({
          表章: tab,
          傷病: dit["@code"],
          都道府県: ait["@code"],
          施設: fac,
        });
        const relative =
          rate === null || national === null || national === 0
            ? null
            : round(rate / national, 4);
        cube.set("rate", [setting, disease, area], rate === null ? null : round(rate, 1));
        cube.set("relative", [setting, disease, area], relative);
      }
    }
  }

  await writeJson("geo", {
    ...cube.toJSON(),
    diseases,
    areas,
    settings: GEO_SETTINGS.map((s) => ({ code: s.code, label: s.label, level: 1 })),
  });
}

function prefSuffix(shortName: string): string {
  if (shortName === "北海道") return "";
  if (shortName === "東京") return "都";
  if (shortName === "大阪" || shortName === "京都") return "府";
  return "県";
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("build era");
  await buildEra(await loadTable("era-rate-recent"), await loadTable("era-count-recent"));
  console.log("build disease");
  await buildDisease(await loadTable("disease-age"));
  console.log("build geo");
  await buildGeo(await loadTable("geo-rate"));
}

await main();
