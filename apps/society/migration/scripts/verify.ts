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

interface GeoFile extends CubeJson {
  metrics: DictEntry[];
  areas: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const geoRaw = JSON.parse(await readFile(resolve(DATA, "geo.json"), "utf8")) as GeoFile;

const era = new CubeView(eraRaw);
const geo = new CubeView(geoRaw);

const movers1954 = era.at("people", { metric: "movers", year: "1954" });
ok(
  "era 1954 移動者数が妥当",
  movers1954 !== null && movers1954 > 4_000_000 && movers1954 < 7_000_000,
  String(movers1954),
);

const movers2019 = era.at("people", { metric: "movers", year: "2019" });
ok(
  "era 2019 移動者数≈488万（日本人）",
  movers2019 !== null && near(movers2019, 4_889_191, 1),
  String(movers2019),
);

const tokyo1987 = era.at("people", { metric: "tokyo_net", year: "1987" });
ok(
  "era 1987 東京圏転入超過≈16.4万",
  tokyo1987 !== null && near(tokyo1987, 163_644, 1),
  String(tokyo1987),
);

const tokyo2011 = era.at("people", { metric: "tokyo_net", year: "2011" });
const tokyo2019 = era.at("people", { metric: "tokyo_net", year: "2019" });
ok(
  "era 東京圏転入超過が震災年に相対的に小さい",
  tokyo2011 !== null && tokyo2019 !== null && tokyo2011 < tokyo2019,
  `${tokyo2011} < ${tokyo2019}`,
);

const tokyo2020 = era.at("people", { metric: "tokyo_net", year: "2020" });
ok(
  "era 2020 東京圏転入超過が取得できている",
  tokyo2020 !== null,
  String(tokyo2020),
);

const intra = era.at("people", { metric: "intra", year: "2019" });
const inter = era.at("people", { metric: "inter", year: "2019" });
ok(
  "era 2019 県内+県間≈移動者数",
  movers2019 !== null &&
    intra !== null &&
    inter !== null &&
    near(intra + inter, movers2019, 2),
  `${intra}+${inter}=${(intra ?? 0) + (inter ?? 0)} vs ${movers2019}`,
);

ok("geo 都道府県が47+全国", geoRaw.areas.length === 48, String(geoRaw.areas.length));

const tokyoNet2023 = geo.at("value", { metric: "net", year: "2023", area: "13000" });
const aomoriNet2023 = geo.at("value", { metric: "net", year: "2023", area: "02000" });
ok(
  "geo 2023 東京は転入超過、青森は転出超過寄り",
  tokyoNet2023 !== null &&
    aomoriNet2023 !== null &&
    tokyoNet2023 > 0 &&
    aomoriNet2023 < 0,
  `東京 ${tokyoNet2023} / 青森 ${aomoriNet2023}`,
);

const natNet = geo.at("value", { metric: "net", year: "2023", area: "00000" });
ok(
  "geo 全国の転入超過は小さい（国内閉じ）",
  natNet !== null && Math.abs(natNet) < 5_000,
  String(natNet),
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
