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
  metrics: DictEntry[];
}

interface AgeFile extends CubeJson {
  ages: DictEntry[];
}

interface GeoFile extends CubeJson {
  metrics: DictEntry[];
  areas: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const ageRaw = JSON.parse(await readFile(resolve(DATA, "age.json"), "utf8")) as AgeFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const age = new CubeView(ageRaw);
const geo = new CubeView(geoRaw);

const births2024 = era.at("value", { metric: "birth_count", year: "2024" });
ok(
  "era 2024 出生数が妥当",
  births2024 !== null && births2024 > 600_000 && births2024 < 900_000,
  String(births2024),
);

const births1973 = era.at("value", { metric: "birth_count", year: "1973" });
ok(
  "era 第2次ベビーブーム近傍の出生数が2024より多い",
  births1973 !== null && births2024 !== null && births1973 > births2024,
  `${births1973} → ${births2024}`,
);

const tfr2024 = era.at("value", { metric: "tfr", year: "2024" });
ok(
  "era 2024 TFR≈1.1〜1.3",
  tfr2024 !== null && tfr2024 > 1.0 && tfr2024 < 1.4,
  String(tfr2024),
);

const tfr1970 = era.at("value", { metric: "tfr", year: "1970" });
ok(
  "era TFRが長期で低下 (1970→2024)",
  tfr1970 !== null && tfr2024 !== null && tfr2024 < tfr1970,
  `${tfr1970} → ${tfr2024}`,
);

const mother2024 = era.at("value", { metric: "avg_age_mother", year: "2024" });
const mother1970 = era.at("value", { metric: "avg_age_mother", year: "1970" });
ok(
  "era 母の平均年齢が上昇",
  mother2024 !== null &&
    mother1970 !== null &&
    mother2024 > mother1970 &&
    mother2024 > 30 &&
    mother2024 < 35,
  `${mother1970} → ${mother2024}`,
);

const sexRatio = era.at("value", { metric: "sex_ratio", year: "2024" });
ok(
  "era 2024 出生性比が105前後",
  sexRatio !== null && sexRatio > 100 && sexRatio < 110,
  String(sexRatio),
);

ok("age 年齢階級が7", ageRaw.ages.length === 7, String(ageRaw.ages.length));

const count2529 = age.at("count", { age: "25-29", year: "2024" });
const count4044 = age.at("count", { age: "40-44", year: "2024" });
ok(
  "age 2024 25-29歳の出生数が40-44歳より多い",
  count2529 !== null && count4044 !== null && count2529 > count4044,
  `25-29 ${count2529} / 40-44 ${count4044}`,
);

const rate2529 = age.at("rate", { age: "25-29", year: "2024" });
ok(
  "age 2024 25-29歳出生率が正",
  rate2529 !== null && rate2529 > 0,
  String(rate2529),
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyoRate = geo.at("value", { metric: "birth_rate", year: "2024", area: "13000" });
const nationalRate = geo.at("value", { metric: "birth_rate", year: "2024", area: "00000" });
ok(
  "geo 東京の出生率が全国と異なる",
  tokyoRate !== null && nationalRate !== null && tokyoRate !== nationalRate,
  `東京 ${tokyoRate} / 全国 ${nationalRate}`,
);

const okinawaTfr = geo.at("value", { metric: "tfr", year: "2024", area: "47000" });
const nationalTfr = geo.at("value", { metric: "tfr", year: "2024", area: "00000" });
ok(
  "geo 沖縄のTFRが全国より高い傾向",
  okinawaTfr !== null && nationalTfr !== null && okinawaTfr > nationalTfr,
  `沖縄 ${okinawaTfr} / 全国 ${nationalTfr}`,
);

const relNat = geo.at("relative", { metric: "birth_rate", year: "2024", area: "00000" });
ok(
  "geo 全国 relative=1",
  relNat === 1 || (relNat !== null && near(relNat, 1, 0.001)),
  String(relNat),
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
