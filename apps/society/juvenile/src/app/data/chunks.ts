/**
 * 配信データの取得。
 */

import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

export interface EraData {
  metrics: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface AgeData {
  codes: DictEntry[];
  offenses: { code: string; label: string; persons: number; share: number }[];
  cube: CubeView;
  years: string[];
}

export interface DispositionData {
  codes: DictEntry[];
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
  return chunk<CubeJson & { metrics: DictEntry[] }, EraData>("era", (raw) => ({
    metrics: raw.metrics,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadAge(): Promise<AgeData> {
  return chunk<
    CubeJson & {
      codes: DictEntry[];
      offenses: AgeData["offenses"];
    },
    AgeData
  >("age", (raw) => ({
    codes: raw.codes,
    offenses: raw.offenses,
    cube: new CubeView(raw),
    years: [...raw.dims.find((d) => d.name === "year")!.codes].reverse(),
  }));
}

export function loadDisposition(): Promise<DispositionData> {
  return chunk<CubeJson & { codes: DictEntry[] }, DispositionData>("disposition", (raw) => ({
    codes: raw.codes,
    cube: new CubeView(raw),
    years: [...raw.dims.find((d) => d.name === "year")!.codes].reverse(),
  }));
}
