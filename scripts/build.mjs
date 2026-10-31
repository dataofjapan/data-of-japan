import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { CATALOG } from '../portal/elections/src/catalog.ts';
import { MARKS } from '../portal/elections/src/marks.ts';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, sites, nav, style, escape } from './sites.mjs';
const require = createRequire(new URL('../portal/elections/package.json', import.meta.url));
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const measurementId = process.env.GA4_MEASUREMENT_ID || '';
if (measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) throw Error('Invalid GA4_MEASUREMENT_ID');
const environment = process.env.VERCEL_ENV || 'production';
const analytics = `<script defer src="/analytics.js" data-measurement-id="${measurementId}" data-environment="${escape(environment)}"></script>`;
const dist = new URL('dist/', root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const site of sites) {
  console.log(`Building ${site.path}`);
  const cwd = new URL(site.directory + '/', root);
  const result = spawnSync('npm', ['run', 'build', '--', '--base', site.path, '--configLoader', 'runner'], { cwd: fileURLToPath(cwd), stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  const target = new URL('.' + site.path, dist);
  await mkdir(target, { recursive: true });
  await cp(new URL('dist/', cwd), target, { recursive: true });
  const index = new URL('index.html', target);
  let html = await readFile(index, 'utf8');
  html = html.replace('</head>', `<style>${style}</style>${analytics}</head>`).replace(/<body([^>]*)>/, `<body$1>${nav}`);
  await writeFile(index, html);
}
function card(item) {
  const entry = CATALOG.find(entry => entry.url === item.path);
  const content = { ...item, ...entry };
  const Icon = MARKS[content.icon || content.slug];
  const icon = Icon ? renderToStaticMarkup(createElement(Icon, { 'aria-hidden': true, strokeWidth: 1, width: 80, height: 80 })) : '';
  const artwork = icon ? `<div class="card-art">${icon}</div>` : '';
  const description = content.description ? `<p class="card-description">${escape(content.description)}</p>` : '';
  const source = content.source ? `<p class="card-source">${escape(content.source)}${content.period !== '—' ? ' · '+escape(content.period) : ''}</p>` : '';
  return `<li><a class="portal-card" href="${escape(content.path)}">${artwork}<h2>${escape(content.title)}</h2>${description}${source}</a></li>`;
}
function page(path, title, description, items) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} — Data of Japan</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="https://data-of-japan.org${path}">${analytics}<style>${style}body{margin:0;background:#faf8f3;color:#242b35;font-family:system-ui}main{max-width:1000px;margin:auto;padding:64px 24px}h1{font-family:serif;font-size:clamp(32px,6vw,60px)}p{line-height:1.9}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:20px}li a{display:block;padding:24px;border:1px solid #ccc5b8;color:inherit;text-decoration:none;line-height:1.8}li a:hover,li a:focus-visible{background:#eee9dd}.portal-card{height:100%;box-sizing:border-box}.card-art{aspect-ratio:8/5;background:#ededea;display:flex;align-items:center;justify-content:center;margin-bottom:20px}.card-art svg,.card-art svg *{vector-effect:non-scaling-stroke}.portal-card h2{font-family:serif;font-size:20px;line-height:1.7;margin:0}.card-description{font-size:14px;color:#6f6a61;margin:12px 0 0}.card-source{font-size:12px;color:#6f6a61;margin:12px 0 0}footer{margin-top:64px;border-top:1px solid #ccc5b8;padding-top:24px}</style></head><body>${nav}<main><p>DATA OF JAPAN</p><h1>${escape(title)}</h1><p>${escape(description)}</p><ul>${items.map(card).join('')}</ul>${path === '/' ? '' : '<footer><a href="https://github.com/dataofjapan/data-of-japan">GitHub · データと実装</a></footer>'}</main></body></html>`;
}
const privacy = {path:'/privacy/',title:'アクセス解析について',description:'本サイトは、公開後の利用状況を把握して改善するためにGoogle Analytics 4を使用します。Cookieを利用して閲覧ページや画面の切り替えなどの利用情報をGoogleへ送信します。氏名やメールアドレスの入力を求める計測は行いません。Google Signalsと広告パーソナライズ用のシグナルは無効にしています。URLのフィルター値は計測から除外し、ビュー名と流入キャンペーンの情報のみを残します。',items:[{path:'https://policies.google.com/privacy?hl=ja',title:'Googleのプライバシーポリシー'},{path:'https://tools.google.com/dlpage/gaoptout?hl=ja',title:'Google Analyticsオプトアウトアドオン'}]};
const portals = [
 {path:'/',title:'データで見る日本',description:'政治、暮らし、社会・経済の変化を、データから読み解く。',items:[{path:'/politics/',title:'政治 — 選挙から見る日本',icon:'politics',description:'衆議院・参議院・都道府県知事の選挙から、日本の政治の変化をたどります。'},{path:'/society/',title:'社会・経済 — 暮らしの変化をたどる',icon:'society',description:'人口、暮らし、教育、雇用、司法などの公的統計を図から読み解きます。'}]},
 {path:'/politics/',title:'政治',description:'国政選挙と知事選挙の記録から、日本の政治を読み解く。',items:[{path:'/politics/elections/',title:'選挙 — 衆議院・参議院・都道府県知事',icon:'politics',description:'得票・候補者・投票率・議席の可視化と、都道府県ごとの知事選挙を一覧できます。'}]},
 ...['shugiin','sangiin'].map(chamber=>({path:`/politics/elections/${chamber}/`,title:chamber==='shugiin'?'衆議院選挙':'参議院選挙',description:'得票・候補者・投票率・議席の変化を探索する。',items:CATALOG.filter(entry=>entry.category===chamber && entry.url!==null).map(entry=>({path:entry.url,title:entry.title}))}))
];
portals.push(privacy);
for (const p of portals) { const dir=new URL('.'+p.path,dist); await mkdir(dir,{recursive:true}); await writeFile(new URL('index.html',dir),page(p.path,p.title,p.description,p.items)); }
await writeFile(new URL('404.html',dist),page('/404.html','ページが見つかりません','一覧からコンテンツをお探しください。',portals[0].items));
const paths=[...new Set([...sites,...portals].map(s=>s.path))];
await writeFile(new URL('sitemap.xml',dist),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>`<url><loc>https://data-of-japan.org${p}</loc></url>`).join('')+'</urlset>');
await writeFile(new URL('robots.txt',dist),'User-agent: *\nAllow: /\nSitemap: https://data-of-japan.org/sitemap.xml\n');
await cp(new URL('public/analytics.js', root), new URL('analytics.js', dist));
console.log(`Built ${paths.length} routes. GA4: ${measurementId || 'disabled (no ID configured)'}`);
