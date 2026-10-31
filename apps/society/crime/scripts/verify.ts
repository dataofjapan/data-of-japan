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

interface TypeFile extends CubeJson {
  codes: DictEntry[];
}

interface GeoFile extends CubeJson {
  metrics: DictEntry[];
  areas: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const typeRaw = JSON.parse(await readFile(resolve(DATA, "type.json"), "utf8")) as TypeFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const type = new CubeView(typeRaw);
const geo = new CubeView(geoRaw);

const cognized2002 = era.at("cases", { metric: "cognized", year: "2002" });
ok(
  "era 2002 刑法犯認知≈2,853,739",
  cognized2002 !== null && near(cognized2002, 2_853_739, 1),
  String(cognized2002),
);

const cognized1975 = era.at("cases", { metric: "cognized", year: "1975" });
ok(
  "era 1975 刑法犯認知≈1,234,307",
  cognized1975 !== null && near(cognized1975, 1_234_307, 1),
  String(cognized1975),
);

const clearance2002 = era.at("rate", { metric: "clearance", year: "2002" });
ok(
  "era 2002 検挙率≈20.8%",
  clearance2002 !== null && near(clearance2002, 0.208, 0.002),
  String(clearance2002),
);

ok(
  "era 認知が 1975→2002 で増加",
  cognized1975 !== null && cognized2002 !== null && cognized2002 > cognized1975,
  `${cognized1975} → ${cognized2002}`,
);

const cognized2023 = era.at("cases", { metric: "cognized", year: "2023" });
ok(
  "era 認知が 2002→2023 で減少",
  cognized2002 !== null && cognized2023 !== null && cognized2023 < cognized2002,
  `${cognized2002} → ${cognized2023}`,
);

const typeShareSum = ["heinous", "violent", "theft", "intellectual", "moral", "other"].reduce(
  (n, code) => n + (type.at("share", { code, year: "2002" }) ?? 0),
  0,
);
ok("type 2002 share 合計≈1", near(typeShareSum, 1, 0.02), String(typeShareSum));

const theftShare = type.at("share", { code: "theft", year: "2002" });
ok(
  "type 2002 窃盗が最大構成",
  theftShare !== null && theftShare > 0.5,
  String(theftShare),
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyoRate = geo.at("value", { metric: "cognized_rate", year: "2023", area: "13000" });
const nationalRate = geo.at("value", { metric: "cognized_rate", year: "2023", area: "00000" });
ok(
  "geo 東京の人口当たり認知が全国と異なる",
  tokyoRate !== null && nationalRate !== null && tokyoRate !== nationalRate,
  `東京 ${tokyoRate} / 全国 ${nationalRate}`,
);

const relNat = geo.at("relative", { metric: "cognized_rate", year: "2023", area: "00000" });
ok("geo 全国 relative=1", relNat === 1, String(relNat));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
