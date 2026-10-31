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
