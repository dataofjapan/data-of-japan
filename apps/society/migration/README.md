# 日本人はどこへ移り住んできたか

総務省「住民基本台帳人口移動報告」をもとに、国内の転居（移動者数・転入超過）を
時代・地域・出来事の3つの切り口で探索するダッシュボード。

東京一極集中、地方から都市への流れ、バブル・東日本大震災・コロナ禍の痕跡を見る。

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
