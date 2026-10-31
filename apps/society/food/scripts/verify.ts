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
  items: DictEntry[];
}

interface ItemFile extends CubeJson {
  items: DictEntry[];
}

interface SupplyFile extends CubeJson {
  metrics: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const itemRaw = JSON.parse(await readFile(resolve(DATA, "item.json"), "utf8")) as ItemFile;
const supplyRaw = JSON.parse(await readFile(resolve(DATA, "supply.json"), "utf8")) as SupplyFile;

const era = new CubeView(eraRaw);
const item = new CubeView(itemRaw);
const supply = new CubeView(supplyRaw);

const rice1960 = era.at("kg", { item: "rice", year: "1960" });
const rice2023 = era.at("kg", { item: "rice", year: "2023" });
ok(
  "era 米の供給純食料が長期で減少",
  rice1960 !== null && rice2023 !== null && rice2023 < rice1960,
  `${rice1960} → ${rice2023} kg`,
);

const meat1960 = era.at("kg", { item: "meat", year: "1960" });
const meat2023 = era.at("kg", { item: "meat", year: "2023" });
ok(
  "era 肉類の供給純食料が長期で増加",
  meat1960 !== null && meat2023 !== null && meat2023 > meat1960,
  `${meat1960} → ${meat2023} kg`,
);

const wheat1960 = era.at("kg", { item: "wheat", year: "1960" });
const wheat2023 = era.at("kg", { item: "wheat", year: "2023" });
ok(
  "era 小麦が米より相対的に持ち上がる方向",
  rice1960 !== null &&
    rice2023 !== null &&
    wheat1960 !== null &&
    wheat2023 !== null &&
    wheat2023 / rice2023 > wheat1960 / rice1960,
  `小麦/米 ${wheat1960! / rice1960!} → ${wheat2023! / rice2023!}`,
);

const fish1960 = era.at("kg", { item: "fish", year: "1960" });
const fish2023 = era.at("kg", { item: "fish", year: "2023" });
ok(
  "era 魚介と肉の逆転方向（近年は肉≧魚）",
  meat2023 !== null && fish2023 !== null && meat2023 >= fish2023,
  `肉 ${meat2023} / 魚 ${fish2023}（1960 魚 ${fish1960}）`,
);

const shareSum2023 = itemRaw.items.reduce(
  (n, it) => n + (item.at("share", { item: it.code, year: "2023" }) ?? 0),
  0,
);
ok(
  "item 2023 L1 熱量構成比の合計が 0.85–1.05（酒類等を含まないため 1 未満可）",
  shareSum2023 > 0.85 && shareSum2023 < 1.05,
  String(shareSum2023),
);

const grainsShare = item.at("share", { item: "grains", year: "1960" });
const grainsShareNow = item.at("share", { item: "grains", year: "2023" });
ok(
  "item 穀類の熱量構成比が低下",
  grainsShare !== null && grainsShareNow !== null && grainsShareNow < grainsShare,
  `${grainsShare} → ${grainsShareNow}`,
);

const calorieSsr1960 = supply.at("rate", { metric: "calorie_ssr", year: "1960" });
const calorieSsr2023 = supply.at("rate", { metric: "calorie_ssr", year: "2023" });
ok(
  "supply 熱量総合自給率が低下",
  calorieSsr1960 !== null &&
    calorieSsr2023 !== null &&
    calorieSsr2023 < calorieSsr1960 &&
    calorieSsr2023 > 0.2 &&
    calorieSsr2023 < 0.5,
  `${calorieSsr1960} → ${calorieSsr2023}`,
);

const riceSsr = supply.at("rate", { metric: "ss_rice", year: "2023" });
ok(
  "supply 米の自給率がおおむね自給に近い",
  riceSsr !== null && near(riceSsr, 1.0, 0.15),
  String(riceSsr),
);

const wheatSsr = supply.at("rate", { metric: "ss_wheat", year: "2023" });
ok(
  "supply 小麦の自給率が低い",
  wheatSsr !== null && wheatSsr < 0.3,
  String(wheatSsr),
);

ok("era items が空でない", eraRaw.items.length >= 10, String(eraRaw.items.length));
ok("supply metrics が空でない", supplyRaw.metrics.length >= 10, String(supplyRaw.metrics.length));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
