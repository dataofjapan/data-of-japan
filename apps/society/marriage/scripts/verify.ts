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
  sexes: DictEntry[];
  types: DictEntry[];
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

const marriage2024 = era.at("value", { metric: "marriage_count", year: "2024" });
ok(
  "era 2024 婚姻件数が妥当",
  marriage2024 !== null && marriage2024 > 400_000 && marriage2024 < 600_000,
  String(marriage2024),
);

const divorce2024 = era.at("value", { metric: "divorce_count", year: "2024" });
ok(
  "era 2024 離婚件数が妥当",
  divorce2024 !== null && divorce2024 > 100_000 && divorce2024 < 300_000,
  String(divorce2024),
);

const marriageRate2024 = era.at("value", { metric: "marriage_rate", year: "2024" });
ok(
  "era 2024 婚姻率≈3〜5‰",
  marriageRate2024 !== null && marriageRate2024 > 2 && marriageRate2024 < 6,
  String(marriageRate2024),
);

const marriageRate1970 = era.at("value", { metric: "marriage_rate", year: "1970" });
ok(
  "era 婚姻率が長期で低下 (1970→2024)",
  marriageRate1970 !== null &&
    marriageRate2024 !== null &&
    marriageRate2024 < marriageRate1970,
  `${marriageRate1970} → ${marriageRate2024}`,
);

const wifeAge2024 = era.at("value", { metric: "avg_age_first_wife", year: "2024" });
const wifeAge1970 = era.at("value", { metric: "avg_age_first_wife", year: "1970" });
ok(
  "era 妻の平均初婚年齢が上昇",
  wifeAge2024 !== null &&
    wifeAge1970 !== null &&
    wifeAge2024 > wifeAge1970 &&
    wifeAge2024 > 28 &&
    wifeAge2024 < 32,
  `${wifeAge1970} → ${wifeAge2024}`,
);

const remShare = era.at("value", { metric: "remarriage_share_husband", year: "2024" });
ok(
  "era 2024 夫の再婚割合が 0〜1",
  remShare !== null && remShare > 0.1 && remShare < 0.5,
  String(remShare),
);

const avgCohabit = era.at("value", { metric: "avg_cohabit", year: "2024" });
ok(
  "era 2024 平均同居期間が妥当",
  avgCohabit !== null && avgCohabit > 5 && avgCohabit < 20,
  String(avgCohabit),
);

ok("age 年齢階級が14", ageRaw.ages.length === 14, String(ageRaw.ages.length));

const first2529 = age.at("count", {
  age: "00240",
  sex: "wife",
  type: "first",
  year: "2024",
});
const rem2529 = age.at("count", {
  age: "00240",
  sex: "wife",
  type: "remarriage",
  year: "2024",
});
ok(
  "age 2024 妻25-29歳は初婚>再婚",
  first2529 !== null && rem2529 !== null && first2529 > rem2529,
  `初婚 ${first2529} / 再婚 ${rem2529}`,
);

const rateYoung = age.at("rate", {
  age: "00240",
  sex: "wife",
  type: "first",
  year: "2024",
});
ok(
  "age 2024 妻25-29歳初婚率が正",
  rateYoung !== null && rateYoung > 0,
  String(rateYoung),
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyoRate = geo.at("value", { metric: "marriage_rate", year: "2024", area: "13000" });
const nationalRate = geo.at("value", { metric: "marriage_rate", year: "2024", area: "00000" });
ok(
  "geo 東京の婚姻率が全国と異なる",
  tokyoRate !== null && nationalRate !== null && tokyoRate !== nationalRate,
  `東京 ${tokyoRate} / 全国 ${nationalRate}`,
);

const relNat = geo.at("relative", { metric: "marriage_rate", year: "2024", area: "00000" });
ok("geo 全国 relative=1", relNat === 1 || (relNat !== null && near(relNat, 1, 0.001)), String(relNat));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
