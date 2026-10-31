# 日本人はどんな病気で病院にかかってきたか

患者調査をもとに、「死因」の姉妹編。疾病×年齢×性×地域を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/disease/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 傷病別の受療率・推計患者数（1996–2023、調査年のみ） |
| 疾病 | 令和5年断面の年齢分布 |
| 地域 | 都道府県別受療率（全国比） |

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
- カスタムドメイン `japan-data-disease.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
