/**
 * 正規化 JSON（data/normalized）だけを入力に、配信データを public/data/ に書き出す。
 *
 *   npm run data
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PREFECTURES } from "../src/lib/data/areas.ts";
import type { AgeJson, EraJson, PrefJson } from "../src/lib/data/cube.ts";
import { AGE_GROUPS, ELECTIONS } from "../src/lib/data/elections.ts";
import type { NormalizedAge, NormalizedElection, NormalizedHistory } from "../src/lib/parse/types.ts";

const IN_DIR = resolve(import.meta.dirname, "../data/normalized");
const OUT_DIR = resolve(import.meta.dirname, "../public/data");

const read = async <T>(name: string) => JSON.parse(await readFile(resolve(IN_DIR, `${name}.json`), "utf8")) as T;

async function writeJson(name: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB`);
}

const history = await read<NormalizedHistory>("history");
const age = await read<NormalizedAge>("age");
const results = await Promise.all(
  ELECTIONS.filter((e) => e.tables.sdPref !== undefined).map((e) => read<NormalizedElection>(String(e.n))),
);

/** 全国は、確定結果調にある回はその値、ない回（速報）は結果ページの表の全国の行。 */
const era: EraJson = { elections: [], sd: [], pr: [] };
for (const e of ELECTIONS) {
  const final = history.elections.find((h) => h.n === e.n);
  const result = results.find((r) => r.n === e.n);
  const sd = final?.sd ?? result?.sd.national;
  const pr = final?.pr ?? result?.pr.national;
  if (sd === undefined || pr === undefined) throw new Error(`第${e.n}回の全国値がない`);
  era.elections.push(e.n);
  era.sd.push(sd);
  era.pr.push(pr);
}

const pref: PrefJson = {
  elections: results.map((r) => r.n),
  prefs: [...PREFECTURES],
  sd: results.map((r) => PREFECTURES.map((p) => r.sd.prefs[p]!)),
  pr: results.map((r) => PREFECTURES.map((p) => r.pr.prefs[p]!)),
};

const ageJson: AgeJson = { elections: age.elections, groups: [...AGE_GROUPS], rates: age.rates, total: age.total };

await mkdir(OUT_DIR, { recursive: true });
await writeJson("era", era);
await writeJson("pref", pref);
await writeJson("age", ageJson);
