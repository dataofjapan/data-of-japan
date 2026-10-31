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

interface EraFile extends CubeJson {
  items: DictEntry[];
}

interface ItemFile extends CubeJson {
  items: DictEntry[];
}

interface AttrsFile extends CubeJson {
  ages: DictEntry[];
  items: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const itemRaw = JSON.parse(await readFile(resolve(DATA, "item.json"), "utf8")) as ItemFile;
const attrsRaw = JSON.parse(await readFile(resolve(DATA, "attrs.json"), "utf8")) as AttrsFile;

const era = new CubeView(eraRaw);
const item = new CubeView(itemRaw);
const attrs = new CubeView(attrsRaw);

const clothing1985 = era.at("yen", { item: "clothing", year: "1985" });
const clothing2025 = era.at("yen", { item: "clothing", year: "2025" });
ok(
  "era 被服の月平均が長期で減少",
  clothing1985 !== null && clothing2025 !== null && clothing2025 < clothing1985,
  `${clothing1985} → ${clothing2025} 円`,
);

const telecom1985 = era.at("yen", { item: "telecom", year: "1985" });
const telecom2025 = era.at("yen", { item: "telecom", year: "2025" });
ok(
  "era 通信の月平均が長期で増加",
  telecom1985 !== null && telecom2025 !== null && telecom2025 > telecom1985,
  `${telecom1985} → ${telecom2025} 円`,
);

const engel2000 = era.at("share", { item: "engel", year: "2000" });
const engel2025 = era.at("share", { item: "engel", year: "2025" });
ok(
  "era エンゲル係数が 2000→2025 で上昇方向",
  engel2000 !== null && engel2025 !== null && engel2025 > engel2000,
  `${engel2000} → ${engel2025}`,
);

const shareSum2025 = itemRaw.items.reduce(
  (n, it) => n + (item.at("share", { item: it.code, year: "2025" }) ?? 0),
  0,
);
ok(
  "item 2025 L4 構成比合計がおおむね 1",
  shareSum2025 > 0.98 && shareSum2025 < 1.02,
  String(shareSum2025),
);

const foodShare1985 = item.at("share", { item: "food", year: "1985" });
const foodShare2025 = item.at("share", { item: "food", year: "2025" });
ok(
  "item 食料シェアが取得できている",
  foodShare1985 !== null && foodShare2025 !== null && foodShare1985 > 0.15,
  `${foodShare1985} → ${foodShare2025}`,
);

const edu40 = attrs.at("yen", { age: "a40", item: "education", year: "2025" });
const edu65 = attrs.at("yen", { age: "a65", item: "education", year: "2025" });
ok(
  "attrs 教育は 40代の方が 65–69歳より大きい",
  edu40 !== null && edu65 !== null && edu40 > edu65,
  `40–44 ${edu40} / 65–69 ${edu65}`,
);

const health65 = attrs.at("yen", { age: "a65", item: "health", year: "2025" });
const health35 = attrs.at("yen", { age: "a35", item: "health", year: "2025" });
ok(
  "attrs 保健医療は高齢層の方が大きい方向",
  health65 !== null && health35 !== null && health65 > health35,
  `65–69 ${health65} / 35–39 ${health35}`,
);

ok("era items が空でない", eraRaw.items.length >= 12, String(eraRaw.items.length));
ok("attrs ages が空でない", attrsRaw.ages.length >= 10, String(attrsRaw.ages.length));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
