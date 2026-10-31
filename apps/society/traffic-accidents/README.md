# 日本人は交通事故でどれだけ傷ついてきたか

警察庁「道路の交通に関する統計」をもとに、モータリゼーションと事故の急増→長期減少を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/traffic-accidents/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 1948–2024 の発生件数・死者・負傷者（人口比含む） |
| 被害 | 状態別・年齢層別の死傷構成（2005–2018） |
| 地域 | 都道府県の件数・人口比と全国比 |

データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

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

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-traffic-accidents.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
