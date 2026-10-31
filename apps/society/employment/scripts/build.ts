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
  ATTR_AGE_CODES,
  ERA_METRICS,
  SEX_LABEL_LFS,
  STATUS_FORMS,
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

function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total === 0) return null;
  return round(part / total, 4);
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

async function buildEra(rates: Table, status: Table, form: Table) {
  const metrics: DictEntry[] = ERA_METRICS.map((m) => ({
    code: m.code,
    label: m.label,
    level: 1,
    parent: m.group,
  }));

  const yearMap = new Map<string, string>();
  for (const y of yearsOf(rates)) yearMap.set(y.year, y.code);
  for (const y of yearsOf(status)) yearMap.set(y.year, yearMap.get(y.year) ?? y.code);
  for (const y of yearsOf(form)) yearMap.set(y.year, yearMap.get(y.year) ?? y.code);
  const years = [...yearMap.keys()].sort();

  const cube = new Cube(
    [
      { name: "metric", codes: ERA_METRICS.map((m) => m.code) },
      { name: "sex", codes: [...SEXES] },
      { name: "year", codes: years },
    ],
    ["value", "workers"],
  );

  const rateTab = rates.axis("表章項目").items[0]!["@code"];
  const statusTab = status.axis("表章項目").items[0]!["@code"];
  const formTab = form.axis("表章項目").items[0]!["@code"];
  const ageAllRates = rates.codeOf("年齢階級", "15歳以上");
  const ageAllForm = form.codeOf("年齢階級", "15歳以上");
  const indAllStatus = status.codeOf("産業", "全産業");
  const indAllForm = form.codeOf("産業分類", "全産業");
  const statusTotal = status.codeOf("従業上の地位", "総数");

  const rateState = {
    lfpr: rates.codeOf("就業状態", "労働力人口"),
    emp_rate: rates.codeOf("就業状態", "就業"),
    unemp_rate: rates.codeOf("就業状態", "完全失業者"),
  } as const;

  const statusCodes = {
    self_employed: status.codeOf("従業上の地位", "自営業主"),
    family: status.codeOf("従業上の地位", "家族従業者"),
    employee: status.codeOf("従業上の地位", "雇用者"),
  } as const;

  const formCodes = {
    regular: form.codeOf("雇用形態", "正規の職員・従業員"),
    nonregular: form.codeOf("雇用形態", "非正規の職員・従業員"),
    ex_exec: form.codeOf("雇用形態", "役員を除く雇用者"),
  } as const;

  for (const sex of SEXES) {
    for (const year of years) {
      const rateTime = yearsOf(rates).find((y) => y.year === year)?.code;
      const statusTime = yearsOf(status).find((y) => y.year === year)?.code;
      const formTime = yearsOf(form).find((y) => y.year === year)?.code;

      for (const [metric, stateCode] of Object.entries(rateState)) {
        const value =
          rateTime === undefined
            ? null
            : rateFrac(
                rates.get({
                  表章項目: rateTab,
                  産業: rates.codeOf("産業", "全産業"),
                  性別: sexCode(rates, sex),
                  就業状態: stateCode,
                  年齢階級: ageAllRates,
                  地域: "00000",
                  時間軸: rateTime,
                }),
              );
        cube.set("value", [metric, sex, year], value);
        cube.set("workers", [metric, sex, year], null);
      }

      if (statusTime !== undefined) {
        const total = status.get({
          表章項目: statusTab,
          産業: indAllStatus,
          従業上の地位: statusTotal,
          性別: sexCode(status, sex),
          地域: "00000",
          時間軸: statusTime,
        });
        for (const [metric, code] of Object.entries(statusCodes)) {
          const workers = status.get({
            表章項目: statusTab,
            産業: indAllStatus,
            従業上の地位: code,
            性別: sexCode(status, sex),
            地域: "00000",
            時間軸: statusTime,
          });
          cube.set("workers", [metric, sex, year], workers);
          cube.set("value", [metric, sex, year], shareOf(workers, total));
        }
      } else {
        for (const metric of Object.keys(statusCodes)) {
          cube.set("workers", [metric, sex, year], null);
          cube.set("value", [metric, sex, year], null);
        }
      }

      if (formTime !== undefined) {
        const exExec = form.get({
          表章項目: formTab,
          産業分類: indAllForm,
          性別: sexCode(form, sex),
          雇用形態: formCodes.ex_exec,
          年齢階級: ageAllForm,
          地域: "00000",
          時間軸: formTime,
        });
        for (const metric of ["regular", "nonregular"] as const) {
          const workers = form.get({
            表章項目: formTab,
            産業分類: indAllForm,
            性別: sexCode(form, sex),
            雇用形態: formCodes[metric],
            年齢階級: ageAllForm,
            地域: "00000",
            時間軸: formTime,
          });
          cube.set("workers", [metric, sex, year], workers);
          cube.set("value", [metric, sex, year], shareOf(workers, exExec));
        }
      } else {
        cube.set("workers", ["regular", sex, year], null);
        cube.set("value", ["regular", sex, year], null);
        cube.set("workers", ["nonregular", sex, year], null);
        cube.set("value", ["nonregular", sex, year], null);
      }
    }
  }

  await writeJson("era", { ...cube.toJSON(), metrics });
}

