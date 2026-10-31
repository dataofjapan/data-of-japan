import { readdir, readFile, stat } from 'node:fs/promises';
import { root, sites } from './sites.mjs';
const dist=new URL('dist/',root); let count=0;
async function walk(dir) {
 for (const entry of await readdir(dir,{withFileTypes:true})) {
  const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);
  if(entry.isDirectory()){await walk(url);continue;}
  if(entry.name!=='index.html')continue;
  count++;const html=await readFile(url,'utf8');
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
for (const dir of ['portal/society','portal/governors','portal/elections']) {
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
