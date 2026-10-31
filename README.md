# Data of Japan

政治・社会・経済の可視化を `https://data-of-japan.org/` にまとめる静的サイト。
統合先: https://github.com/dataofjapan/data-of-japan

## 開発と検証

Node.js 22.18 以上、npm を使用します。

```sh
npm run setup
npm run build
npm run check
npm run preview
```

`setup` は各アプリの package-lock.json に従って依存をインストールします。
`build` は既存データを使って全アプリをビルドし、`dist/` 配下の公開パスへ集約します。
データ取得・正規化は公開ビルドと分離しており、各アプリの README と scripts を参照してください。
各アプリは自身のフォルダで `npm run dev` により単独開発できます。

## 構成とURL

`sites.json` にアプリディレクトリ、公開URL、旧ホスト名、取り込み元とcommitを記録しています。
`apps/politics/` が選挙可視化、`apps/society/` が社会・経済、`portal/` が一覧画面です。
総合・政治・選挙・衆参の入口、共通ナビ、sitemapは `scripts/build.mjs` で生成します。
`portal/elections` は旧表紙の参照用ソースとして取り込んでおり、公開表紙は生成したものです。
社会統計の death は今回の3フォルダにソースがないため、既存外部サイトへのリンクを維持しています。

## Vercel

Root Directory はリポジトリのルート、Framework Preset は Other。
`vercel.json` がインストール・ビルド・出力ディレクトリと末尾スラッシュを指定します。
Preview でデータ読み込みと画面遷移を確認してから `data-of-japan.org` を設定してください。
DNSの値はVercelのドメイン設定画面が提示する内容に従ってください。

旧 visualizing.jp の転送は旧ホスト側で設定します。新サイト側の設定だけでは旧URLを転送できません。
旧リポジトリ・公開設定を切り替えるまでは既存公開を維持してください。

## 取り込みと履歴

既存リポジトリの追跡ファイルのみを取り込み、Git管理情報、旧Pagesワークフロー、CNAMEは除外しました。
各アプリのロックファイル・データ・出典・ライセンスを保持し、旧リポジトリは履歴参照先として残します。
今後の修正はこのリポジトリで行います。
