# 日本の産業は、どう動いてきたか

産業にまつわる公的統計の長期シリーズのハブ。各テーマは兄弟ディレクトリ `../japan-industry-{slug}/` の独立したサイト。
構成は `Prj_JapanData` の「日本人は、どう生きてきたか」シリーズと同じ。

| slug | タイトル | 統計 | ローカル |
| --- | --- | --- | --- |
| energy | 日本は何のエネルギーに頼ってきたか | 総合エネルギー統計（資源エネルギー庁） | `../japan-industry-energy/` |
| energy-pref | どの県が、何にエネルギーを使っているか | 都道府県別エネルギー消費統計（資源エネルギー庁） | `../japan-industry-energy-pref/` |

## 開発

```bash
npm install
npm run dev   # http://127.0.0.1:5310/
```

テーマを足すときは `src/catalog.ts` に1件、`src/card-icons.tsx` にアイコンを1つ足す。
`src/Brand.tsx` は各サイトの `src/app/components/Brand.tsx` と同じ内容に保つ。

本番ドメインは未定。カードのリンクと各サイトの `HUB_URL` は、いまはローカル開発サーバ（ハブ 5310、energy 5311、energy-pref 5312）を指している。
