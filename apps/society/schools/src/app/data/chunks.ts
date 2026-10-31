/**
 * 配信データの取得。
 */

import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

export interface EraData {
  paths: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface SchoolData {
  schools: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface GenderData {
  schools: DictEntry[];
  sexes: DictEntry[];
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
  return chunk<CubeJson & { paths: DictEntry[] }, EraData>("era", (raw) => ({
    paths: raw.paths,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadSchool(): Promise<SchoolData> {
  return chunk<CubeJson & { schools: DictEntry[] }, SchoolData>("school", (raw) => ({
    schools: raw.schools,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadGender(): Promise<GenderData> {
  return chunk<
    CubeJson & { schools: DictEntry[]; sexes: DictEntry[] },
    GenderData
  >("gender", (raw) => ({
    schools: raw.schools,
    sexes: raw.sexes,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}
