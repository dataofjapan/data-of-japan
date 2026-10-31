import { readFile } from 'node:fs/promises';
export const root = new URL('../', import.meta.url);
export const sites = JSON.parse(await readFile(new URL('sites.json', root), 'utf8'));
export const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export const nav = '<nav class="doj-nav" aria-label="サイト共通"><a href="/">Data of Japan</a><a href="/politics/">政治</a><a href="/politics/elections/">選挙</a><a href="/society/">社会・経済</a><a href="/foreigners/">外国人</a><a href="/industry/">産業</a></nav>';
export const style = '.doj-nav{display:flex;flex-wrap:wrap;gap:12px 24px;padding:14px 5%;background:#f5f2eb;color:#242b35;font:14px system-ui;border-bottom:1px solid #cfc9bd}.doj-nav a{color:inherit;text-decoration:underline;text-underline-offset:4px}.doj-nav a:first-child{font-weight:700;margin-right:auto}';
