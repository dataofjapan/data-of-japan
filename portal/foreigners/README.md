# 日本にいる外国人は、どこから来たか

公的統計で日本にいる外国人をたどるシリーズのハブ。各テーマは独立したサイト（兄弟ディレクトリ `../japan-foreigners-{slug}/`）。

- 想定URL: https://japan-foreigners.visualizing.jp/
- カタログ: [`src/catalog.ts`](src/catalog.ts)

| slug | タイトル | 主な統計 | ステータス |
| --- | --- | --- | --- |
| visitors | 日本には、どれだけの外国人が訪れてきたか | JNTO 訪日外客統計 | 実装済み |
| spending | 訪れた外国人は、いくら使ってきたか | 観光庁 インバウンド消費動向調査（公表集計表） | 準備中 |
| stays | 訪れた外国人は、どこに泊まってきたか | 観光庁 宿泊旅行統計調査 | 準備中 |
| status | 日本に住む外国人は、どんな在留資格でいるか | 出入国在留管理庁 在留外国人統計 | 準備中 |
| workers | 日本で働く外国人は、どこから来たか | 厚生労働省 外国人雇用状況の届出状況 | 実装済み |
| crime | 日本で検挙された外国人は、どこから来たか | 警察庁 犯罪統計書 | 実装済み |

住民基本台帳でみる外国人住民の居住地は、japan-data シリーズの [japan-data-foreign-residents](https://japan-data-foreign-residents.visualizing.jp/) が受け持つ。

## 開発

```bash
npm install
npm run dev
npm run build
```

`main` への push で GitHub Pages にデプロイ（`.github/workflows/pages.yml`）。カスタムドメインは `public/CNAME`。
