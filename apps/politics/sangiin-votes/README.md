# 参議院選挙で、どの党がどれだけ票を得てきたか

総務省「参議院議員通常選挙結果調」をもとに、2001年以降の通常選挙の党派別得票を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。
兄弟サイト: [衆議院選挙で、どの党がどれだけ票を得てきたか](/politics/elections/shugiin/votes/)（[election-shugiin-timeseries](https://github.com/visualizing-jp/election-shugiin-timeseries)）。

想定URL: /politics/elections/sangiin/votes/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 全国の党派別得票（第19〜27回、2001–2025）。選挙区／比例代表、得票率／得票数 |
| 選挙区 | 選挙区の都道府県別得票率と、選んだ県の推移 |
| 比例代表 | 比例代表の都道府県別得票率と、選んだ県の推移 |

データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## 開発

```bash
npm install
npm run fetch && npm run normalize && npm run verify && npm run data
npm run dev
```

| スクリプト | 内容 |
| --- | --- |
| `npm run fetch` | 総務省の結果ページの表（HTML / PDF / Excel）を `data/raw/` に取得 |
| `npm run normalize` | 回ごとの正規化 JSON を `data/normalized/` に書き出す（第20回の PDF には poppler の `pdftotext` が要る） |
| `npm run verify` | 合計・都道府県の和・全国表・確定値との突合 |
| `npm run data` | 正規化 JSON から配信用 JSON を `public/data/` に書き出す |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

配色のルールは `src/lib/data/palette.ts`（色相＝党、明度＝量、CIE HCL）。衆議院のシリーズに出た党は衆議院と同じ色相（`data/shugiin-palette.json`）、参議院にだけ出た党の色相は `npm run data` が全国の得票から決めて `public/data/palette.json` に書く。見分けやすさの確認は `node scripts/palette-check.ts > .tmp-screenshots/palette.html`。

`data/normalized/`・`data/shugiin-palette.json`・`public/data/` は追跡する。

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `election-sangiin-timeseries.visualizing.jp` は `public/CNAME` に置いた。Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
- Google Analytics の測定ID（`src/app/analytics.ts`）はシリーズ共通（表紙 japan-election と同じ）。
