# 日本はどれだけごみを出してきたか

一般廃棄物処理事業実態調査（社会・人口統計体系経由）をもとに、排出量、リサイクル、最終処分の地域差を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/waste/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 総排出・1人1日当たり・リサイクル率・最終処分などの全国推移（1999–2023年度） |
| 処理 | 排出内訳（計画収集など）と資源化・最終処分（総排出比） |
| 地域 | 都道府県の原単位・リサイクル率・埋立率（全国比） |

## 開発

```bash
cp .env.example .env   # ESTAT_APP_ID を設定
npm install
npm run meta && npm run fetch && npm run data && npm run verify
npm run dev
```

| スクリプト | 内容 |
| --- | --- |
| `npm run meta` | e-Stat メタ情報 |
| `npm run fetch` | e-Stat 生データ取得 |
| `npm run data` | 配信用 cube 構築 |
| `npm run verify` | 健全性チェック |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-waste.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
