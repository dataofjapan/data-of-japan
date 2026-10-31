/**
 * 生データから配信用 cube を組み立てて public/data/ に書き出す。
 *
 *   npm run data
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadTable, type Table } from "../src/lib/transform/table.ts";
import { Cube, round } from "../src/lib/transform/cube.ts";
import { formatBytes } from "../src/lib/cache.ts";
import {
  AGE_CODES,
  SEX_LABEL_LFS,
  type Sex,
} from "../src/lib/data/labels.ts";
import type { DictEntry } from "../src/app/data/cube.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

const SEXES = ["total", "male", "female"] as const satisfies readonly Sex[];

function yearOf(name: string): string {
  const m = /^(\d{4})年/.exec(name);
  if (m === null) throw new Error(`年として読めない: ${name}`);
  return m[1]!;
}

function shortAgeLabel(name: string): string {
  return name.replace(/歳$/, "").replace(/～/g, "–");
}

function rateFrac(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function yearsOf(t: Table): { code: string; year: string }[] {
  return [...t.axis("時間軸").items]
    .map((c) => ({ code: c["@code"], year: yearOf(c["@name"]) }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

function sexCode(t: Table, sex: Sex): string {
  return t.codeOf("性別", SEX_LABEL_LFS[sex]);
}

async function buildRates(rates: Table) {
  const rateAge = rates.axis("年齢階級");
  const ages: DictEntry[] = AGE_CODES.map((code) => {
    const item = rateAge.byCode.get(code);
    if (item === undefined) throw new Error(`年齢コード ${code} がない`);
    return {
      code,
      label: shortAgeLabel(item["@name"]),
      level: Number(item["@level"] || 1),
    };
  });

  const years = yearsOf(rates).map((y) => y.year);

  const cube = new Cube(
    [
      { name: "age", codes: ages.map((a) => a.code) },
      { name: "sex", codes: [...SEXES] },
      { name: "year", codes: years },
    ],
    ["empRate", "unempRate", "lfpr"],
  );

  const rateTab = rates.axis("表章項目").items[0]!["@code"];
  const indAll = rates.codeOf("産業", "全産業");
  const lfpr = rates.codeOf("就業状態", "労働力人口");
  const emp = rates.codeOf("就業状態", "就業");
  const unemp = rates.codeOf("就業状態", "完全失業者");
  const yearItems = yearsOf(rates);

  for (const age of ages) {
    for (const sex of SEXES) {
      for (const { code: time, year } of yearItems) {
        const base = {
          表章項目: rateTab,
          産業: indAll,
          性別: sexCode(rates, sex),
          年齢階級: age.code,
          地域: "00000",
          時間軸: time,
        };
        cube.set("lfpr", [age.code, sex, year], rateFrac(rates.get({ ...base, 就業状態: lfpr })));
        cube.set("empRate", [age.code, sex, year], rateFrac(rates.get({ ...base, 就業状態: emp })));
        cube.set(
          "unempRate",
          [age.code, sex, year],
          rateFrac(rates.get({ ...base, 就業状態: unemp })),
        );
      }
    }
  }

  await writeJson("rates", { ...cube.toJSON(), ages });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("build working-age cubes");
  const rates = await loadTable("rates-age");
  await buildRates(rates);
}

await main();
