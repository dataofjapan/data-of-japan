# 日本人は何を食べてきたか

食料需給表をもとに、米→小麦、魚→肉、乳製品、油脂などの食生活の構造変化を探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/food/

## ビュー

| タブ | 内容 |
| --- | --- |
| 時代 | 主要品目の供給純食料・供給熱量の長期推移（1960–2023年度） |
| 品目 | 類別 L1 の熱量構成比（年度断面） |
| 供給 | 総合自給率・品目別自給率（重量ベース） |

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
- カスタムドメイン `japan-data-food.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
