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

interface HarmFile extends CubeJson {
  formDims: DictEntry[];
  codes: DictEntry[];
}

interface GeoFile extends CubeJson {
  metrics: DictEntry[];
  areas: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const harmRaw = JSON.parse(await readFile(resolve(DATA, "harm.json"), "utf8")) as HarmFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const harm = new CubeView(harmRaw);
const geo = new CubeView(geoRaw);

const deaths1970 = era.at("people", { metric: "deaths", year: "1970" });
ok(
  "era 1970 死者数がピーク付近（約1.68万）",
  deaths1970 !== null && near(deaths1970, 16_765, 1),
  String(deaths1970),
);

const accidents2018 = era.at("people", { metric: "accidents", year: "2018" });
ok(
  "era 2018 発生件数=430601（NPA）",
  accidents2018 !== null && near(accidents2018, 430_601, 1),
  String(accidents2018),
);

const accidents2019 = era.at("people", { metric: "accidents", year: "2019" });
ok(
  "era 2019 発生件数=381237（SSDS延長）",
  accidents2019 !== null && near(accidents2019, 381_237, 1),
  String(accidents2019),
);

const deaths2024 = era.at("people", { metric: "deaths", year: "2024" });
ok(
  "era 2024 死者数が取得できている",
  deaths2024 !== null && deaths2024 > 0 && deaths2024 < deaths1970!,
  String(deaths2024),
);

const harmPed2018 = harm.at("people", {
  dim: "state_death",
  code: "pedestrian",
  year: "2018",
});
ok(
  "harm 2018 歩行中死者≈1258",
  harmPed2018 !== null && near(harmPed2018, 1_258, 1),
  String(harmPed2018),
);

const harmShareSum = harmRaw.dims
  .find((d) => d.name === "code")!
  .codes.map((code) =>
    harm.at("share", { dim: "state_death", code, year: "2018" }),
  )
  .filter((v): v is number => v !== null)
  .reduce((a, b) => a + b, 0);
ok(
  "harm 2018 状態・死者の構成比合計≈1",
  near(harmShareSum, 1, 0.02),
  String(harmShareSum),
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyoRate = geo.at("value", { metric: "deaths_rate", year: "2024", area: "13000" });
const natRate = geo.at("value", { metric: "deaths_rate", year: "2024", area: "00000" });
ok(
  "geo 2024 死者人口比が全国・東京で取得できている",
  tokyoRate !== null && natRate !== null && natRate > 0,
  `東京 ${tokyoRate} / 全国 ${natRate}`,
);

const tokyoRel = geo.at("relative", { metric: "deaths_rate", year: "2024", area: "13000" });
ok(
  "geo 相対値が全国基準で計算されている",
  tokyoRel !== null && tokyoRel > 0,
  String(tokyoRel),
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
