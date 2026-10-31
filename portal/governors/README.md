# 都道府県知事選挙の記録（表紙）

都道府県ごとの知事選挙サイトをまとめる表紙。いまは沖縄県だけなので、GA 計測を兼ねた仮の表紙。

想定URL: /politics/elections/governors/

リポジトリ: `visualizing-jp/governor-election`。都道府県のサイトは `governor-election-{県名ローマ字}`（ローカルは `../{コード}_{県名ローマ字}/`）。

## 構成

- 冒頭に公開中の都道府県を大きな札で出し、その下に47都道府県を地方ごとに並べる（公開前は「準備中」）。
- 目録は `src/catalog.ts`。都道府県のサイトを公開したら、その県の `site`（URL・県全体の範囲・市町村別の範囲）を埋める。
- 見た目は選挙シリーズの表紙（`Prj_JapanElection/japan-election`）に合わせた。

## 開発

```bash
npm install
npm run dev
```

| スクリプト | 内容 |
| --- | --- |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

## GitHub Pages / DNS

- `.github/workflows/pages.yml` で Pages にデプロイする。
- カスタムドメイン `governor-election.visualizing.jp` は `public/CNAME` に置いた。Pages 設定と visualizing.jp 側 DNS で登録する。
- Google Analytics の測定ID（`src/analytics.ts`）は `G-TJ0Z3EE92E`。都道府県知事選挙シリーズ共通。
