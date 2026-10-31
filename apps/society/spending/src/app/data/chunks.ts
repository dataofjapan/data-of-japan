/**
 * 配信データの取得。
 */

import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

export interface EraData {
  items: DictEntry[];
  cube: CubeView;
  years: number[];
}

export interface ItemData {
  items: DictEntry[];
  cube: CubeView;
  years: string[];
}

export interface AttrsData {
  ages: DictEntry[];
  items: DictEntry[];
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
  return chunk<CubeJson & { items: DictEntry[] }, EraData>("era", (raw) => ({
    items: raw.items,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}

export function loadItem(): Promise<ItemData> {
  return chunk<CubeJson & { items: DictEntry[] }, ItemData>("item", (raw) => ({
    items: raw.items,
    cube: new CubeView(raw),
    years: [...raw.dims.find((d) => d.name === "year")!.codes].reverse(),
  }));
}

export function loadAttrs(): Promise<AttrsData> {
  return chunk<
    CubeJson & { ages: DictEntry[]; items: DictEntry[] },
    AttrsData
  >("attrs", (raw) => ({
    ages: raw.ages,
    items: raw.items,
    cube: new CubeView(raw),
    years: raw.dims.find((d) => d.name === "year")!.codes.map(Number),
  }));
}
