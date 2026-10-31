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

interface ProbationFile extends CubeJson {
  metrics: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const ageRaw = JSON.parse(await readFile(resolve(DATA, "age.json"), "utf8")) as AgeFile;
const probationRaw = JSON.parse(
  await readFile(resolve(DATA, "probation.json"), "utf8"),
) as ProbationFile;

const era = new CubeView(eraRaw);
const age = new CubeView(ageRaw);
const probation = new CubeView(probationRaw);

const end1949 = era.at("persons", { metric: "year_end", year: "1949" });
ok(
  "era 1949 年末収容≈96,609",
  end1949 !== null && near(end1949, 96_609, 1),
  String(end1949),
);

const end2006 = era.at("persons", { metric: "year_end", year: "2006" });
ok(
  "era 2006 年末収容≈81,255",
  end2006 !== null && near(end2006, 81_255, 1),
  String(end2006),
);

const end2024 = era.at("persons", { metric: "year_end", year: "2024" });
ok(
  "era 2024 年末収容≈40,544",
  end2024 !== null && near(end2024, 40_544, 1),
  String(end2024),
);

const admitted2024 = era.at("persons", { metric: "admitted", year: "2024" });
ok(
  "era 2024 入所受刑≈14,822",
  admitted2024 !== null && near(admitted2024, 14_822, 1),
  String(admitted2024),
);

const occupancy2002 = era.at("rate", { metric: "occupancy", year: "2002" });
ok(
  "era 2002 収容率≈106.5%",
  occupancy2002 !== null && near(occupancy2002, 1.065, 0.002),
  String(occupancy2002),
);

const occupancy2024 = era.at("rate", { metric: "occupancy", year: "2024" });
ok(
  "era 2024 収容率≈49.9%",
  occupancy2024 !== null && near(occupancy2024, 0.499, 0.002),
  String(occupancy2024),
);

const per2024 = era.at("rate", { metric: "per_100k", year: "2024" });
ok(
  "era 2024 人口比≈32.7",
  per2024 !== null && near(per2024, 32.75, 0.05),
  String(per2024),
);

const reentry1989 = era.at("rate", { metric: "reentry_rate", year: "1989" });
ok(
  "era 1989 再入者率≈62.3%",
  reentry1989 !== null && near(reentry1989, 0.623, 0.002),
  String(reentry1989),
);

const reentry2006 = era.at("rate", { metric: "reentry_rate", year: "2006" });
ok(
  "era 2006 再入者率≈50.0%",
  reentry2006 !== null && near(reentry2006, 0.5, 0.002),
  String(reentry2006),
);

const reentry2024 = era.at("rate", { metric: "reentry_rate", year: "2024" });
ok(
  "era 2024 再入者率≈53.7%",
  reentry2024 !== null && near(reentry2024, 0.537, 0.002),
  String(reentry2024),
);

const parole2024 = era.at("rate", { metric: "parole_rate", year: "2024" });
ok(
  "era 2024 仮釈放率≈62.8%",
  parole2024 !== null && near(parole2024, 0.628, 0.002),
  String(parole2024),
);

ok("era 1971 収容率が欠測", era.at("rate", { metric: "occupancy", year: "1971" }) === null);
ok("era 1988 再入者率が欠測", era.at("rate", { metric: "reentry_rate", year: "1988" }) === null);

const a70_2024 = age.at("persons", { code: "a70", year: "2024" });
ok(
  "age 2024 70歳以上≈1,370",
  a70_2024 !== null && near(a70_2024, 1_370, 1),
  String(a70_2024),
);

const elderly2024 = era.at("rate", { metric: "elderly_share", year: "2024" });
ok(
  "era 2024 高齢者比≈13.8%",
  elderly2024 !== null && near(elderly2024, 0.1382, 0.002),
  String(elderly2024),
);

const theft = ageRaw.offenses.find((o) => o.code === "theft");
ok(
  "age 2024 窃盗≈5,418",
  theft !== undefined && near(theft.persons, 5_418, 1),
  String(theft?.persons),
);

const stimulant = ageRaw.offenses.find((o) => o.code === "stimulant");
ok(
  "age 2024 覚醒剤≈2,987",
  stimulant !== undefined && near(stimulant.persons, 2_987, 1),
  String(stimulant?.persons),
);

const parolePersons = probation.at("persons", { metric: "parole", year: "2024" });
ok(
  "probation 2024 仮釈放≈9,448",
  parolePersons !== null && near(parolePersons, 9_448, 1),
  String(parolePersons),
);

const suspended2024 = probation.at("persons", { metric: "suspended", year: "2024" });
ok(
  "probation 2024 執行猶予保護観察≈2,169",
  suspended2024 !== null && near(suspended2024, 2_169, 1),
  String(suspended2024),
);

const adult2024 = probation.at("persons", { metric: "adult", year: "2024" });
ok(
  "probation 2024 成人開始≈11,617",
  adult2024 !== null && near(adult2024, 11_617, 1),
  String(adult2024),
);

const susRate2024 = probation.at("rate", { metric: "suspended_rate", year: "2024" });
ok(
  "probation 2024 全部執行猶予の保護観察率≈4.9%",
  susRate2024 !== null && near(susRate2024, 0.0493, 0.002),
  String(susRate2024),
);

const parole1949 = probation.at("persons", { metric: "parole", year: "1949" });
ok(
  "probation 1949 仮釈放≈27,799",
  parole1949 !== null && near(parole1949, 27_799, 1),
  String(parole1949),
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