async function buildStatus(status: Table, form: Table) {
  const forms: DictEntry[] = STATUS_FORMS.map((f) => ({
    code: f.code,
    label: f.label,
    level: f.level,
    parent: f.group,
  }));

  const yearMap = new Map<string, string>();
  for (const y of yearsOf(status)) yearMap.set(y.year, y.code);
  for (const y of yearsOf(form)) yearMap.set(y.year, yearMap.get(y.year) ?? y.code);
  const years = [...yearMap.keys()].sort();

  const cube = new Cube(
    [
      { name: "form", codes: STATUS_FORMS.map((f) => f.code) },
      { name: "sex", codes: [...SEXES] },
      { name: "year", codes: years },
    ],
    ["workers", "share"],
  );

  const statusTab = status.axis("表章項目").items[0]!["@code"];
  const formTab = form.axis("表章項目").items[0]!["@code"];
  const indAllStatus = status.codeOf("産業", "全産業");
  const indAllForm = form.codeOf("産業分類", "全産業");
  const statusTotal = status.codeOf("従業上の地位", "総数");
  const ageAllForm = form.codeOf("年齢階級", "15歳以上");
  const exExec = form.codeOf("雇用形態", "役員を除く雇用者");
  const nonreg = form.codeOf("雇用形態", "非正規の職員・従業員");

  for (const sex of SEXES) {
    for (const year of years) {
      const statusTime = yearsOf(status).find((y) => y.year === year)?.code;
      const formTime = yearsOf(form).find((y) => y.year === year)?.code;

      const employedTotal =
        statusTime === undefined
          ? null
          : status.get({
              表章項目: statusTab,
              産業: indAllStatus,
              従業上の地位: statusTotal,
              性別: sexCode(status, sex),
              地域: "00000",
              時間軸: statusTime,
            });

      const exExecTotal =
        formTime === undefined
          ? null
          : form.get({
              表章項目: formTab,
              産業分類: indAllForm,
              性別: sexCode(form, sex),
              雇用形態: exExec,
              年齢階級: ageAllForm,
              地域: "00000",
              時間軸: formTime,
            });

      const nonregTotal =
        formTime === undefined
          ? null
          : form.get({
              表章項目: formTab,
              産業分類: indAllForm,
              性別: sexCode(form, sex),
              雇用形態: nonreg,
              年齢階級: ageAllForm,
              地域: "00000",
              時間軸: formTime,
            });

      for (const f of STATUS_FORMS) {
        let workers: number | null = null;
        if (f.statusCode !== undefined && statusTime !== undefined) {
          workers = status.get({
            表章項目: statusTab,
            産業: indAllStatus,
            従業上の地位: f.statusCode,
            性別: sexCode(status, sex),
            地域: "00000",
            時間軸: statusTime,
          });
        } else if (f.formCode !== undefined && formTime !== undefined) {
          workers = form.get({
            表章項目: formTab,
            産業分類: indAllForm,
            性別: sexCode(form, sex),
            雇用形態: f.formCode,
            年齢階級: ageAllForm,
            地域: "00000",
            時間軸: formTime,
          });
        }

        const denom =
          f.shareOf === "employed"
            ? employedTotal
            : f.shareOf === "ex_exec"
              ? exExecTotal
              : nonregTotal;

        cube.set("workers", [f.code, sex, year], workers);
        cube.set("share", [f.code, sex, year], shareOf(workers, denom));
      }
    }
  }

  await writeJson("status", { ...cube.toJSON(), forms });
}

