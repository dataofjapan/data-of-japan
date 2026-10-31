/**
 * 配信 cube の健全性チェック。
 *
 *   npm run verify
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CubeView, type CubeJson, type DictEntry } from "../src/app/data/cube.ts";

const DATA = resolve(import.meta.dirname, "../public/data");

let failed = 0;

function ok(label: string, cond: boolean, detail = ""): void {
  console.log(`${cond ? "OK" : "NG"}  ${label}${detail ? `: ${detail}` : ""}`);
  if (!cond) failed += 1;
}

function near(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol;
}

interface EraFile extends CubeJson {
  diseases: DictEntry[];
  settings: DictEntry[];
}

interface DiseaseFile extends CubeJson {
  diseases: DictEntry[];
  ages: DictEntry[];
  surveyYear: string;
}

interface GeoFile extends CubeJson {
  diseases: DictEntry[];
  areas: DictEntry[];
  settings: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const diseaseRaw = JSON.parse(
  await readFile(resolve(DATA, "disease.json"), "utf8"),
) as DiseaseFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const disease = new CubeView(diseaseRaw);
const geo = new CubeView(geoRaw);

ok("era 年次が10", era.codes("year").length === 10, String(era.codes("year").length));
ok("era 傷病が60", eraRaw.diseases.length === 60, String(eraRaw.diseases.length));

const rate2023 = era.at("rate", { setting: "total", disease: "01", year: "2023" });
ok(
  "era 2023 総数受療率≈6795",
  rate2023 !== null && near(rate2023, 6795, 1),
  String(rate2023),
);

const patients2023 = era.at("patients", { setting: "total", disease: "01", year: "2023" });
ok(
  "era 2023 総数推計患者数≈8450千人",
  patients2023 !== null && near(patients2023, 8450.3, 1),
  String(patients2023),
);

const inpatient2023 = era.at("rate", { setting: "inpatient", disease: "01", year: "2023" });
const outpatient2023 = era.at("rate", { setting: "outpatient", disease: "01", year: "2023" });
ok(
  "era 入院+外来 ≈ 総数（受療率）",
  inpatient2023 !== null &&
    outpatient2023 !== null &&
    rate2023 !== null &&
    near(inpatient2023 + outpatient2023, rate2023, 2),
  `${inpatient2023}+${outpatient2023}=${(inpatient2023 ?? 0) + (outpatient2023 ?? 0)} vs ${rate2023}`,
);

const rate1996 = era.at("rate", { setting: "total", disease: "01", year: "1996" });
ok(
  "era 1996 総数受療率が存在する",
  rate1996 !== null && rate1996 > 0,
  String(rate1996),
);

ok("disease 調査年が2023", diseaseRaw.surveyYear === "2023", diseaseRaw.surveyYear);
ok("disease 年齢階級が21", diseaseRaw.ages.length === 21, String(diseaseRaw.ages.length));

const age0 = diseaseRaw.ages[0]!;
const diseaseTotal0 = disease.at("patients", {
  sex: "total",
  disease: "01",
  age: age0.code,
});
ok(
  "disease 0歳の総数患者が正",
  diseaseTotal0 !== null && diseaseTotal0 > 0,
  String(diseaseTotal0),
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const natIn = geo.at("rate", { setting: "inpatient", disease: "01", area: "00000" });
ok(
  "geo 全国入院受療率 = era 入院",
  natIn !== null && inpatient2023 !== null && near(natIn, inpatient2023, 1),
  `geo ${natIn} / era ${inpatient2023}`,
);

const relNat = geo.at("relative", { setting: "inpatient", disease: "01", area: "00000" });
ok("geo 全国 relative=1", relNat === 1, String(relNat));

const tokyo = geo.at("rate", { setting: "inpatient", disease: "01", area: "13000" });
ok(
  "geo 東京の入院受療率が全国と異なる",
  tokyo !== null && natIn !== null && tokyo !== natIn,
  `東京 ${tokyo} / 全国 ${natIn}`,
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
