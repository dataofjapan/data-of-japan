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

interface RatesFile extends CubeJson {
  ages: DictEntry[];
}

const ratesRaw = JSON.parse(await readFile(resolve(DATA, "rates.json"), "utf8")) as RatesFile;
const rates = new CubeView(ratesRaw);

ok("年齢帯が16", ratesRaw.ages.length === 16, String(ratesRaw.ages.length));

const emp2024 = rates.at("empRate", { age: "00", sex: "total", year: "2024" });
ok(
  "2024 15歳以上就業率が妥当",
  emp2024 !== null && emp2024 > 0.55 && emp2024 < 0.7,
  String(emp2024),
);

const emp1968 = rates.at("empRate", { age: "00", sex: "total", year: "1968" });
ok(
  "1968 就業率がある（公表は1968年～）",
  emp1968 !== null && emp1968 > 0.5,
  String(emp1968),
);

const emp1967 = rates.at("empRate", { age: "00", sex: "total", year: "1967" });
ok("1967 就業率は欠測", emp1967 === null, String(emp1967));

const lfpr1953 = rates.at("lfpr", { age: "00", sex: "total", year: "1953" });
ok(
  "1953 労働力人口比率がある",
  lfpr1953 !== null && lfpr1953 > 0.5,
  String(lfpr1953),
);

const elderly2000 = rates.at("empRate", { age: "18", sex: "total", year: "2000" });
const elderly2024 = rates.at("empRate", { age: "18", sex: "total", year: "2024" });
ok(
  "65歳以上就業率が上昇 (2000→2024)",
  elderly2000 !== null && elderly2024 !== null && elderly2024 > elderly2000,
  `${elderly2000} → ${elderly2024}`,
);

const elderlyOk =
  elderly2024 !== null && elderly2024 > 0.15 && elderly2024 < 0.45;
ok("2024 65歳以上就業率が妥当", elderlyOk, String(elderly2024));

const femaleEmp = rates.at("empRate", { age: "00", sex: "female", year: "2024" });
const maleEmp = rates.at("empRate", { age: "00", sex: "male", year: "2024" });
ok(
  "女性就業率が男性より低い (15歳以上)",
  femaleEmp !== null && maleEmp !== null && femaleEmp < maleEmp,
  `女 ${femaleEmp} / 男 ${maleEmp}`,
);

const age6064 = rates.at("empRate", { age: "17", sex: "total", year: "2024" });
const age6569 = rates.at("empRate", { age: "19", sex: "total", year: "2024" });
ok(
  "60–64 就業率が 65–69 より高い",
  age6064 !== null && age6569 !== null && age6064 > age6569,
  `60–64 ${age6064} / 65–69 ${age6569}`,
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
