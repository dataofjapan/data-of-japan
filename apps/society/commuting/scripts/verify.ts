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

interface ModeFile extends CubeJson {
  codes: DictEntry[];
}

interface GeoFile extends CubeJson {
  metrics: DictEntry[];
  areas: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const modeRaw = JSON.parse(await readFile(resolve(DATA, "mode.json"), "utf8")) as ModeFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const mode = new CubeView(modeRaw);
const geo = new CubeView(geoRaw);

const total2020 = era.at("people", { metric: "total", year: "2020" });
ok(
  "era 2020 総数が妥当",
  total2020 !== null && total2020 > 50_000_000 && total2020 < 65_000_000,
  String(total2020),
);

const carShare2020 = era.at("share", { metric: "car", year: "2020" });
ok(
  "era 2020 自家用車シェアが最大級",
  carShare2020 !== null && carShare2020 > 0.35 && carShare2020 < 0.55,
  String(carShare2020),
);

const railShare2020 = era.at("share", { metric: "rail", year: "2020" });
ok(
  "era 2020 鉄道シェアが妥当",
  railShare2020 !== null && railShare2020 > 0.1 && railShare2020 < 0.25,
  String(railShare2020),
);

const car1990 = era.at("share", { metric: "car", year: "1990" });
const car2010 = era.at("share", { metric: "car", year: "2010" });
ok(
  "era 自家用車シェアに値がある (1990/2010)",
  car1990 !== null && car2010 !== null,
  `${car1990} / ${car2010}`,
);

const modeCar2020 = mode.at("people", { code: "car", year: "2020" });
ok(
  "mode と era の自家用車人数が一致",
  modeCar2020 !== null && near(modeCar2020, era.at("people", { metric: "car", year: "2020" })!, 1),
  String(modeCar2020),
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyoRail = geo.at("value", { metric: "rail", year: "2020", area: "13000" });
const nationalRail = geo.at("value", { metric: "rail", year: "2020", area: "00000" });
ok(
  "geo 東京の鉄道シェアが全国より高い",
  tokyoRail !== null && nationalRail !== null && tokyoRail > nationalRail,
  `東京 ${tokyoRail} / 全国 ${nationalRail}`,
);

const aomoriCar = geo.at("value", { metric: "car", year: "2020", area: "02000" });
const tokyoCar = geo.at("value", { metric: "car", year: "2020", area: "13000" });
ok(
  "geo 青森の自家用車シェアが東京より高い",
  aomoriCar !== null && tokyoCar !== null && aomoriCar > tokyoCar,
  `青森 ${aomoriCar} / 東京 ${tokyoCar}`,
);

const relNat = geo.at("relative", { metric: "rail", year: "2020", area: "00000" });
ok("geo 全国 relative=1", relNat === 1, String(relNat));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
