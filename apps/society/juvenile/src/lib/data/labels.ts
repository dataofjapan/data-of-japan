export const ERA_FROM = 1949;
export const ERA_TO = 2024;
export const AGE_FROM = 1968;
export const DISPOSITION_FROM = 1975;
export const DETENTION_FROM = 1982;

export const METRICS = [
  { code: "admitted", label: "少年院入院", kind: "persons", group: "規模" },
  { code: "daily_avg", label: "一日平均在院", kind: "persons", group: "規模" },
  { code: "detention", label: "鑑別所の被収容者", kind: "persons", group: "規模" },
  { code: "to_training", label: "鑑別所から少年院へ", kind: "persons", group: "規模" },
  { code: "female_share", label: "女子比（入院）", kind: "rate", group: "率" },
] as const;

export const AGE_CODES = [
  { code: "u16", label: "16歳未満" },
  { code: "a16", label: "16・17歳" },
  { code: "a18", label: "18歳以上" },
] as const;

export const DISPOSITION_CODES = [
  { code: "probation", label: "保護観察" },
  { code: "training", label: "少年院送致" },
  { code: "test", label: "試験観察" },
  { code: "cancel", label: "観護措置の取消し" },
  { code: "prosecutor", label: "検察官送致" },
  { code: "child", label: "児童自立・養護施設" },
  { code: "nonstart", label: "審判不開始・不処分" },
  { code: "other", label: "その他" },
] as const;
