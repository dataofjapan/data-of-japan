/**
 * 配信データの取得。
 */

import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

export type Sex = "total" | "male" | "female";
export type DayType = "week" | "weekday" | "saturday" | "sunday";

export interface EraData {
  activities: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface AgeData {
  activities: DictEntry[];
  ages: DictEntry[];
  cube: CubeView;
  years: string[];
}

export interface GeoData {
  activities: DictEntry[];
  areas: DictEntry[];
  cube: CubeView;
  years: string[];
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
  return chunk<CubeJson & { activities: DictEntry[] }, EraData>("era", (raw) => ({
    activities: raw.activities,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadAge(): Promise<AgeData> {
  return chunk<CubeJson & { activities: DictEntry[]; ages: DictEntry[] }, AgeData>(
    "age",
    (raw) => ({
      activities: raw.activities,
      ages: raw.ages,
      cube: new CubeView(raw),
      years: [...raw.dims.find((d) => d.name === "year")!.codes].reverse(),
    }),
  );
}

export function loadGeo(): Promise<GeoData> {
  return chunk<CubeJson & { activities: DictEntry[]; areas: DictEntry[] }, GeoData>(
    "geo",
    (raw) => ({
      activities: raw.activities,
      areas: raw.areas,
      cube: new CubeView(raw),
      years: [...raw.dims.find((d) => d.name === "year")!.codes].reverse(),
    }),
  );
}
