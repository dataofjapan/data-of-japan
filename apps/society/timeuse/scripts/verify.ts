/**
 * 配信 JSON の健全性チェック。
 *
 *   npm run verify
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CubeView, type CubeJson, type DictEntry } from "../src/app/data/cube.ts";
import { ACTIVITY_CODES, GROUP_ORDER, ACTIVITIES } from "../src/lib/data/labels.ts";

const DATA = resolve(import.meta.dirname, "../public/data");

async function load<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(resolve(DATA, `${name}.json`), "utf8")) as T;
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const era = await load<CubeJson & { activities: DictEntry[] }>("era");
  const age = await load<CubeJson & { activities: DictEntry[]; ages: DictEntry[] }>("age");
  const geo = await load<CubeJson & { activities: DictEntry[]; areas: DictEntry[] }>("geo");

  assert(era.activities.length === 20, "era activities != 20");
  assert(geo.areas[0]?.code === "00", "geo areas[0] should be national");
  assert(geo.areas.length === 48, `geo areas ${geo.areas.length}`);

  const eraCube = new CubeView(era);
  const ageCube = new CubeView(age);
  const geoCube = new CubeView(geo);

  // 2021・週全体・総数の全国: 葉の合計 ≈ 1440
  let sum = 0;
  let n = 0;
  for (const code of ACTIVITY_CODES) {
    const v = eraCube.at("minutes", {
      activity: code,
      sex: "total",
      day: "week",
      year: "2021",
    });
    if (v !== null) {
      sum += v;
      n++;
    }
  }
  console.log(`2021 week total national leaf sum: ${sum.toFixed(1)} min (${n} activities)`);
  assert(n === 20, "expected 20 leaf values for 2021");
  assert(sum > 1400 && sum < 1480, `sum ${sum} not near 1440`);

  // グループ合算も同様
  let gsum = 0;
  for (const g of GROUP_ORDER) {
    const leaves = ACTIVITIES.filter((a) => a.group === g);
    const s = leaves.reduce((acc, a) => {
      const v = eraCube.at("minutes", {
        activity: a.code,
        sex: "total",
        day: "week",
        year: "2021",
      });
      return acc + (v ?? 0);
    }, 0);
    gsum += s;
    console.log(`  group ${g}: ${s.toFixed(1)}`);
  }
  assert(Math.abs(gsum - sum) < 0.1, "group sum mismatch");

  // relative: 全国は 1
  const relNat = geoCube.at("relative", {
    activity: "05",
    sex: "total",
    day: "week",
    year: "2021",
    area: "00",
  });
  assert(relNat === 1, `national relative ${relNat}`);

  // age に 2016/2021
  const ageYears = ageCube.codes("year");
  assert(ageYears.includes("2016") && ageYears.includes("2021"), "age years");

  const sleepYoung = ageCube.at("minutes", {
    activity: "01",
    age: age.ages[0]!.code,
    sex: "total",
    day: "week",
    year: "2021",
  });
  assert(sleepYoung !== null && sleepYoung > 400, `sleep young ${sleepYoung}`);

  console.log("verify OK");
}

await main();
