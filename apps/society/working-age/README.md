# 日本人は何歳まで働くようになったか

労働力調査をもとに、年齢別就業率。「高齢化」を労働側から見るを探索するダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。

想定URL: /society/working-age/

姉妹編: [japan-data-employment](/society/employment/)（働き方形態）。本ツールは年齢別就業率・いつまで働くかに集中する。

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

| ビュー | 内容 |
| --- | --- |
| 時代 | 年齢階級ごとの就業率・労働力人口比率の長期推移 |
| 年齢 | 選択年の年齢別就業率プロファイル |
| 性 | 男女の就業率推移（年齢別） |

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `japan-data-working-age.visualizing.jp` は、Pages 設定と visualizing.jp 側 DNS（既存シリーズと同じ運用）で登録する。
