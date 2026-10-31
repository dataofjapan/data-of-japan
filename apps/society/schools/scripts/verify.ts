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
  paths: DictEntry[];
}

interface SchoolFile extends CubeJson {
  schools: DictEntry[];
}

interface GenderFile extends CubeJson {
  schools: DictEntry[];
  sexes: DictEntry[];
}

const eraRaw = JSON.parse(await readFile(resolve(DATA, "era.json"), "utf8")) as EraFile;
const schoolRaw = JSON.parse(
  await readFile(resolve(DATA, "school.json"), "utf8"),
) as SchoolFile;
const genderRaw = JSON.parse(
  await readFile(resolve(DATA, "gender.json"), "utf8"),
) as GenderFile;

const era = new CubeView(eraRaw);
const school = new CubeView(schoolRaw);
const gender = new CubeView(genderRaw);

ok("era 進路が5", eraRaw.paths.length === 5, String(eraRaw.paths.length));
ok("school 学校種が5", schoolRaw.schools.length === 5, String(schoolRaw.schools.length));
ok("gender sexes が3", genderRaw.sexes.length === 3, String(genderRaw.sexes.length));
ok(
  "gender 学校種が男女あり3",
  genderRaw.schools.length === 3,
  String(genderRaw.schools.length),
);

const univShare2020 = era.at("share", { path: "university", year: "2020" });
const jrShare2020 = era.at("share", { path: "junior_college", year: "2020" });
ok(
  "era 2020 大学進学シェア > 短大",
  univShare2020 !== null && jrShare2020 !== null && univShare2020 > jrShare2020,
  `大学 ${univShare2020} / 短大 ${jrShare2020}`,
);

const univShare1990 = era.at("share", { path: "university", year: "1990" });
ok(
  "era 大学進学シェアが長期で上昇 (1990→2020)",
  univShare1990 !== null && univShare2020 !== null && univShare2020 > univShare1990,
  `${univShare1990} → ${univShare2020}`,
);

const jr1990 = era.at("share", { path: "junior_college", year: "1990" });
const jr2020 = era.at("share", { path: "junior_college", year: "2020" });
ok(
  "era 短大進学シェアが低下 (1990→2020)",
  jr1990 !== null && jr2020 !== null && jr2020 < jr1990,
  `${jr1990} → ${jr2020}`,
);

const shareSum2020 = eraRaw.paths.reduce(
  (n, p) => n + (era.at("share", { path: p.code, year: "2020" }) ?? 0),
  0,
);
ok("era 2020 進路 share 合計が概ね1", near(shareSum2020, 1, 0.15), String(shareSum2020));

const univEnroll1975 = school.at("enrollment", { school: "university", year: "1975" });
const univEnroll2024 = school.at("enrollment", { school: "university", year: "2024" });
ok(
  "school 大学在学者が増加 (1975→2024)",
  univEnroll1975 !== null && univEnroll2024 !== null && univEnroll2024 > univEnroll1975,
  `${univEnroll1975} → ${univEnroll2024}`,
);

const jrEnroll1990 = school.at("enrollment", { school: "junior_college", year: "1990" });
const jrEnroll2024 = school.at("enrollment", { school: "junior_college", year: "2024" });
ok(
  "school 短大在学者が減少 (1990→2024)",
  jrEnroll1990 !== null && jrEnroll2024 !== null && jrEnroll2024 < jrEnroll1990,
  `${jrEnroll1990} → ${jrEnroll2024}`,
);

const tertiaryShare2024 = ["junior_college", "university", "senmon", "kakushu"].reduce(
  (n, code) => n + (school.at("share", { school: code, year: "2024" }) ?? 0),
  0,
);
ok("school 2024 高等教育 share 合計≈1", near(tertiaryShare2024, 1, 0.02), String(tertiaryShare2024));

const hsShare = school.at("share", { school: "high_school", year: "2024" });
ok("school 高校の share は null（分母外）", hsShare === null, String(hsShare));

const femaleUniv1975 = gender.at("female_share", {
  school: "university",
  sex: "total",
  year: "1975",
});
const femaleUniv2020 = gender.at("female_share", {
  school: "university",
  sex: "total",
  year: "2020",
});
ok(
  "gender 大学の女性割合が上昇 (1975→2020)",
  femaleUniv1975 !== null && femaleUniv2020 !== null && femaleUniv2020 > femaleUniv1975,
  `${femaleUniv1975} → ${femaleUniv2020}`,
);

const femaleJr1990 = gender.at("female_share", {
  school: "junior_college",
  sex: "total",
  year: "1990",
});
ok(
  "gender 1990 短大は女性が多数",
  femaleJr1990 !== null && femaleJr1990 > 0.7,
  String(femaleJr1990),
);

if (failed > 0) {
  console.error(`\n${failed} checks failed`);
  process.exit(1);
}
console.log("\nall checks passed");
