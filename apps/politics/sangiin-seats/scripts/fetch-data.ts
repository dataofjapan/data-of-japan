/** 同じリポジトリ内の得票・候補者データを data/sibling/ に同期する。 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const SIBLING_DIR = resolve(import.meta.dirname, "../data/sibling");
export const SIBLINGS = {
  timeseries: { directory: "sangiin-votes", files: ["era", "palette"] },
  candidates: { directory: "sangiin-candidates", files: ["national"] },
} satisfies Record<string, { directory: string; files: string[] }>;
export type Sibling = keyof typeof SIBLINGS;
export function siblingPath(site: Sibling, file: string): string {
  return resolve(SIBLING_DIR, site, `${file}.json`);
}
async function main(): Promise<void> {
  for (const site of ["timeseries", "candidates"] satisfies Sibling[]) {
    const { directory, files } = SIBLINGS[site];
    for (const file of files) {
      const source = resolve(import.meta.dirname, "../../", directory, "public/data", `${file}.json`);
      const content = await readFile(source, "utf8");
      const path = siblingPath(site, file);
      await mkdir(resolve(path, ".."), { recursive: true });
      await writeFile(path, content);
      console.log(`  ${site}/${file}.json`);
    }
  }
}
if (import.meta.main) await main();
