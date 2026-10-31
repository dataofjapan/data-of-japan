/**
 * 配信データの取得。
 */

import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

export type Sex = "total" | "male" | "female";

export interface EraData {
  metrics: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface StatusData {
  forms: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface AttrsData {
  ages: DictEntry[];
  cube: CubeView;
  years: number[];
}

const cache = new Map<string, Promise<unknown>>();

function chunk<Raw, T>(name: string, transform: (raw: Raw) => T): Promise<T> {
  const hit = cache.get(name);
  if (hit !== undefined) return hit as Promise<T>;
  const promise = fetch(`${import.meta.env.BASE_URL}data/${name}.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`${name}.json の取得に失敗しました (${r.status})`);
      return r.json() as Promise<Raw>;
    })
    .then(transform);
  cache.set(name, promise);
  return promise;
}

export function loadEra(): Promise<EraData> {
  return chunk<CubeJson & { metrics: DictEntry[] }, EraData>("era", (raw) => ({
    metrics: raw.metrics,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadStatus(): Promise<StatusData> {
  return chunk<CubeJson & { forms: DictEntry[] }, StatusData>("status", (raw) => ({
    forms: raw.forms,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadAttrs(): Promise<AttrsData> {
  return chunk<CubeJson & { ages: DictEntry[] }, AttrsData>("attrs", (raw) => ({
    ages: raw.ages,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}
