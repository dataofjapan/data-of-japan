/**
 * 取得済みの表 → public/data/*.json（Cube）。
 * 観光庁の目的×州は出国回数の内訳ではないので purpose.json に分ける。
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Cube } from "../src/lib/cube.ts";
import {
  ABROAD,
  AGES,
  DESTINATIONS,
  DURATIONS,
  JAPAN,
  PREFS,
  PURPOSES,
  SEXES,
  UNKNOWN_AREA,
  areaCode,
  durationCode,
} from "../src/lib/labels.ts";
import { readPurpose, readStay, readWho, type CrossCell } from "../src/lib/parse.ts";

const OUT = resolve(import.meta.dirname, "../public/data");
const CATALOG = resolve(import.meta.dirname, "catalog.json");
const JNTO = resolve(import.meta.dirname, "jnto.json");

interface Catalog {
  who: Record<string, unknown>;
  stay: Record<string, unknown>;
  purpose: Record<string, string>;
}

const AREAS = [
  JAPAN,
  ...PREFS,
  { code: ABROAD.code, label: "外国（旅券の取得地）" },
  UNKNOWN_AREA,
];

function indexCells(cells: CrossCell[], keyOf: (label: string) => string | null): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of cells) {
    const key = keyOf(c.label);
    if (key === null) throw new Error(`区分が読めない: ${c.label}`);
    map.set(`${key}|${c.age}|${c.sex}`, c.value);
  }
  return map;
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8")) as Catalog;
  const whoYears = Object.keys(catalog.who).sort();
  const stayYears = Object.keys(catalog.stay).sort();
  const purposeYears = Object.keys(catalog.purpose).sort();

  const jnto = JSON.parse(readFileSync(JNTO, "utf8")) as { year: string; departures: number }[];
  const era = new Cube([{ name: "year", codes: jnto.map((r) => r.year) }], ["departures"]);
  for (const r of jnto) era.set("departures", [r.year], r.departures);

  const who = new Cube(
    [
      { name: "area", codes: AREAS.map((a) => a.code) },
      { name: "sex", codes: SEXES.map((s) => s.code) },
      { name: "age", codes: AGES.map((a) => a.code) },
      { name: "year", codes: whoYears },
    ],
    ["pop"],
  );
  for (const year of whoYears) {
    const cells = indexCells(readWho(year), areaCode);
    for (const area of AREAS) {
      for (const age of AGES) {
        for (const sex of SEXES) {
          const v = cells.get(`${area.code}|${age.code}|${sex.code}`);
          if (v !== undefined) who.set("pop", [area.code, sex.code, age.code, year], v);
        }
        const male = cells.get(`${area.code}|${age.code}|male`);
        const female = cells.get(`${area.code}|${age.code}|female`);
        if (male !== undefined && female !== undefined && cells.get(`${area.code}|${age.code}|total`) === undefined) {
          who.set("pop", [area.code, "total", age.code, year], male + female);
        }
      }
    }
    console.log("who", year, cells.size);
  }

  const durations = [{ code: "total", label: "計" }, ...DURATIONS];
  const stay = new Cube(
    [
      { name: "duration", codes: durations.map((d) => d.code) },
      { name: "sex", codes: SEXES.map((s) => s.code) },
      { name: "age", codes: AGES.map((a) => a.code) },
      { name: "year", codes: stayYears },
    ],
    ["pop"],
  );
  for (const year of stayYears) {
    const cells = indexCells(readStay(year), durationCode);
    for (const d of durations) {
      for (const age of AGES) {
        for (const sex of SEXES) {
          const v = cells.get(`${d.code}|${age.code}|${sex.code}`);
          if (v !== undefined) stay.set("pop", [d.code, sex.code, age.code, year], v);
        }
        const male = cells.get(`${d.code}|${age.code}|male`);
        const female = cells.get(`${d.code}|${age.code}|female`);
        if (male !== undefined && female !== undefined && cells.get(`${d.code}|${age.code}|total`) === undefined) {
          stay.set("pop", [d.code, "total", age.code, year], male + female);
        }
      }
    }
    console.log("stay", year, cells.size);
  }

  const purpose = new Cube(
    [
      { name: "dest", codes: DESTINATIONS.map((d) => d.code) },
      { name: "purpose", codes: PURPOSES.map((p) => p.code) },
      { name: "year", codes: purposeYears },
    ],
    ["trips"],
  );
  for (const year of purposeYears) {
    const cells = readPurpose(year);
    for (const c of cells) purpose.set("trips", [c.dest, c.purpose, year], c.trips);
    console.log("purpose", year, cells.length);
  }

  const meta = {
    latestYear: jnto.at(-1)!.year,
    eraYears: jnto.map((r) => r.year),
    whoYears,
    stayYears,
    purposeYears,
    sources: [
      { name: "出入国在留管理庁「出入国管理統計」", url: "https://www.moj.go.jp/isa/policies/statistics/toukei_ichiran_nyukan.html" },
      { name: "日本政府観光局（JNTO）がまとめた出国日本人数（出入国管理統計）", url: "https://www.jnto.go.jp/statistics/data/visitors-statistics/" },
      { name: "観光庁「旅行・観光消費動向調査」", url: "https://www.mlit.go.jp/kankocho/siryou/toukei/shouhidoukou.html" },
    ],
  };

  writeFileSync(resolve(OUT, "era.json"), JSON.stringify({ years: meta.eraYears, ...era.toJSON() }));
  writeFileSync(
    resolve(OUT, "who.json"),
    JSON.stringify({
      years: whoYears,
      areas: AREAS,
      sexes: SEXES,
      ages: AGES.map(({ code, label }) => ({ code, label })),
      ...who.toJSON(),
    }),
  );
  writeFileSync(
    resolve(OUT, "stay.json"),
    JSON.stringify({
      years: stayYears,
      durations,
      sexes: SEXES,
      ages: AGES.map(({ code, label }) => ({ code, label })),
      ...stay.toJSON(),
    }),
  );
  writeFileSync(
    resolve(OUT, "purpose.json"),
    JSON.stringify({
      years: purposeYears,
      destinations: DESTINATIONS.map(({ code, label }) => ({ code, label })),
      purposes: PURPOSES.map(({ code, label }) => ({ code, label })),
      ...purpose.toJSON(),
    }),
  );
  writeFileSync(resolve(OUT, "meta.json"), JSON.stringify(meta, null, 2));
  console.log("wrote", OUT);
}

main();