async function buildAttrs(rates: Table, form: Table) {
  const rateAge = rates.axis("年齢階級");
  const ages: DictEntry[] = ATTR_AGE_CODES.map((code) => {
    const item = rateAge.byCode.get(code);
    if (item === undefined) throw new Error(`年齢コード ${code} がない`);
    return {
      code,
      label: shortAgeLabel(item["@name"]),
      level: Number(item["@level"] || 1),
    };
  });

  const yearMap = new Map<string, string>();
  for (const y of yearsOf(rates)) yearMap.set(y.year, y.code);
  for (const y of yearsOf(form)) yearMap.set(y.year, yearMap.get(y.year) ?? y.code);
  const years = [...yearMap.keys()].sort();

  const cube = new Cube(
    [
      { name: "age", codes: ages.map((a) => a.code) },
      { name: "sex", codes: [...SEXES] },
      { name: "year", codes: years },
    ],
    ["empRate", "unempRate", "lfpr", "regular", "nonregular", "nonregularShare"],
  );

  const rateTab = rates.axis("表章項目").items[0]!["@code"];
  const formTab = form.axis("表章項目").items[0]!["@code"];
  const indAllForm = form.codeOf("産業分類", "全産業");
  const lfpr = rates.codeOf("就業状態", "労働力人口");
  const emp = rates.codeOf("就業状態", "就業");
  const unemp = rates.codeOf("就業状態", "完全失業者");
  const regular = form.codeOf("雇用形態", "正規の職員・従業員");
  const nonregular = form.codeOf("雇用形態", "非正規の職員・従業員");
  const exExec = form.codeOf("雇用形態", "役員を除く雇用者");

  const formAgeAxis = form.axis("年齢階級");

  for (const age of ages) {
    for (const sex of SEXES) {
      for (const year of years) {
        const rateTime = yearsOf(rates).find((y) => y.year === year)?.code;
        const formTime = yearsOf(form).find((y) => y.year === year)?.code;

        if (rateTime !== undefined) {
          const base = {
            表章項目: rateTab,
            産業: rates.codeOf("産業", "全産業"),
            性別: sexCode(rates, sex),
            年齢階級: age.code,
            地域: "00000",
            時間軸: rateTime,
          };
          cube.set(
            "lfpr",
            [age.code, sex, year],
            rateFrac(rates.get({ ...base, 就業状態: lfpr })),
          );
          cube.set(
            "empRate",
            [age.code, sex, year],
            rateFrac(rates.get({ ...base, 就業状態: emp })),
          );
          cube.set(
            "unempRate",
            [age.code, sex, year],
            rateFrac(rates.get({ ...base, 就業状態: unemp })),
          );
        } else {
          cube.set("lfpr", [age.code, sex, year], null);
          cube.set("empRate", [age.code, sex, year], null);
          cube.set("unempRate", [age.code, sex, year], null);
        }

        const formAgeItem = formAgeAxis.byCode.get(age.code);
        if (formTime !== undefined && formAgeItem !== undefined) {
          const base = {
            表章項目: formTab,
            産業分類: indAllForm,
            性別: sexCode(form, sex),
            年齢階級: age.code,
            地域: "00000",
            時間軸: formTime,
          };
          const reg = form.get({ ...base, 雇用形態: regular });
          const nr = form.get({ ...base, 雇用形態: nonregular });
          const ex = form.get({ ...base, 雇用形態: exExec });
          cube.set("regular", [age.code, sex, year], reg);
          cube.set("nonregular", [age.code, sex, year], nr);
          cube.set("nonregularShare", [age.code, sex, year], shareOf(nr, ex));
        } else {
          cube.set("regular", [age.code, sex, year], null);
          cube.set("nonregular", [age.code, sex, year], null);
          cube.set("nonregularShare", [age.code, sex, year], null);
        }
      }
    }
  }

  await writeJson("attrs", { ...cube.toJSON(), ages });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("build employment cubes");
  const rates = await loadTable("rates-age");
  const status = await loadTable("status");
  const form = await loadTable("form-age");
  await buildEra(rates, status, form);
  await buildStatus(status, form);
  await buildAttrs(rates, form);
}

await main();
