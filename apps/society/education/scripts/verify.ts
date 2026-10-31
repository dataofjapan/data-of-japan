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

interface GenderFile extends CubeJson {
  metrics: DictEntry[];
  sexes: DictEntry[];
}

interface SchoolFile extends CubeJson {
  schools: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const genderRaw = JSON.parse(
  await readFile(resolve(DATA, "gender.json"), "utf8"),
) as GenderFile;
const schoolRaw = JSON.parse(
  await readFile(resolve(DATA, "school.json"), "utf8"),
) as SchoolFile;

const era = new CubeView(eraRaw);
const gender = new CubeView(genderRaw);
const school = new CubeView(schoolRaw);

const hs2016 = era.at("rate", { metric: "hs", year: "2016" });
ok(
  "era 2016 高校進学率≈98.7%",
  hs2016 !== null && near(hs2016, 0.987, 0.005),
  String(hs2016),
);

const univ2016 = era.at("rate", { metric: "univ_immediate", year: "2016" });
ok(
  "era 2016 大学・短大現役≈55.0%",
  univ2016 !== null && near(univ2016, 0.55, 0.01),
  String(univ2016),
);

const univ2023 = era.at("rate", { metric: "univ_immediate", year: "2023" });
ok(
  "era 2023 大学・短大現役が延長されている",
  univ2023 !== null && univ2023 > 0.55,
  String(univ2023),
);

const univ1954 = era.at("rate", { metric: "univ", year: "1954" });
const univ2016Lag = era.at("rate", { metric: "univ", year: "2016" });
ok(
  "era 大学（過年度含む）が長期で上昇",
  univ1954 !== null && univ2016Lag !== null && univ2016Lag > univ1954,
  `${univ1954} → ${univ2016Lag}`,
);

const femaleUniv1975 = gender.at("rate", {
  metric: "univ",
  sex: "female",
  year: "1975",
});
const maleUniv1975 = gender.at("rate", { metric: "univ", sex: "male", year: "1975" });
ok(
  "gender 1975 大学進学率は男>女",
  femaleUniv1975 !== null && maleUniv1975 !== null && maleUniv1975 > femaleUniv1975,
  `男 ${maleUniv1975} / 女 ${femaleUniv1975}`,
);

const femaleUniv2016 = gender.at("rate", {
  metric: "univ",
  sex: "female",
  year: "2016",
});
const maleUniv2016 = gender.at("rate", { metric: "univ", sex: "male", year: "2016" });
ok(
  "gender 2016 大学進学率の男女差が縮小",
  femaleUniv2016 !== null &&
    maleUniv2016 !== null &&
    femaleUniv1975 !== null &&
    maleUniv1975 !== null &&
    Math.abs(femaleUniv2016 - maleUniv2016) < Math.abs(femaleUniv1975 - maleUniv1975),
  `1975差 ${Math.abs(maleUniv1975! - femaleUniv1975!)} → 2016差 ${Math.abs(maleUniv2016! - femaleUniv2016!)}`,
);

ok("gender sexes が3", genderRaw.sexes.length === 3, String(genderRaw.sexes.length));
ok("school 学校種が8", schoolRaw.schools.length === 8, String(schoolRaw.schools.length));

const univEnroll2024 = school.at("enrollment", { school: "university", year: "2024" });
const univEnroll1975 = school.at("enrollment", { school: "university", year: "1975" });
ok(
  "school 大学在学者が増加 (1975→2024)",
  univEnroll1975 !== null && univEnroll2024 !== null && univEnroll2024 > univEnroll1975,
  `${univEnroll1975} → ${univEnroll2024}`,
);

const elem1975 = school.at("enrollment", { school: "elementary", year: "1975" });
const elem2024 = school.at("enrollment", { school: "elementary", year: "2024" });
ok(
  "school 小学校児童が減少 (1975→2024)",
  elem1975 !== null && elem2024 !== null && elem2024 < elem1975,
  `${elem1975} → ${elem2024}`,
);

const shareSum2024 = schoolRaw.dims
  .find((d) => d.name === "school")!
  .codes.reduce(
    (n, code) => n + (school.at("share", { school: code, year: "2024" }) ?? 0),
    0,
  );
ok("school 2024 share 合計≈1", near(shareSum2024, 1, 0.02), String(shareSum2024));

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
