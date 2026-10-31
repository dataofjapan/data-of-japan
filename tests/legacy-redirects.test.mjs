import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const sites = JSON.parse(await readFile(new URL('sites.json',root),'utf8'));
const config = JSON.parse(await readFile(new URL('vercel.json',root),'utf8'));
test('every migrated site has an exact host redirect to its own new path',()=>{
 const hosts=new Set();
 for(const site of sites){
  assert.ok(site.legacyHost);assert.ok(!hosts.has(site.legacyHost));hosts.add(site.legacyHost);
  const matches=config.redirects.filter(r=>r.has?.some(c=>c.type==='host'&&c.value===site.legacyHost));
  assert.equal(matches.length,1);
  assert.equal(matches[0].source,'/:path(.*)');
  assert.equal(matches[0].destination,`https://data-of-japan.org${site.path}:path`);
  assert.equal(matches[0].permanent,true);
 }
 assert.equal(hosts.size,40);
});
test('unmigrated visualizing.jp content is not redirected',()=>{
 for(const host of ['visualizing.jp','www.visualizing.jp','japan-data-death.visualizing.jp'])assert.ok(!config.redirects.some(r=>r.has?.some(c=>c.type==='host'&&c.value===host)));
});
