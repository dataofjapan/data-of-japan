# 日本人はどれだけ海外へ出てきたか

出入国管理統計と JNTO の出国日本人数をもとに、日本人の出国を
時代／誰が／目的の3つの切り口で探索するダッシュボード。
目的と州だけ観光庁「旅行・観光消費動向調査」で、出国回数の内訳ではない。

- 公開: /society/outbound/
- リポジトリ: https://github.com/visualizing-jp/japan-data-outbound

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

## 開発

```bash
npm install
npm run fetch          # e-Stat と観光庁から Excel を data/raw/ へ
npm run data           # public/data/*.json を生成
npm run verify
npm run dev
```

| スクリプト | 内容 |
| --- | --- |
| `npm run fetch` | Excel 取得（`--force` で再取得） |
| `npm run data` | 配信用 Cube 構築 |
| `npm run verify` | 健全性チェック |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

1964年からの出国は `scripts/jnto.json`（JNTO の年次 PDF の出国列からの転記）。
データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## デプロイ

`main` への push で GitHub Pages にデプロイ（`.github/workflows/pages.yml`）。
カスタムドメインは `public/CNAME`（`japan-data-outbound.visualizing.jp`）。
Netlify 用設定も `netlify.toml` にあり。
