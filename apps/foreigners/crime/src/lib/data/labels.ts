export const LAWS = [
  { id: "penal", label: "刑法犯", note: "交通業過を除く" },
  { id: "special", label: "特別法犯", note: "交通法令違反を除く" },
] as const;

export type LawId = (typeof LAWS)[number]["id"];

export const GROUPS = ["来日外国人", "その他の外国人"] as const;

export type Group = (typeof GROUPS)[number];

/** 表に国として行がある名前。地域の「その他」や州の計は含めない。 */
export const COUNTRIES = [
  "韓国・朝鮮",
  "中国",
  "イラン",
  "インド",
  "インドネシア",
  "スリランカ",
  "タイ",
  "パキスタン",
  "バングラデシュ",
  "フィリピン",
  "ベトナム",
  "マレーシア",
  "イギリス",
  "イタリア",
  "ロシア",
  "ドイツ",
  "フランス",
  "アメリカ",
  "カナダ",
  "ブラジル",
] as const;
