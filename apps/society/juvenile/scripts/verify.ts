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
  codes: DictEntry[];
  offenses: { code: string; label: string; persons: number; share: number }[];
}

interface DispositionFile extends CubeJson {
  codes: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const ageRaw = JSON.parse(await readFile(resolve(DATA, "age.json"), "utf8")) as AgeFile;
const dispositionRaw = JSON.parse(
  await readFile(resolve(DATA, "disposition.json"), "utf8"),
) as DispositionFile;

const era = new CubeView(eraRaw);
const age = new CubeView(ageRaw);
const disposition = new CubeView(dispositionRaw);

const admitted1951 = era.at("persons", { metric: "admitted", year: "1951" });
ok(
  "era 1951 入院≈11,333",
  admitted1951 !== null && near(admitted1951, 11_333, 1),
  String(admitted1951),
);

const admitted2000 = era.at("persons", { metric: "admitted", year: "2000" });
ok(
  "era 2000 入院≈6,052",
  admitted2000 !== null && near(admitted2000, 6_052, 1),
  String(admitted2000),
);

const admitted2022 = era.at("persons", { metric: "admitted", year: "2022" });
ok(
  "era 2022 入院≈1,332",
  admitted2022 !== null && near(admitted2022, 1_332, 1),
  String(admitted2022),
);

const admitted2024 = era.at("persons", { metric: "admitted", year: "2024" });
ok(
  "era 2024 入院≈1,828",
  admitted2024 !== null && near(admitted2024, 1_828, 1),
  String(admitted2024),
);

const female2024 = era.at("rate", { metric: "female_share", year: "2024" });
ok(
  "era 2024 女子比≈8.6%",
  female2024 !== null && near(female2024, 158 / 1_828, 0.002),
  String(female2024),
);

const detention2024 = era.at("persons", { metric: "detention", year: "2024" });
ok(
  "era 2024 鑑別所被収容≈5,574",
  detention2024 !== null && near(detention2024, 5_574, 2),
  String(detention2024),
);

ok(
  "era 1981 鑑別所が欠測",
  era.at("persons", { metric: "detention", year: "1981" }) === null,
);

const toTraining2024 = era.at("persons", { metric: "to_training", year: "2024" });
ok(
  "era 2024 少年院送致≈1,828",
  toTraining2024 !== null && near(toTraining2024, 1_828, 1),
  String(toTraining2024),
);

ok(
  "era 1974 少年院送致が欠測",
  era.at("persons", { metric: "to_training", year: "1974" }) === null,
);

const a18_2024 = age.at("persons", { code: "a18", year: "2024" });
ok(
  "age 2024 18歳以上≈819",
  a18_2024 !== null && near(a18_2024, 819, 1),
  String(a18_2024),
);

const u16_2024 = age.at("persons", { code: "u16", year: "2024" });
ok(
  "age 2024 16歳未満≈260",
  u16_2024 !== null && near(u16_2024, 260, 1),
  String(u16_2024),
);

const a16_2024 = age.at("persons", { code: "a16", year: "2024" });
ok(
  "age 2024 16・17歳≈749",
  a16_2024 !== null && near(a16_2024, 749, 1),
  String(a16_2024),
);

const theft = ageRaw.offenses.find((o) => o.code === "theft");
ok(
  "age 2024 窃盗≈411",
  theft !== undefined && near(theft.persons, 411, 1),
  String(theft?.persons),
);

const injury = ageRaw.offenses.find((o) => o.code === "injury");
ok(
  "age 2024 傷害≈376",
  injury !== undefined && near(injury.persons, 376, 1),
  String(injury?.persons),
);

const training2024 = disposition.at("persons", { code: "training", year: "2024" });
ok(
  "disposition 2024 少年院送致≈1,828",
  training2024 !== null && near(training2024, 1_828, 1),
  String(training2024),
);

const probation2024 = disposition.at("persons", { code: "probation", year: "2024" });
ok(
  "disposition 2024 保護観察≈2,231",
  probation2024 !== null && near(probation2024, 2_231, 1),
  String(probation2024),
);

const test2024 = disposition.at("persons", { code: "test", year: "2024" });
ok(
  "disposition 2024 試験観察≈608",
  test2024 !== null && near(test2024, 608, 1),
  String(test2024),
);

const cancel2024 = disposition.at("persons", { code: "cancel", year: "2024" });
ok(
  "disposition 2024 観護取消≈558",
  cancel2024 !== null && near(cancel2024, 558, 1),
  String(cancel2024),
);

ok(
  "入院と退所の少年院送致が一致",
  admitted2024 !== null &&
    training2024 !== null &&
    toTraining2024 !== null &&
    near(admitted2024, training2024, 0) &&
    near(admitted2024, toTraining2024, 0),
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
