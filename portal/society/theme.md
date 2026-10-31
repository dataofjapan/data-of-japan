| 優先  | 仮タイトル                                     | 主な統計                 | 面白さ・可視化の核                                          |
| ----- | ---------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| ★★★★★ | **日本人は何を食べてきたか**                   | 食料需給表               | 米→小麦、魚→肉、乳製品、油脂などの食生活の構造変化          |
| ★★★★★ | **日本人はどこへ移り住んできたか**             | 住民基本台帳人口移動報告 | 東京一極集中、地方→都市、バブル・震災・コロナによる人口移動 |
| ★★★★★ | **日本人はどこまで学ぶようになったか**         | 学校基本調査             | 高校・大学進学率、男女差、学校種別の変化                    |
| ★★★★★ | **日本人はどんな働き方をしてきたか**           | 労働力調査               | 正規・非正規、自営業、女性・高齢者就業、失業                |
| ★★★★★ | **日本人はいつ結婚し、別れてきたか**           | 人口動態統計             | 初婚・再婚、婚姻率、離婚率、同居期間、地域差                |
| ★★★★☆ | **日本人は何にお金を使ってきたか**             | 家計調査                 | 食費、住居、教育、通信、娯楽など家計構造の変化              |
| ★★★★☆ | **日本人はどんな病気で病院にかかってきたか**   | 患者調査                 | 「死因」の姉妹編。疾病×年齢×性×地域                         |
| ★★★★☆ | **日本人はどう通勤・通学してきたか**           | 国勢調査                 | 鉄道・自動車・自転車・徒歩、都市圏と地方の対比              |
| ★★★★☆ | **日本ではどんな犯罪が起きてきたか**           | 犯罪統計・警察白書       | 戦後からの犯罪構成、認知件数、検挙率                        |
| ★★★★☆ | **日本人は交通事故でどれだけ傷ついてきたか**   | 警察庁交通事故統計       | モータリゼーションと事故の急増→長期減少                     |
| ★★★☆☆ | **日本はどれだけごみを出してきたか**           | 一般廃棄物処理実態調査   | 排出量、焼却、リサイクル、最終処分の地域差                  |
| ★★★☆☆ | **日本人はどれだけ子どもを産んできたか**       | 人口動態統計             | 出生数・出生率・TFR・母親の年齢                             |
| ★★★☆☆ | **日本人はどんな学校に通ってきたか**           | 学校基本調査             | 大学・短大・専門学校など教育経路の構成変化                  |
| ★★★☆☆ | **日本人は何歳まで働くようになったか**         | 労働力調査               | 年齢別就業率。「高齢化」を労働側から見る                    |
| ★★★☆☆ | **日本では空気と水はどれだけきれいになったか** | 環境統計                 | 大気汚染・水質・下水道普及率など                            |

## 法務省統計（5）

粒度は既存シリーズと同じく **1問い＝1リポ**。10統計を10本にはしない。第1波は `prosecution` と `prisons`。続けて `juvenile` と `registry` も公開した。ハブの第4カテゴリ「裁く・守る」に `crime` を移し、`registry` は「暮らす・移る」の `housing` の隣。

| 優先 | 仮タイトル | 主な統計 | 面白さ・可視化の核 |
| ---- | ---------- | -------- | ------------------ |
| ★★★★★ | **日本では捕まえた人をどれだけ起訴してきたか** | 検察統計 | 受理→起訴/不起訴/起訴猶予。罪名別の起訴率。`crime` の姉妹 |
| ★★★★★ | **日本はどれだけ人を刑務所に入れてきたか** | 矯正統計 + 保護統計 | 収容・新受刑の長期減、再入、高齢化、保護観察・仮釈放 |
| ★★★★☆ | **日本の土地と建物はどう名義が動いてきたか** | 登記統計（不動産主） | 売買・相続・抵当。商業・法人は第3ビュー。`housing` の姉妹 |
| ★★★☆☆ | **日本では非行少年をどう処遇してきたか** | 少年矯正統計 | 少年院・鑑別所の新収容、処遇課程、長期減少 |
| ★★★☆☆ | **日本ではどんな人権侵害が届けられてきたか** | 人権侵犯事件統計 | 申告件数、類型、地域。刑事の外側の救済 |

見送り: 戸籍（人口動態と重複）、訟務、供託、婦人補導（2024年終了）、出入国・在留（入管庁へ移行、`foreign-residents` がカバー）。犯罪被害実態調査は `crime` 第2版の暗数候補。裁判の有罪・量刑は最高裁司法統計で、法務省10統計には入らない。

## テーマ索引（15）

ローカル配置は `japan-data/` の兄弟ディレクトリ（例: `../japan-data-{slug}/`、絶対パスなら `Prj_DataViz_SelfWorks/japan-data-{slug}/`）。

