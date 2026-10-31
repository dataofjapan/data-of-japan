# 日本人はいつ結婚し、別れてきたか

人口動態統計をもとに、初婚・再婚、婚姻率、離婚率、同居期間、地域差を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/marriage/

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

- **時代** — 婚姻・離婚の件数/率、平均初婚年齢、再婚割合、同居期間
- **年齢** — 年齢5歳階級 × 初婚/再婚 × 夫/妻
- **地域** — 47都道府県の婚姻率・離婚率・平均初婚年齢

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-marriage.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
