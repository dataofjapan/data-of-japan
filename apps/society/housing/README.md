# 日本人はどんな家に住んできたか

総務省「住宅・土地統計調査」（社会・人口統計体系経由）をもとに、
住宅ストックの持ち家・借家、建て方、広さ、空き家を時代・形態・地域の3つの切り口で探索するダッシュボード。

「日本人はどう暮らしてきたか」（世帯・家族類型）の対。誰と暮らすか → どこに・どんな箱で暮らすか。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

## 開発

```bash
cp .env.example .env   # ESTAT_APP_ID を設定
npm install
npm run meta           # e-Stat メタ取得
npm run fetch          # データ取得
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
