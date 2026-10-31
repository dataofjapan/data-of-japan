export const ERA_FROM = 1946;
export const ERA_TO = 2024;
export const AGE_FROM = 1971;
export const PROBATION_FROM = 1949;

export const METRICS = [
  { code: "year_end", label: "年末収容人員", kind: "persons", group: "規模" },
  { code: "admitted", label: "入所受刑者", kind: "persons", group: "規模" },
  { code: "sentenced_end", label: "年末の受刑者", kind: "persons", group: "規模" },
  { code: "occupancy", label: "収容率", kind: "rate", group: "率" },
  { code: "per_100k", label: "人口10万人当たり収容", kind: "per100k", group: "率" },
  { code: "female_share", label: "女性比（年末収容）", kind: "rate", group: "率" },
  { code: "reentry_rate", label: "再入者率", kind: "rate", group: "率" },
  { code: "parole_rate", label: "仮釈放率", kind: "rate", group: "率" },
  { code: "elderly_share", label: "高齢者比（入所・65歳以上）", kind: "rate", group: "率" },
] as const;

export const AGE_CODES = [
  { code: "u20", label: "20歳未満" },
  { code: "a20", label: "20代" },
  { code: "a30", label: "30代" },
  { code: "a40", label: "40代" },
  { code: "a50", label: "50代" },
  { code: "a60", label: "60代" },
  { code: "a70", label: "70歳以上" },
] as const;

export const PROBATION_METRICS = [
  { code: "parole", label: "仮釈放で保護観察", kind: "persons" },
  { code: "suspended", label: "執行猶予で保護観察", kind: "persons" },
  { code: "adult", label: "成人の保護観察開始", kind: "persons" },
  { code: "suspended_rate", label: "全部執行猶予の保護観察率", kind: "rate" },
] as const;
