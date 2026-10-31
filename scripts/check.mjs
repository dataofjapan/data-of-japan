import { readdir, readFile, stat } from 'node:fs/promises';
import { root, sites } from './sites.mjs';
const dist=new URL('dist/',root); let count=0;
async function walk(dir) {
 for (const entry of await readdir(dir,{withFileTypes:true})) {
  const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);
  if(entry.isDirectory()){await walk(url);continue;}
  if(entry.name!=='index.html')continue;
  count++;const html=await readFile(url,'utf8');
  if ([...html.matchAll(/src="\/analytics\.js"/g)].length !== 1) throw Error(`Expected one shared analytics script in ${url.pathname}`);
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
   const file=new URL('.'+href,dist);
   const info=await stat(file).catch(()=>null);
   if(!info)throw Error(`Missing ${href} linked from ${url.pathname}`);
   if(info.isDirectory())await stat(new URL('index.html',file.href.replace(/\/?$/,'/')));
  }
  if(/https:\/\/(?:japan-data|election-|governor-election|japan-election)[^"\s]*\.visualizing\.jp/.test(html))throw Error(`Legacy URL in ${url.pathname}`);
 }
}
if(new Set(sites.map(s=>s.path)).size!==sites.length)throw Error('Duplicate site paths');
await walk(dist);
for(const s of sites)await stat(new URL('.'+s.path+'index.html',dist));
console.log(`Verified ${count} pages and their local assets/links.`);
for (const dir of ['portal/society','portal/governors','portal/elections','portal/foreigners','portal/industry']) {
 const catalog = await import(new URL(dir+'/src/catalog.ts',root));
 for(const items of Object.values(catalog)) {
  if(!Array.isArray(items))continue;
  for(const item of items) {
   for(const value of [item.url,item.art,item.site?.url]) {
    if(typeof value==='string'&&value.startsWith('/'))await stat(new URL('.'+value,dist));
   }
  }
 }
}
console.log('Verified catalog destinations and artwork.');
// The original election landing page must survive the aggregate build.
const elections = await readFile(new URL('politics/elections/index.html', dist), 'utf8');
if (!elections.includes('type="module"') || !elections.includes('/politics/elections/assets/')) {
  throw Error('Election cards were replaced by a generated link list');
}
for (const [path, count] of [['', 4], ['politics/', 1], ['politics/elections/shugiin/', 4], ['politics/elections/sangiin/', 4]]) {
  const html = await readFile(new URL(path + 'index.html', dist), 'utf8');
  const icons = [...html.matchAll(/<svg /g)].length;
  const descriptions = [...html.matchAll(/class="card-description"/g)].length;
  if (icons !== count || descriptions !== count) throw Error(`Missing entry icons or descriptions at /${path}`);
}
console.log('Verified entry icons, descriptions, and the original election landing page.');
