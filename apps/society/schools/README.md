# 日本人はどんな学校に通ってきたか

学校基本調査をもとに、大学・短大・専門学校など教育経路の構成変化を探索するダッシュボード。

進学率は姉妹テーマ [japan-data-education](https://github.com/visualizing-jp/japan-data-education) が担当。本リポは進路・在学者の構成に特化する。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/schools/

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
| 時代 | 高校卒業者の進路構成（1975–2024） |
| 学校種 | 高等教育の在学者数と構成比 |
| 男女 | 在学者の男女と女性割合 |

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-schools.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
