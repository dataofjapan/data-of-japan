/** 注記・図中マーク。 */

export const MARKS = [
  {
    year: 1990,
    label: "短大ピークと大学シフトの前夜",
    detail: "短大進学・短大在学者はなお厚いが、以降は大学への置き換えが進む。",
  },
  {
    year: 2000,
    label: "専修学校の定着",
    detail: "高校卒業者の専修学校等への流入が、就職・短大と並ぶ経路として定着する。",
  },
  {
    year: 2015,
    label: "大学が主経路へ",
    detail: "高校卒業後の行き先として大学進学が中心になり、短大は縮小が続く。",
  },
] as const;


/** TrendStack が参照する帯注記（本テーマでは未使用）。 */
export const SPANS: readonly {
  from: number;
  to: number;
  label: string;
  detail: string;
  kind: "missing" | "scope";
}[] = [];

export const NOTES = [
  {
    term: "進路構成",
    detail:
      "高校卒業者数を分母にした行き先の人数構成。進学率（education）とは単位が異なる。",
  },
  {
    term: "高等教育の構成比",
    detail:
      "短大・大学・専修・各種の在学者合計を分母とする。高校は参照用で構成比に含めない。",
  },
  {
    term: "男女",
    detail:
      "大学・短大進学者の性別は SSDS に無い。在学者数の男女と女性割合で見る。",
  },
  {
    term: "出典",
    detail: "文部科学省「学校基本調査」（社会・人口統計体系「Ｅ　教育」経由、e-Stat）。",
  },
] as const;
