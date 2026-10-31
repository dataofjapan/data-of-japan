# 日本人はどう通勤・通学してきたか

国勢調査をもとに、鉄道・自動車・自転車・徒歩、都市圏と地方の対比を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/commuting/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 時代 | 1990–2020（大規模調査年）の手段別人数・構成比 |
| 手段 | 調査年ごとの単一手段ランキング |
| 地域 | 都道府県別構成比（全国比）。鉄道＝都市圏、自家用車＝地方の対比 |

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
- カスタムドメイン `japan-data-commuting.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
