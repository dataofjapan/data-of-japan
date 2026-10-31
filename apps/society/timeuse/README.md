# 日本人は1日をどう使ってきたか

総務省「社会生活基本調査」調査票Aの生活時間をもとに、
仕事・家事・睡眠・余暇などの1日の配分を時代・性・年齢・地域の切り口で探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。
公開先: /society/timeuse/

## 開発

```bash
cp .env.example .env   # ESTAT_APP_ID を設定
npm install
npm run meta           # e-Stat メタ取得
npm run fetch          # 生活時間データ取得
npm run data           # public/data/*.json を生成
npm run verify
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
