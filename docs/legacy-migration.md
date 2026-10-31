# 旧URLの移行対応表

旧サブドメインは同じVercelプロジェクトに接続し、vercel.jsonのホスト別308ルールで転送します。
ルートだけでなく配下のパスとクエリも引き継ぎます。

`npm run redirects:generate` でsites.jsonからルールを再生成し、`npm run redirects:verify` で公開URLの転送を検証します。

アーカイブは転送と移行先を確認した後に行い、旧リポジトリの説明とHomepageに移行先を明記します。
旧リポジトリのコードと履歴は削除しません。

| 旧ホスト | 新しいパス | 旧リポジトリ |
| --- | --- | --- |
| japan-election.visualizing.jp | /politics/elections/ | visualizing-jp/japan-election |
| election-sangiin-candidates.visualizing.jp | /politics/elections/sangiin/candidates/ | visualizing-jp/sangiin-candidates |
| election-sangiin-seats.visualizing.jp | /politics/elections/sangiin/seats/ | visualizing-jp/sangiin-seats |
| election-sangiin-timeseries.visualizing.jp | /politics/elections/sangiin/votes/ | visualizing-jp/election-sangiin-timeseries |
| election-sangiin-turnout.visualizing.jp | /politics/elections/sangiin/turnout/ | visualizing-jp/sangiin-turnout |
| election-shugiin-candidates.visualizing.jp | /politics/elections/shugiin/candidates/ | visualizing-jp/shugiin-candidates |
| election-shugiin-seats.visualizing.jp | /politics/elections/shugiin/seats/ | visualizing-jp/shugiin-seats |
| election-shugiin-timeseries.visualizing.jp | /politics/elections/shugiin/votes/ | visualizing-jp/election-shugiin-timeseries |
| election-shugiin-turnout.visualizing.jp | /politics/elections/shugiin/turnout/ | visualizing-jp/shugiin-turnout |
| governor-election.visualizing.jp | /politics/elections/governors/ | visualizing-jp/governor-election |
| governor-election-okinawa.visualizing.jp | /politics/elections/governors/okinawa/ | visualizing-jp/governor-election-okinawa |
| japan-data.visualizing.jp | /society/ | visualizing-jp/japan-data |
| japan-data-births.visualizing.jp | /society/births/ | visualizing-jp/japan-data-births |
| japan-data-commuting.visualizing.jp | /society/commuting/ | visualizing-jp/japan-data-commuting |
| japan-data-crime.visualizing.jp | /society/crime/ | visualizing-jp/japan-data-crime |
| japan-data-disease.visualizing.jp | /society/disease/ | visualizing-jp/japan-data-disease |
| japan-data-education.visualizing.jp | /society/education/ | visualizing-jp/japan-data-education |
| japan-data-employment.visualizing.jp | /society/employment/ | visualizing-jp/japan-data-employment |
| japan-data-environment.visualizing.jp | /society/environment/ | visualizing-jp/japan-data-environment |
| japan-data-food.visualizing.jp | /society/food/ | visualizing-jp/japan-data-food |
| japan-data-foreign-residents.visualizing.jp | /society/foreign-residents/ | visualizing-jp/japan-data-foreign-residents |
| japan-data-households.visualizing.jp | /society/households/ | visualizing-jp/japan-data-households |
| japan-data-housing.visualizing.jp | /society/housing/ | visualizing-jp/japan-data-housing |
| japan-data-juvenile.visualizing.jp | /society/juvenile/ | visualizing-jp/japan-data-juvenile |
| japan-data-marriage.visualizing.jp | /society/marriage/ | visualizing-jp/japan-data-marriage |
| japan-data-migration.visualizing.jp | /society/migration/ | visualizing-jp/japan-data-migration |
| japan-data-outbound.visualizing.jp | /society/outbound/ | visualizing-jp/japan-data-outbound |
| japan-data-overseas.visualizing.jp | /society/overseas/ | visualizing-jp/japan-data-overseas |
| japan-data-prisons.visualizing.jp | /society/prisons/ | visualizing-jp/japan-data-prisons |
| japan-data-prosecution.visualizing.jp | /society/prosecution/ | visualizing-jp/japan-data-prosecution |
| japan-data-registry.visualizing.jp | /society/registry/ | visualizing-jp/japan-data-registry |
| japan-data-schools.visualizing.jp | /society/schools/ | visualizing-jp/japan-data-schools |
| japan-data-spending.visualizing.jp | /society/spending/ | visualizing-jp/japan-data-spending |
| japan-data-timeuse.visualizing.jp | /society/timeuse/ | visualizing-jp/japan-data-timeuse |
| japan-data-traffic-accidents.visualizing.jp | /society/traffic-accidents/ | visualizing-jp/japan-data-traffic-accidents |
| japan-data-waste.visualizing.jp | /society/waste/ | visualizing-jp/japan-data-waste |
| japan-data-salary.visualizing.jp | /society/work-category/ | visualizing-jp/japan-data-salary |
| japan-data-occupation.visualizing.jp | /society/work-people/ | visualizing-jp/japan-data-occupation |
| japan-data-working-age.visualizing.jp | /society/working-age/ | visualizing-jp/japan-data-working-age |
| japan-payroll.visualizing.jp | /society/payroll/ | visualizing-jp/japan-payroll |

## 実施結果（2026-10-31）

- 対象40件だけCNAMEをVercelへ変更し、それ以外のDNSレコードが変わっていないことを差分で確認しました。
- 権威DNS40件、TLS証明書、ルート・index.html・末尾スラッシュ付き下位パスの計120ケースの308転送、移行先40ページのHTTP 200を確認しました。TLS検証ではDNSキャッシュを除外するため、正しいHost/SNIを保ってVercelのIPへ接続しました。
- 旧40リポジトリは移行先の説明・Homepageを設定してアーカイブ済みです。GitHubから再取得し、ブランチと先頭コミットを保持していることを確認しました。
- 作業時点の通常DNSでは25件が転送済み、15件は旧DNSキャッシュが残っていました。TTLは30分です。キャッシュが更新されるまでは旧ページが表示される場合があります。

検証結果と旧リポジトリのコミットは [legacy-migration-audit.json](legacy-migration-audit.json) に記録しています。

VercelのtrailingSlash設定下で `/:path*` が末尾スラッシュ付きURLに一致しなかったため、旧ホストの転送は `/:path(.*)` を使用しています。
