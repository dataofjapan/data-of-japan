# 参議院選挙で、誰が立候補し、誰が当選したか

総務省「参議院議員通常選挙結果調」をもとに、2001年以降の通常選挙の候補者と当選者の顔ぶれ（性別・新現元・党派）を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。
兄弟サイト: [参議院選挙で、どの党がどれだけ票を得てきたか](/politics/elections/sangiin/votes/)（[election-sangiin-timeseries](https://github.com/visualizing-jp/election-sangiin-timeseries)）。

想定URL: /politics/elections/sangiin/candidates/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 全国の候補者と当選者（第19〜27回、2001–2025）。性別／新現元／党の内訳、全体／選挙区／比例代表、割合／人数 |
| 選挙区 | 選挙区ごとの当選・擁立（定数に対する割合）を都道府県の地図で。選んだ県の選挙区の推移 |

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
| `npm run verify` | 表どうしの合計・定数・確定値との突合 |
| `npm run data` | 正規化 JSON から配信用 JSON を `public/data/` に書き出す |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

配色のルールは `src/lib/data/palette.ts`（色相＝党、明度＝量、CIE HCL）。党の色相は兄弟サイトの `palette.json` を `data/palette.json` に写したもの。性別・新現元の内訳だけは Okabe–Ito のカテゴリカル配色。

`data/normalized/`・`data/palette.json`・`public/data/` は追跡する。
