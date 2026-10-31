/**
 * 就業形態ビュー。自営・雇用・正規/非正規とその内訳。
 */

import { use, useMemo, useState } from "react";
import { loadStatus, type Sex } from "../data/chunks.ts";
import { listForms } from "../data/hierarchy.ts";
import { STATUS_FORMS } from "../../lib/data/labels.ts";
import { TypeList } from "../components/TypeList.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { TrendStack, type Panel, type Point } from "../components/TrendStack.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const SEXES = [
  { value: "total", label: "総数" },
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const satisfies readonly { value: Sex; label: string }[];

const FROM = 1953;
const TO = 2025;

const one = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});
const pct = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function dense(years: number[], values: (number | null)[]): Point[] {
  const byYear = new Map(years.map((y, i) => [y, values[i] ?? null]));
  return Array.from({ length: TO - FROM + 1 }, (_, i) => ({
    year: FROM + i,
    value: byYear.get(FROM + i) ?? null,
  }));
}

function shareUnit(code: string): string {
  const f = STATUS_FORMS.find((x) => x.code === code);
  if (f?.shareOf === "ex_exec") return "役員を除く雇用者に占める割合";
  if (f?.shareOf === "nonregular") return "非正規に占める割合";
  return "就業者に占める割合";
}

export function StatusView() {
  const { forms, cube, years } = use(loadStatus());
  const selectable = useMemo(() => listForms(forms), [forms]);
  const defaultForm =
    selectable.find((f) => f.code === "nonregular")?.code ?? selectable[0]!.code;

  const [form, setForm] = useUrlState<string>("form", defaultForm, (v) =>
    selectable.some((c) => c.code === v),
  );
  const [sex, setSex] = useUrlState<Sex>("sex", "total", (v) =>
    SEXES.some((s) => s.value === v),
  );
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = selectable.find((c) => c.code === form)!;
  const starts2013 = STATUS_FORMS.find((f) => f.code === form)?.formCode !== undefined;

  const rows = useMemo(
    () =>
      selectable.map((c) => ({
        type: c,
        values: cube.series("share", "year", { form: c.code, sex }),
      })),
    [selectable, cube, sex],
  );

  const panels = useMemo((): Panel[] => {
    const at = (measure: "workers" | "share") =>
      cube.series(measure, "year", { form, sex });
    return [
      {
        key: "workers",
        title: "人数",
        unit: "万人",
        format: (v) => one.format(v),
        formatTick: (v) => one.format(v),
        series: [
          {
            key: "workers",
            label: "",
            points: dense(years, at("workers")),
            emphasized: true,
          },
        ],
      },
      {
        key: "share",
        title: "構成比",
        unit: shareUnit(form),
        format: (v) => `${pct.format(v * 100)}%`,
        formatTick: (v) => `${pct.format(v * 100)}%`,
        series: [
          {
            key: "share",
            label: "",
            points: dense(years, at("share")),
            emphasized: true,
          },
        ],
      },
    ];
  }, [cube, form, sex, years]);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[288px] shrink-0 max-lg:w-full">
        <h2 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          就業形態
        </h2>
        <div className="max-h-[70vh] overflow-y-auto lg:max-h-[calc(100dvh-8rem)]">
          <TypeList rows={rows} years={years} selected={form} onSelect={setForm} />
        </div>
        <p className="px-2 pt-3 text-[10.5px] leading-relaxed text-faint">
          自営・家族・雇用は1953年〜。正規・非正規とその内訳は2013年〜。
        </p>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-3 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[19px] font-semibold tracking-tight">{current.label}</h1>
            <p
              className={`tnum text-[13px] ${hoverYear === null ? "text-faint" : "text-ink"}`}
            >
              {hoverYear ?? TO}年
              {starts2013 && (
                <span className="ml-2 text-[11px] text-faint">2013年〜</span>
              )}
            </p>
          </div>
          <Segmented options={SEXES} value={sex} onChange={setSex} label="性別" />
        </header>

        <div ref={ref} className="min-h-[420px]">
          {width > 0 && (
            <TrendStack
              panels={panels}
              domain={[FROM, TO]}
              width={width}
              hoverYear={hoverYear}
              onHoverYear={setHoverYear}
            />
          )}
        </div>

        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          正規・非正規の構成比は役員を除く雇用者を分母とする。パート等の内訳は非正規を分母とする。自営・家族・雇用は就業者総数を分母とする。
        </p>
      </main>
    </div>
  );
}
