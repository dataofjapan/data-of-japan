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
import type { DictEntry } from "../src/app/data/cube.ts";
import {
  ERA_FROM,
  ERA_TO,
  METRICS,
  PREF_AREAS,
  TYPE_CODES,
} from "../src/lib/data/labels.ts";

const OUT_DIR = resolve(import.meta.dirname, "../public/data");

function timeCode(year: string): string {
  return `${year}100000`;
}

function yearsInclusive(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total === 0) return null;
  return round(part / total, 4);
}

function ratePctToFrac(v: number | null): number | null {
  if (v === null) return null;
  return round(v / 100, 4);
}

async function writeJson(name: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  await writeFile(resolve(OUT_DIR, `${name}.json`), json);
  console.log(`  ${name}.json  ${formatBytes(Buffer.byteLength(json))}`);
}

function metricsDict(list = METRICS): DictEntry[] {
  return list.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));
}

function getSsds(t: Table, code: string, area: string, year: string): number | null {
  return t.get({
    観測値: "00001",
    "Ｋ　安全": code,
    地域: area,
    調査年: timeCode(year),
  });
}

async function buildEra(counts: Table, rates: Table) {
  const metrics = metricsDict();
  const years = yearsInclusive(ERA_FROM, ERA_TO);
  const metricCodes = METRICS.map((m) => m.code);

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "year", codes: years },
    ],
    ["cases", "rate", "share"],
  );

  for (const year of years) {
    for (const m of METRICS) {
      let cases: number | null = null;
      let rate: number | null = null;
      const share: number | null = null;

      if (m.countCode) {
        cases = getSsds(counts, m.countCode, "00000", year);
      }
      if (m.rateCode) {
        rate = ratePctToFrac(getSsds(rates, m.rateCode, "00000", year));
        // #K06101 / #K06104 は「人口千人当たり」で単位は件（％ではない）
        if (m.rateCode === "#K06101" || m.rateCode === "#K06104") {
          const perThousand = getSsds(rates, m.rateCode, "00000", year);
          rate = perThousand === null ? null : round(perThousand, 4);
        }
      }

      cube.set("cases", [m.code, year], cases === null ? null : round(cases, 0));
      cube.set("rate", [m.code, year], rate);
      cube.set("share", [m.code, year], share);
    }
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildType(counts: Table) {
  const codes = TYPE_CODES.map((c) => ({
    code: c.code,
    label: c.label,
    level: 1,
  }));
  const codeIds = TYPE_CODES.map((c) => c.code);
  const years = yearsInclusive(ERA_FROM, ERA_TO);

  const cube = new Cube(
    [
      { name: "code", codes: codeIds },
      { name: "year", codes: years },
    ],
    ["cases", "share", "clearance"],
  );

  for (const year of years) {
    const total = getSsds(counts, "K4201", "00000", year);
    const parts: Record<string, number | null> = {};
    let knownSum = 0;
    let knownAny = false;

    for (const c of TYPE_CODES) {
      if (c.residual || !c.countCode) continue;
      const v = getSsds(counts, c.countCode, "00000", year);
      parts[c.code] = v;
      if (v !== null) {
        knownAny = true;
        knownSum += v;
      }
    }

    const residual =
      total !== null && knownAny ? round(Math.max(0, total - knownSum), 0) : null;
    parts.other = residual;

    for (const c of TYPE_CODES) {
      const cases = parts[c.code] ?? null;
      cube.set("cases", [c.code, year], cases === null ? null : round(cases, 0));
      cube.set("share", [c.code, year], shareOf(cases, total));

      let clearance: number | null = null;
      if (c.clearCode && c.countCode) {
        const cleared = getSsds(counts, c.clearCode, "00000", year);
        clearance = shareOf(cleared, cases);
      }
      cube.set("clearance", [c.code, year], clearance);
    }
  }

  await writeJson("type", { ...cube.toJSON(), codes });
}

async function buildGeo(counts: Table, rates: Table) {
  const geoMetrics = METRICS.filter((m) => m.geo);
  const metrics = metricsDict(geoMetrics);
  const years = yearsInclusive(ERA_FROM, ERA_TO);
  const metricCodes = geoMetrics.map((m) => m.code);

  const areaAxis = counts.axis("地域");
  const areas: DictEntry[] = PREF_AREAS.map((code) => {
    if (code === "00000") return { code, label: "全国", level: 0 };
    const item = areaAxis.items.find((c) => c["@code"] === code);
    return { code, label: item?.["@name"] ?? code, level: 1 };
  });

  const cube = new Cube(
    [
      { name: "metric", codes: metricCodes },
      { name: "year", codes: years },
      { name: "area", codes: [...PREF_AREAS] },
    ],
    ["value", "relative"],
  );

  for (const year of years) {
    for (const m of geoMetrics) {
      const nationalRaw =
        m.rateCode === "#K06101" || m.rateCode === "#K06104"
          ? getSsds(rates, m.rateCode!, "00000", year)
          : m.rateCode
            ? ratePctToFrac(getSsds(rates, m.rateCode, "00000", year))
            : null;
      const national =
        m.rateCode === "#K06101" || m.rateCode === "#K06104"
          ? nationalRaw === null
            ? null
            : round(nationalRaw, 4)
          : nationalRaw;

      for (const area of PREF_AREAS) {
        let value: number | null = null;
        if (m.rateCode === "#K06101" || m.rateCode === "#K06104") {
          const v = getSsds(rates, m.rateCode, area, year);
          value = v === null ? null : round(v, 4);
        } else if (m.rateCode) {
          value = ratePctToFrac(getSsds(rates, m.rateCode, area, year));
        }
        const relative =
          value !== null && national !== null && national !== 0
            ? round(value / national, 4)
            : null;
        cube.set("value", [m.code, year, area], value);
        cube.set("relative", [m.code, year, area], relative);
      }
    }
  }

  await writeJson("geo", { ...cube.toJSON(), metrics, areas });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("load tables...");
  const counts = await loadTable("ssds-count");
  const rates = await loadTable("ssds-rate");
  console.log("build era...");
  await buildEra(counts, rates);
  console.log("build type...");
  await buildType(counts);
  console.log("build geo...");
  await buildGeo(counts, rates);
  console.log("done");
}

await main();
