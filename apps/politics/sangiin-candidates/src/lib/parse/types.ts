/** 新前元 × 男女の人数。[新男, 新女, 前男, 前女, 元男, 元女]。 */
export type SexStatus = number[];

/** 新前元の人数。[新, 前, 元]。 */
export type Status = number[];

/** 党派別男女別新前元別の表の1列（1党）。all は「合計」（選挙区 + 比例代表）。 */
export interface PartyCounts {
  sd: SexStatus;
  pr: SexStatus;
  all: SexStatus;
}

/** 候補者または当選人。 */
export interface Side {
  /** 党派別男女別新前元別（全国）。 */
  parties: Record<string, PartyCounts>;
  /** 同じ表の「合計」列。 */
  total: PartyCounts;
  /** 都道府県別党派別新前元別（選挙区）。選挙区 → 党 → 新前元。人数 0 の党は持たない。 */
  districts: Record<string, Record<string, Status>>;
  /** 同じ表の「計」の行（全国）。 */
  districtNational: Record<string, Status>;
}

export interface NormalizedElection {
  n: number;
  /** 選挙区ごとの選挙すべき議員の数（合併して行われた補欠選挙を含む）。 */
  seats: Record<string, number>;
  candidates: Side;
  winners: Side;
}
