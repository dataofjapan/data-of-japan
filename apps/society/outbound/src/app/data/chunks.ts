import { CubeView, type CubeJson, type DictEntry } from "./cube.ts";

function chunk<T, R>(url: string, map: (raw: T) => R): Promise<R> {
  return fetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return map((await res.json()) as T);
  });
}

export interface EraData {
  years: string[];
  cube: CubeView;
}

export interface WhoData {
  years: string[];
  areas: DictEntry[];
  sexes: DictEntry[];
  ages: DictEntry[];
  cube: CubeView;
}

export interface StayData {
  years: string[];
  durations: DictEntry[];
  sexes: DictEntry[];
  ages: DictEntry[];
  cube: CubeView;
}

export interface PurposeData {
  years: string[];
  destinations: DictEntry[];
  purposes: DictEntry[];
  cube: CubeView;
}

let eraP: Promise<EraData> | undefined;
let whoP: Promise<WhoData> | undefined;
let stayP: Promise<StayData> | undefined;
let purposeP: Promise<PurposeData> | undefined;

export function loadEra(): Promise<EraData> {
  eraP ??= chunk<CubeJson & { years: string[] }, EraData>("/society/outbound/data/era.json", (raw) => ({
    years: raw.years,
    cube: new CubeView(raw),
  }));
  return eraP;
}

export function loadWho(): Promise<WhoData> {
  whoP ??= chunk<CubeJson & Omit<WhoData, "cube">, WhoData>("/society/outbound/data/who.json", (raw) => ({
    years: raw.years,
    areas: raw.areas,
    sexes: raw.sexes,
    ages: raw.ages,
    cube: new CubeView(raw),
  }));
  return whoP;
}

export function loadStay(): Promise<StayData> {
  stayP ??= chunk<CubeJson & Omit<StayData, "cube">, StayData>("/society/outbound/data/stay.json", (raw) => ({
    years: raw.years,
    durations: raw.durations,
    sexes: raw.sexes,
    ages: raw.ages,
    cube: new CubeView(raw),
  }));
  return stayP;
}

export function loadPurpose(): Promise<PurposeData> {
  purposeP ??= chunk<CubeJson & Omit<PurposeData, "cube">, PurposeData>("/society/outbound/data/purpose.json", (raw) => ({
    years: raw.years,
    destinations: raw.destinations,
    purposes: raw.purposes,
    cube: new CubeView(raw),
  }));
  return purposeP;
}
