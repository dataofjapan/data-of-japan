/**
 * 正規化 JSON（data/normalized）と衆議院の色相（data/shugiin-palette.json）だけを入力に、
 * 配信データを public/data/ に書き出す。
 *
 *   npm run data
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PREFECTURES } from "../src/lib/data/areas.ts";
import type { AreaJson, EraJson, NationalCube, System } from "../src/lib/data/cube.ts";
import { ELECTIONS } from "../src/lib/data/elections.ts";
import { huesFromEra } from "../src/lib/data/palette.ts";
import type { NormalizedElection } from "../src/lib/parse/types.ts";

const IN_DIR = resolve(import.meta.dirname, "../data/normalized");
const OUT_DIR = resolve(import.meta.dirname, "../public/data");

/** 積み上げの底に置く順。全回の得票率の合計が大きい党ほど先。無所属・諸派は最後。 */
const LAST = ["諸派", "無所属"];

function partyOrder(data: NormalizedElection[], system: System): string[] {
  const weight = new Map<string, number>();
  for (const d of data) {
    const n = d[system].national;
    for (const [party, v] of Object.entries(n.votes)) {
      weight.set(party, (weight.get(party) ?? 0) + v / n.total);
    }
  }
  const rank = (p: string) => LAST.indexOf(p);
  return [...weight.keys()].sort(
    (a, b) => rank(a) - rank(b) || weight.get(b)! - weight.get(a)!,
  );
}

function national(data: NormalizedElection[], system: System): NationalCube {
  const parties = partyOrder(data, system);
  return {
    parties,
    totals: data.map((d) => d[system].national.total),
    votes: parties.map((p) => data.map((d) => d[system].national.votes[p] ?? null)),
  };
}

function byPref(data: NormalizedElection[], system: System): AreaJson {
  const parties = partyOrder(data, system);
  const area = (d: NormalizedElection, name: string) => d[system].areas[name]!;
  return {
    elections: data.map((d) => d.n),
    areas: [...PREFECTURES],
    parties,
    totals: data.map((d) => PREFECTURES.map((a) => area(d, a).total)),
    votes: parties.map((p) =>
      data.map((d) =>
        p in d[system].national.votes ? PREFECTURES.map((a) => area(d, a).votes[p] ?? null) : null,
      ),
    ),
  };
}

async function writeJson(name: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB`);
}

const shugiinHues = JSON.parse(
  await readFile(resolve(import.meta.dirname, "../data/shugiin-palette.json"), "utf8"),
) as Record<string, number>;
const data = await Promise.all(
  ELECTIONS.map(
    async (e) => JSON.parse(await readFile(resolve(IN_DIR, `${e.n}.json`), "utf8")) as NormalizedElection,
  ),
);

await mkdir(OUT_DIR, { recursive: true });
const era: EraJson = {
  elections: data.map((d) => d.n),
  sd: national(data, "sd"),
  pr: national(data, "pr"),
};
await writeJson("era", era);
await writeJson("palette", huesFromEra(era, shugiinHues));
await writeJson("sd-pref", byPref(data, "sd"));
await writeJson("pr-pref", byPref(data, "pr"));
