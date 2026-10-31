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
総合・政治・衆参の入口、共通ナビ、sitemapは `scripts/build.mjs` で生成します。
選挙一覧は `portal/elections` の元のカード表示を使用し、知事選挙への入口も含みます。
生成する入口も同じアイコンとカタログの説明を使用します。
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

## Google Analytics 4

計測は `public/analytics.js` に集約しています。アプリ個別の旧測定IDは使用しません。
Vercel の Production 環境に `GA4_MEASUREMENT_ID=G-...` を設定し、再デプロイしてください。
ID未設定時、Preview環境、localhost、vercel.app上ではGoogleタグを読み込みません。
本番の `data-of-japan.org` と `www.data-of-japan.org` だけが計測対象です。

GA4では統合サイト専用のプロパティとウェブストリームを作り、ストリームURLを
`https://data-of-japan.org`、レポートのタイムゾーンを日本、通貨をJPYに設定します。
ウェブストリームの拡張計測 → ページビュー → 詳細設定にある
「ブラウザの履歴イベントに基づくページの変更」をオフにしてください。
コードで閲覧を送信するため、この設定がオンだと履歴操作の二重計測が起きます。

- `page_view`: 初回表示およびページのパス変更。フィルター操作では増えません。
- `view_change`: `view` パラメータが変わったとき。`view_name` にビュー名を送ります。
- `content_group`: `politics` / `society` / `home`。コンテンツグループ別に比較できます。
- URLは `view` とUTMパラメータだけを残し、その他のクエリとフラグメントを除外します。
- Google Signalsと広告パーソナライズ用のシグナルを無効にしています。

ビュー別の分析には、GA4のカスタム定義でイベントスコープの `view_name` を登録します。
初回設定後は本番ドメインからアクセスし、Realtimeで受信を確認してください。
DebugViewで確認する場合はGoogle Analytics Debuggerなどを利用します。
`npm test` で計測の重複防止、環境による除外、ビュー切り替えを検証できます。

## GitHubからの自動デプロイ

Vercel Project Settings → Git で `dataofjapan/data-of-japan` を接続し、
Production Branchを `main` に設定します。Vercel GitHub Appのアクセス対象は
このリポジトリに限定します。以降はmainへのpushで本番、作業ブランチへのpushでPreviewを作成します。
GitHub Actionsはビルド検証を行います。VercelのGit連携は独立して動くため、Actionsの成功を
本番反映の前提にする場合は、ブランチ保護とPR経由のmain更新で運用してください。

設定済みGA4: NotationLLCアカウント / Data of Japan / Data of Japan — Web。
測定ID: `G-LH9TF7Y96W`（公開識別子）。本番環境変数に設定済みです。
拡張計測はスクロール・離脱クリック・ファイルダウンロードを有効にし、履歴によるページビュー・サイト内検索・フォーム操作・動画計測は無効にしています。
