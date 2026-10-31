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

interface StatusFile extends CubeJson {
  forms: DictEntry[];
}

interface AttrsFile extends CubeJson {
  ages: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const statusRaw = JSON.parse(
  await readFile(resolve(DATA, "status.json"), "utf8"),
) as StatusFile;
const attrsRaw = JSON.parse(await readFile(resolve(DATA, "attrs.json"), "utf8")) as AttrsFile;

const era = new CubeView(eraRaw);
const status = new CubeView(statusRaw);
const attrs = new CubeView(attrsRaw);

const emp2024 = era.at("value", { metric: "emp_rate", sex: "total", year: "2024" });
ok(
  "era 2024 就業率が妥当",
  emp2024 !== null && emp2024 > 0.55 && emp2024 < 0.7,
  String(emp2024),
);

const unemp2024 = era.at("value", { metric: "unemp_rate", sex: "total", year: "2024" });
ok(
  "era 2024 完全失業率が妥当",
  unemp2024 !== null && unemp2024 > 0.01 && unemp2024 < 0.06,
  String(unemp2024),
);

const emp1968 = era.at("value", { metric: "emp_rate", sex: "total", year: "1968" });
ok(
  "era 1968 就業率がある（公表は1968年～）",
  emp1968 !== null && emp1968 > 0.5,
  String(emp1968),
);
const lfpr1953 = era.at("value", { metric: "lfpr", sex: "total", year: "1953" });
ok(
  "era 1953 労働力人口比率がある",
  lfpr1953 !== null && lfpr1953 > 0.5,
  String(lfpr1953),
);

const self1953 = era.at("workers", { metric: "self_employed", sex: "total", year: "1953" });
const self2024 = era.at("workers", { metric: "self_employed", sex: "total", year: "2024" });
ok(
  "era 自営業主が長期で減少",
  self1953 !== null && self2024 !== null && self2024 < self1953,
  `${self1953} → ${self2024}`,
);

const regular2013 = era.at("workers", { metric: "regular", sex: "total", year: "2013" });
const regular2024 = era.at("workers", { metric: "regular", sex: "total", year: "2024" });
ok(
  "era 正規が2013年からある",
  regular2013 !== null && regular2013 > 3000,
  String(regular2013),
);
ok(
  "era 正規が増加傾向 (2013→2024)",
  regular2013 !== null && regular2024 !== null && regular2024 > regular2013,
  `${regular2013} → ${regular2024}`,
);

const regular2012 = era.at("workers", { metric: "regular", sex: "total", year: "2012" });
ok("era 正規は2012年欠測", regular2012 === null, String(regular2012));

const statusShare =
  (status.at("share", { form: "self_employed", sex: "total", year: "2024" }) ?? 0) +
  (status.at("share", { form: "family", sex: "total", year: "2024" }) ?? 0) +
  (status.at("share", { form: "employee", sex: "total", year: "2024" }) ?? 0);
ok("status 2024 地位 share 合計≈1", near(statusShare, 1, 0.05), String(statusShare));

const formShare =
  (status.at("share", { form: "regular", sex: "total", year: "2024" }) ?? 0) +
  (status.at("share", { form: "nonregular", sex: "total", year: "2024" }) ?? 0);
ok("status 2024 正規+非正規 share≈1", near(formShare, 1, 0.05), String(formShare));

const femaleEmp = attrs.at("empRate", { age: "00", sex: "female", year: "2024" });
const maleEmp = attrs.at("empRate", { age: "00", sex: "male", year: "2024" });
ok(
  "attrs 女性就業率が男性より低い (15歳以上)",
  femaleEmp !== null && maleEmp !== null && femaleEmp < maleEmp,
  `女 ${femaleEmp} / 男 ${maleEmp}`,
);

const elderly = attrs.at("empRate", { age: "18", sex: "total", year: "2024" });
ok(
  "attrs 65歳以上就業率が妥当",
  elderly !== null && elderly > 0.15 && elderly < 0.45,
  String(elderly),
);

const nrYoung = attrs.at("nonregularShare", { age: "02", sex: "total", year: "2024" });
const nrMid = attrs.at("nonregularShare", { age: "10", sex: "total", year: "2024" });
ok(
  "attrs 若年の非正規比率が中年より高い",
  nrYoung !== null && nrMid !== null && nrYoung > nrMid,
  `15–19 ${nrYoung} / 35–39 ${nrMid}`,
);

ok("attrs 年齢帯が16", attrsRaw.ages.length === 16, String(attrsRaw.ages.length));
ok("era 指標が8", eraRaw.metrics.length === 8, String(eraRaw.metrics.length));
ok("status 形態が10", statusRaw.forms.length === 10, String(statusRaw.forms.length));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
