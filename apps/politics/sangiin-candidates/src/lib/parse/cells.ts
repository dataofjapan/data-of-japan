/**
 * 結果調のセルの読み方。Excel と PDF で共通。
 */

/** 全角英数を半角に寄せ、空白と注記記号（※1 など）を落とす。 */
export function clean(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/※\d*/g, "")
    .replace(/\s+/g, "");
}

/**
 * 人数。空欄・ダッシュは 0。
 * 「4(1)」「(1)」の括弧は、通常選挙と合併して行われた補欠選挙の数（外書）。同じ投票で選ぶので足す。
 */
export function count(value: unknown): number {
  if (typeof value === "number") return check(value, value);
  const s = clean(value).replace(/,/g, "");
  if (s === "" || /^[-－―—ー]$/.test(s)) return 0;
  const outer = /^(\d*)\((\d+)\)$/.exec(s);
  if (outer !== null) return check(Number(outer[1]) + Number(outer[2]), value);
  return check(Number(s), value);
}

function check(v: number, raw: unknown): number {
  if (!Number.isInteger(v) || v < 0) throw new Error(`人数として読めない: ${String(raw)}`);
  return v;
}

/** 人数のセルか。見出しの探索で、表の本体に入ったことを知るのに使う。 */
export function isCount(value: unknown): boolean {
  if (typeof value === "number") return true;
  return /^(\d[\d,]*)?(\(\d+\))?$/.test(clean(value)) && clean(value) !== "";
}

export const TOTAL = "合計";
