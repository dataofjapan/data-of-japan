/**
 * 配信 JSON の健全性チェック。
 * 出国の全国計は JNTO の出国日本人数と、滞在期間の合計は帰国の総数と突き合わせる。
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DATA = resolve(import.meta.dirname, "../public/data");

interface Dim {
  name: string;
  codes: string[];
}
interface CubeFile {
  dims: Dim[];
  measures: Record<string, (number | null)[]>;
}

function load<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(DATA, name), "utf8")) as T;
}

function at(cube: CubeFile, measure: string, coords: Record<string, string>): number | null {
  let off = 0;
  let stride = 1;
  for (let i = cube.dims.length - 1; i >= 0; i--) {
    const d = cube.dims[i]!;
    const idx = d.codes.indexOf(coords[d.name]!);
    if (idx < 0) throw new Error(`bad ${d.name}=${coords[d.name]}`);
    off += idx * stride;
    stride *= d.codes.length;
  }
  return cube.measures[measure]![off] ?? null;
}

let failed = 0;
function check(cond: boolean, msg: string): void {
  console.log(cond ? "ok  " : "FAIL", msg);
  if (!cond) failed++;
}

const era = load<CubeFile & { years: string[] }>("era.json");
const who = load<CubeFile & { years: string[]; areas: { code: string }[] }>("who.json");
const stay = load<CubeFile & { years: string[]; durations: { code: string }[] }>("stay.json");
const purpose = load<CubeFile & { years: string[] }>("purpose.json");

check(era.years[0] === "1964" && era.years.at(-1) === "2025", `era ${era.years[0]}–${era.years.at(-1)}`);
check(at(era, "departures", { year: "1964" }) === 127_749, "1964 出国 127,749");
check(at(era, "departures", { year: "2025" }) === 14_731_615, "2025 出国 14,731,615");

for (const year of who.years) {
  const published = at(era, "departures", { year });
  const table = at(who, "pop", { area: "00", sex: "total", age: "total", year });
  check(table === published, `${year} 出国 全国 ${table} = JNTO ${published}`);
  let sum = 0;
  for (const a of who.areas) {
    if (a.code === "00") continue;
    sum += at(who, "pop", { area: a.code, sex: "total", age: "total", year }) ?? 0;
  }
  check(sum === table, `${year} 住所地の合計 ${sum} = 全国`);
  const ages = who.dims.find((d) => d.name === "age")!.codes.filter((c) => c !== "total");
  const ageSum = ages.reduce((n, age) => n + (at(who, "pop", { area: "00", sex: "total", age, year }) ?? 0), 0);
  check(ageSum === table, `${year} 年齢の合計 ${ageSum} = 全国`);
}

for (const year of stay.years) {
  const total = at(stay, "pop", { duration: "total", sex: "total", age: "total", year });
  const sum = stay.durations
    .filter((d) => d.code !== "total")
    .reduce((n, d) => n + (at(stay, "pop", { duration: d.code, sex: "total", age: "total", year }) ?? 0), 0);
  check(total !== null && sum === total, `${year} 滞在期間の合計 ${sum} = 帰国 ${total}`);
}

for (const year of purpose.years) {
  const total = at(purpose, "trips", { dest: "world", purpose: "total", year });
  const parts = ["tourism", "visit", "business"].reduce(
    (n, p) => n + (at(purpose, "trips", { dest: "world", purpose: p, year }) ?? 0),
    0,
  );
  // 表は千人単位。内訳を人に戻すと 1千人ぶんずれる年がある
  check(total !== null && Math.abs(parts - total) <= 2_000, `${year} 目的の合計 ${parts} ≈ 計 ${total}`);
}
const trips2025 = at(purpose, "trips", { dest: "world", purpose: "total", year: "2025" });
const back2025 = at(stay, "pop", { duration: "total", sex: "total", age: "total", year: "2025" });
check(trips2025 === back2025, `2025 観光庁の海外旅行 ${trips2025} = 帰国 ${back2025}`);

if (failed > 0) {
  console.error(`${failed} checks failed`);
  process.exit(1);
}
console.log("all checks passed");
