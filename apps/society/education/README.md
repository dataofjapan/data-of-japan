# 日本人はどこまで学ぶようになったか

学校基本調査をもとに、高校・大学進学率、男女差、学校種別の在学者構成を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/education/

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

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 進学率の長期推移（1948–2023） |
| 男女 | 男・女の進学率と差（女−男） |
| 学校種 | 在学者数と構成比（1975–2024） |

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-education.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
