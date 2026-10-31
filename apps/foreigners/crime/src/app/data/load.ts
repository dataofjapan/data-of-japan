import type { CrimeJson } from "../../lib/data/cube.ts";

let cache: Promise<CrimeJson> | null = null;

export function loadCrime(): Promise<CrimeJson> {
  cache ??= fetch(`${import.meta.env.BASE_URL}data/crime.json`).then((r) => {
    if (!r.ok) throw new Error(`crime.json の取得に失敗しました (${r.status})`);
    return r.json() as Promise<CrimeJson>;
  });
  return cache;
}
