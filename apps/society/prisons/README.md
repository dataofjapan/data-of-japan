# 日本はどれだけ人を刑務所に入れてきたか

法務省「犯罪白書」をもとに、刑事施設の収容・入所と保護観察を探索するダッシュボード。

`crime`（警察の認知・検挙）と `prosecution`（起訴）の下流。visualizing.jp スタンドアロン。

想定URL: /society/prisons/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 年末収容・入所受刑・収容率・再入・仮釈放の長期推移 |
| 入所 | 入所受刑者の年齢構成と直近の罪名 |
| 保護 | 仮釈放と執行猶予の保護観察 |

## 開発

```bash
npm install
npm run fetch && npm run data && npm run verify
npm run dev
```

Excel は `data/raw/` に置く（git 管理外）。配信用 JSON は `public/data/` を追跡する。API キーは不要。

| スクリプト | 内容 |
| --- | --- |
| `npm run fetch` | 白書の Excel 取得 |
| `npm run data` | 配信用 cube 構築（Python / openpyxl） |
| `npm run verify` | 健全性チェック |
| `npm run dev` | Vite 開発サーバ（5292） |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-prisons.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
