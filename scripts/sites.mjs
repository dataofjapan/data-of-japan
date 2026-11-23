import { readFile } from 'node:fs/promises';
export const root = new URL('../', import.meta.url);
export const sites = JSON.parse(await readFile(new URL('sites.json', root), 'utf8'));
export const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export const sections = [
  { path: '/politics/', shortName: '政治', icon: 'politics', description: '衆議院・参議院・都道府県知事の選挙から、日本の政治の変化をたどります。' },
  { path: '/society/', shortName: '社会・経済', icon: 'society', description: '人口、暮らし、教育、雇用、司法などの公的統計を図から読み解きます。' },
  { path: '/foreigners/', shortName: '外国人', icon: 'foreigners', description: '訪日・在留資格・就労・消費・宿泊・検挙の公的統計をたどります。' },
  { path: '/industry/', shortName: '産業', icon: 'industry', description: '全国と都道府県のエネルギー供給・消費の変化をたどります。' },
];
const sectionLinks = sections.map(section =>
  `<a href="${escape(section.path)}">${escape(section.shortName)}</a>`
).join('');
export const nav = `<nav class="doj-nav" aria-label="サイト共通"><a href="/">Data of Japan</a>${sectionLinks}</nav>`;
export const style = '.doj-nav{display:flex;flex-wrap:wrap;gap:12px 24px;padding:14px 5%;background:#f5f2eb;color:#242b35;font:14px system-ui;border-bottom:1px solid #cfc9bd}.doj-nav a{color:inherit;text-decoration:underline;text-underline-offset:4px}.doj-nav a:first-child{font-weight:700;margin-right:auto}';
