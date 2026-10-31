# 日本では非行少年をどう処遇してきたか

法務省「犯罪白書」をもとに、少年院入院・鑑別所・退所事由を探索するダッシュボード。

`crime`（警察の少年検挙）と `prisons`（刑事施設）のあいだ。visualizing.jp スタンドアロン。

想定URL: /society/juvenile/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 少年院入院・一日平均在院・鑑別所被収容・少年院送致の長期推移 |
| 入所 | 入院時の年齢構成と直近の非行名 |
| 処遇 | 鑑別所退所事由（保護観察・少年院・試験観察など） |

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
| `npm run dev` | Vite 開発サーバ（5293） |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-juvenile.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
