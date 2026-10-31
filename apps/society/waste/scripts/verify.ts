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

interface FlowFile extends CubeJson {
  codes: DictEntry[];
}

interface GeoFile extends CubeJson {
  metrics: DictEntry[];
  areas: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const flowRaw = JSON.parse(await readFile(resolve(DATA, "flow.json"), "utf8")) as FlowFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const flow = new CubeView(flowRaw);
const geo = new CubeView(geoRaw);

const per2005 = era.at("intensity", { metric: "per_capita", year: "2005" });
ok("era 2005 1人1日当たり≈1131g", per2005 !== null && near(per2005, 1131, 1), String(per2005));

const per2023 = era.at("intensity", { metric: "per_capita", year: "2023" });
ok("era 2023 1人1日当たり≈851g", per2023 !== null && near(per2023, 851, 1), String(per2023));

ok(
  "era 1人1日当たりが 2005→2023 で減少",
  per2005 !== null && per2023 !== null && per2023 < per2005,
  `${per2005} → ${per2023}`,
);

const recycle2023 = era.at("rate", { metric: "recycle_rate", year: "2023" });
ok(
  "era 2023 リサイクル率≈19.5%",
  recycle2023 !== null && near(recycle2023, 0.195, 0.002),
  String(recycle2023),
);

const discharge2023 = era.at("tonnes", { metric: "discharge", year: "2023" });
ok(
  "era 2023 総排出≈38,974,270t",
  discharge2023 !== null && near(discharge2023, 38_974_270, 1),
  String(discharge2023),
);

const final2023 = era.at("tonnes", { metric: "final_disposal", year: "2023" });
const final1999 = era.at("tonnes", { metric: "final_disposal", year: "1999" });
ok(
  "era 最終処分が 1999→2023 で減少",
  final1999 !== null && final2023 !== null && final2023 < final1999,
  `${final1999} → ${final2023}`,
);

const landfill2023 = era.at("rate", { metric: "landfill_rate", year: "2023" });
ok(
  "era 2023 埋立率≈8.1%",
  landfill2023 !== null && near(landfill2023, 0.081, 0.002),
  String(landfill2023),
);

const flowShareSum = ["planned", "direct_in", "self", "group"].reduce(
  (n, code) => n + (flow.at("share", { code, year: "2023" }) ?? 0),
  0,
);
ok("flow 2023 排出内訳 share 合計≈1", near(flowShareSum, 1, 0.02), String(flowShareSum));

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyo = geo.at("value", { metric: "per_capita", year: "2023", area: "13000" });
const national = geo.at("value", { metric: "per_capita", year: "2023", area: "00000" });
ok(
  "geo 東京の原単位が全国と異なる",
  tokyo !== null && national !== null && tokyo !== national,
  `東京 ${tokyo} / 全国 ${national}`,
);

const relNat = geo.at("relative", { metric: "per_capita", year: "2023", area: "00000" });
ok("geo 全国 relative=1", relNat === 1, String(relNat));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
