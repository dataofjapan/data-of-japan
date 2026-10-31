import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sites, root } from './sites.mjs';
for (const site of sites) {
  console.log(`Installing ${site.directory}`);
  const result = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: fileURLToPath(new URL(site.directory + '/', root)), stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
