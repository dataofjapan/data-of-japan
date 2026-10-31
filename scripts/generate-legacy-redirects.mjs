import { readFile, writeFile } from 'node:fs/promises';
import { root, sites } from './sites.mjs';
const configFile = new URL('vercel.json', root);
const config = JSON.parse(await readFile(configFile, 'utf8'));
const current = (config.redirects || []).filter(rule => !rule.has?.some(condition => condition.type === 'host' && condition.value.endsWith('.visualizing.jp')));
const hosts = new Set();
for (const site of sites) {
  if (!site.legacyHost) continue;
  if (!/^[a-z0-9-]+\.visualizing\.jp$/.test(site.legacyHost) || hosts.has(site.legacyHost)) throw Error(`Invalid or duplicate legacy host: ${site.legacyHost}`);
  hosts.add(site.legacyHost);
  current.push({ source: '/:path(.*)', has: [{type:'host', value:site.legacyHost}], destination: `https://data-of-japan.org${site.path}:path`, permanent:true });
}
config.redirects = current;
await writeFile(configFile, JSON.stringify(config, null, 2)+'\n');
console.log(`Generated ${hosts.size} legacy host redirects.`);
