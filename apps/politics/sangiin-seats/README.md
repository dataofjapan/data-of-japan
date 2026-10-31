# 参議院選挙で、得た票はどれだけ議席になったか

総務省「参議院議員通常選挙結果調」をもとに、2001年以降の通常選挙で各党の得票率がどれだけの議席率になったかを、選挙区と比例代表で比べるダッシュボード。

visualizing.jp スタンドアロン（dataviz.jp サブスクツールではない）。
兄弟サイト: [参議院選挙で、どの党がどれだけ票を得てきたか](/politics/elections/sangiin/votes/)（[election-sangiin-timeseries](https://github.com/visualizing-jp/election-sangiin-timeseries)）、[参議院選挙で、誰が立候補し、誰が当選したか](/politics/elections/sangiin/candidates/)（[sangiin-candidates](https://github.com/visualizing-jp/sangiin-candidates)）、[参議院選挙で、どれだけの人が投票したか](/politics/elections/sangiin/turnout/)（[sangiin-turnout](https://github.com/visualizing-jp/sangiin-turnout)）。
得票は1本目、議席は2本目のデータをそのままつなぐ。

想定URL: /politics/elections/sangiin/seats/

## ビュー

| ビュー | 内容 |
| --- | --- |
| 選挙 | 選んだ回の、得票率の100%棒から議席率の100%棒へ党ごとに帯でつないだ図（選挙区・比例代表を並べる）と、党ごとの得票率・議席・議席率・差の表 |
| 推移 | 選んだ党の得票率と議席率（第19〜27回、2001–2025）を制度別に。全党の票と議席のずれの大きさ（Gallagher 指数）の推移 |

議席はその回に改選した議席（参議院全体の勢力ではない）。データ設計の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## 開発

```bash
npm install
npm run fetch && npm run verify && npm run data
npm run dev
```

| スクリプト | 内容 |
| --- | --- |
| `npm run fetch` | 兄弟サイトの配信データを GitHub から `data/sibling/` に写す |
| `npm run verify` | 議席の党と得票の党のつながり、議席の和と改選数の突き合わせ |
| `npm run data` | `data/sibling/` から配信用 JSON を `public/data/` に書き出す |
| `npm run dev` | Vite 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run typecheck` | TypeScript 検査 |

配色のルールは `src/lib/data/palette.ts`（色相＝党、CIE HCL）。党の色相は兄弟サイトの `palette.json` をそのまま使うので、シリーズのどのサイトでも同じ党が同じ色になる。

`data/sibling/`・`public/data/` は追跡する。
