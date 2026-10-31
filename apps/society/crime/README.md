# 日本ではどんな犯罪が起きてきたか

警察庁「犯罪統計」をもとに、戦後（1975年以降）の犯罪構成・認知件数・検挙率を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/crime/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 刑法犯認知・検挙・検挙率などの長期推移 |
| 罪種 | 凶悪・粗暴・窃盗・知能・風俗の構成比と検挙率 |
| 地域 | 都道府県別の人口当たり認知・検挙率 |

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
- カスタムドメイン `japan-data-crime.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
