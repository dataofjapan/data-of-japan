/**
 * 配信データの取得。
 */

import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

export interface EraData {
  diseases: DictEntry[];
  settings: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface DiseaseData {
  diseases: DictEntry[];
  ages: DictEntry[];
  sexes: DictEntry[];
  cube: CubeView;
  surveyYear: string;
}

export interface GeoData {
  diseases: DictEntry[];
  areas: DictEntry[];
  settings: DictEntry[];
  cube: CubeView;
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
  return chunk<
    CubeJson & { diseases: DictEntry[]; settings: DictEntry[] },
    EraData
  >("era", (raw) => ({
    diseases: raw.diseases,
    settings: raw.settings,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadDisease(): Promise<DiseaseData> {
  return chunk<
    CubeJson & {
      diseases: DictEntry[];
      ages: DictEntry[];
      sexes: DictEntry[];
      surveyYear: string;
    },
    DiseaseData
  >("disease", (raw) => ({
    diseases: raw.diseases,
    ages: raw.ages,
    sexes: raw.sexes,
    cube: new CubeView(raw),
    surveyYear: raw.surveyYear,
  }));
}

export function loadGeo(): Promise<GeoData> {
  return chunk<
    CubeJson & { diseases: DictEntry[]; areas: DictEntry[]; settings: DictEntry[] },
    GeoData
  >("geo", (raw) => ({
    diseases: raw.diseases,
    areas: raw.areas,
    settings: raw.settings,
    cube: new CubeView(raw),
  }));
}
