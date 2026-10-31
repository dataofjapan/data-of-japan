/** 地域（都道府県・全国）ごとの党派別得票。合計は有効投票数。 */
export interface AreaVotes {
  votes: Record<string, number>;
  total: number;
}

export interface SystemVotes {
  national: AreaVotes;
  areas: Record<string, AreaVotes>;
  /** 全国表（党派別得票数）の「今回」欄。突合用。第20回（PDF）はない。 */
  reported?: AreaVotes;
}

export interface NormalizedElection {
  n: number;
  sd: SystemVotes;
  pr: SystemVotes;
}