| slug | タイトル | ローカル | GitHub | 想定サブドメイン | ステータス |
| ---- | -------- | -------- | ------ | ---------------- | ---------- |
| food | 日本人は何を食べてきたか | `../japan-data-food/` | https://github.com/visualizing-jp/japan-data-food | /society/food/ | 完成予定/実装中 |
| migration | 日本人はどこへ移り住んできたか | `../japan-data-migration/` | https://github.com/visualizing-jp/japan-data-migration | /society/migration/ | 完成予定/実装中 |
| education | 日本人はどこまで学ぶようになったか | `../japan-data-education/` | https://github.com/visualizing-jp/japan-data-education | /society/education/ | 完成予定/実装中 |
| employment | 日本人はどんな働き方をしてきたか | `../japan-data-employment/` | https://github.com/visualizing-jp/japan-data-employment | /society/employment/ | 完成予定/実装中 |
| marriage | 日本人はいつ結婚し、別れてきたか | `../japan-data-marriage/` | https://github.com/visualizing-jp/japan-data-marriage | /society/marriage/ | 完成予定/実装中 |
| spending | 日本人は何にお金を使ってきたか | `../japan-data-spending/` | https://github.com/visualizing-jp/japan-data-spending | /society/spending/ | 骨格 |
| disease | 日本人はどんな病気で病院にかかってきたか | `../japan-data-disease/` | https://github.com/visualizing-jp/japan-data-disease | /society/disease/ | 完成予定/実装中 |
| commuting | 日本人はどう通勤・通学してきたか | `../japan-data-commuting/` | https://github.com/visualizing-jp/japan-data-commuting | /society/commuting/ | 骨格 |
| crime | 日本ではどんな犯罪が起きてきたか | `../japan-data-crime/` | https://github.com/visualizing-jp/japan-data-crime | /society/crime/ | 骨格 |
| traffic-accidents | 日本人は交通事故でどれだけ傷ついてきたか | `../japan-data-traffic-accidents/` | https://github.com/visualizing-jp/japan-data-traffic-accidents | /society/traffic-accidents/ | 完成予定/実装中 |
| waste | 日本はどれだけごみを出してきたか | `../japan-data-waste/` | https://github.com/visualizing-jp/japan-data-waste | /society/waste/ | 完成予定/実装中 |
| births | 日本人はどれだけ子どもを産んできたか | `../japan-data-births/` | https://github.com/visualizing-jp/japan-data-births | /society/births/ | 完成予定/実装中 |
| schools | 日本人はどんな学校に通ってきたか | `../japan-data-schools/` | https://github.com/visualizing-jp/japan-data-schools | /society/schools/ | 完成予定/実装中 |
| working-age | 日本人は何歳まで働くようになったか | `../japan-data-working-age/` | https://github.com/visualizing-jp/japan-data-working-age | /society/working-age/ | 完成予定/実装中 |
| environment | 日本では空気と水はどれだけきれいになったか | `../japan-data-environment/` | https://github.com/visualizing-jp/japan-data-environment | /society/environment/ | 骨格 |

## 法務省テーマ索引（5）

第1波は `prosecution` と `prisons`。続けて `juvenile` と `registry` も公開済み。`rights` は第2波。

| slug | タイトル | ローカル | GitHub | 想定サブドメイン | ステータス |
| ---- | -------- | -------- | ------ | ---------------- | ---------- |
| prosecution | 日本では捕まえた人をどれだけ起訴してきたか | `../japan-data-prosecution/` | https://github.com/visualizing-jp/japan-data-prosecution | /society/prosecution/ | 公開 |
| prisons | 日本はどれだけ人を刑務所に入れてきたか | `../japan-data-prisons/` | https://github.com/visualizing-jp/japan-data-prisons | /society/prisons/ | 公開 |
| registry | 日本の土地と建物はどう名義が動いてきたか | `../japan-data-registry/` | https://github.com/visualizing-jp/japan-data-registry | /society/registry/ | 公開 |
| juvenile | 日本では非行少年をどう処遇してきたか | `../japan-data-juvenile/` | https://github.com/visualizing-jp/japan-data-juvenile | /society/juvenile/ | 公開 |
| rights | 日本ではどんな人権侵害が届けられてきたか | `../japan-data-rights/` | https://github.com/visualizing-jp/japan-data-rights | https://japan-data-rights.visualizing.jp | 第2波 |

## 海を越える（2）

在留は3か月以上の人数、出国は出国の回数。互いに内訳ではない。

| slug | タイトル | ローカル | GitHub | 想定サブドメイン | ステータス |
| ---- | -------- | -------- | ------ | ---------------- | ---------- |
| overseas | 日本人は海外のどこに住んできたか | `../japan-data-overseas/` | https://github.com/visualizing-jp/japan-data-overseas | /society/overseas/ | 公開 |
| outbound | 日本人はどれだけ海外へ出てきたか | `../japan-data-outbound/` | https://github.com/visualizing-jp/japan-data-outbound | /society/outbound/ | 公開 |
