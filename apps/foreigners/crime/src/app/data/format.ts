const int = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export type Unit = "cases" | "people";

export function unitNoun(unit: Unit): "件" | "人" {
  return unit === "cases" ? "件" : "人";
}

export function exact(n: number, unit: Unit): string {
  return `${int.format(n)}${unitNoun(unit)}`;
}

export function pct(share: number): string {
  return `${one.format(share * 100)}%`;
}

export function change(now: number, prev: number): string {
  const r = now / prev - 1;
  return `${r >= 0 ? "+" : ""}${pct(r)}`;
}

export function tickCount(v: number): string {
  return v === 0 ? "0" : int.format(v);
}

export function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}
