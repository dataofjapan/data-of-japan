/**
 * 目的ビュー。観光庁の海外旅行（目的 × 州）。出国回数の内訳ではない。
 */

import { use, useMemo, useState } from "react";
import { loadPurpose } from "../data/chunks.ts";
import { SplitBars, SplitLegend } from "../components/SplitBars.tsx";
import { PurposeStream } from "../components/PurposeStream.tsx";
import { TrendStack, type Panel } from "../components/TrendStack.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { YearSelect } from "../components/YearSelect.tsx";
import { useWidth } from "../hooks/useWidth.ts";
import { useUrlState } from "../hooks/useUrlState.ts";

const SHAPES = [
  { value: "line", label: "折れ線" },
  { value: "stream", label: "ストリーム" },
] as const;

type Shape = (typeof SHAPES)[number]["value"];

/** ストリームは合計を含まない。3層が合計。 */
const STREAM_LAYERS = [
  { key: "tourism", fill: "fill-accent/75" },
  { key: "visit", fill: "fill-accent/35" },
  { key: "business", fill: "fill-ink/20" },
] as const;

const int = new Intl.NumberFormat("ja-JP");
const man = (v: number) => (v >= 10_000 ? `${int.format(Math.round(v / 10_000))}万` : int.format(v));

const SHORT: Record<string, string> = { total: "計", tourism: "観光", visit: "帰省", business: "出張" };

export function PurposeView() {
  const { years, destinations, purposes, cube } = use(loadPurpose());
  const yearNums = useMemo(() => years.map(Number), [years]);
  const [dest, setDest] = useUrlState<string>("dest", "asia", (v) => destinations.some((d) => d.code === v));
  const [year, setYear] = useUrlState<string>("pyear", years.at(-1)!, (v) => years.includes(v));
  const [shape, setShape] = useUrlState<Shape>("shape", "line", (v) => SHAPES.some((s) => s.value === v));
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const current = destinations.find((d) => d.code === dest)!;

  const panels = useMemo((): Panel[] => {
    const points = (purpose: string) =>
      yearNums.map((y, i) => ({ year: y, value: cube.series("trips", "year", { dest, purpose })[i] ?? null }));
    return [
      {
        key: "trips",
        title: "延べ旅行者数",
        unit: "人",
        format: (v) => int.format(Math.round(v)),
        formatTick: man,
        series: purposes.map((p) => ({
          key: p.code,
          label: SHORT[p.code] ?? p.label,
          points: points(p.code),
          emphasized: p.code === "total",
        })),
      },
    ];
  }, [cube, dest, purposes, yearNums]);

  const ranking = destinations
    .filter((d) => d.code !== "world")
    .map((d) => ({
      code: d.code,
      label: d.label,
      a: cube.at("trips", { dest: d.code, purpose: "tourism", year }),
      b: cube.at("trips", { dest: d.code, purpose: "business", year }),
    }))
    .sort((x, y) => (y.a ?? 0) + (y.b ?? 0) - ((x.a ?? 0) + (x.b ?? 0)));

  const visit = cube.at("trips", { dest: "world", purpose: "visit", year });

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col">
      <aside className="w-[200px] shrink-0 max-lg:w-full">
        <ul className="flex flex-col" aria-label="州">
          {destinations.map((d) => {
            const isSelected = d.code === dest;
            return (
              <li key={d.code}>
                <button
                  type="button"
                  onClick={() => setDest(d.code)}
                  aria-pressed={isSelected}
                  className={`flex w-full cursor-pointer rounded px-2 py-1 text-left text-[12px] transition-colors duration-150 active:scale-[0.97] ${
                    isSelected ? "bg-ink/[0.06] font-semibold text-ink" : "text-muted hover:bg-ink/[0.03] hover:text-ink"
                  }`}
                >
                  {d.label}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-start justify-between gap-3 pb-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">{current.label}</h2>
            <p className="max-w-[62ch] pt-1 text-[12px] leading-relaxed text-muted">
              {years[0]}–{years.at(-1)}年。観光庁の標本調査を、帰国した日本人の数に広げた推計。出国回数の内訳ではなく、行き先は州までで国ではない。
            </p>
          </div>
          <Segmented label="グラフ" value={shape} onChange={setShape} options={SHAPES} />
        </header>

        <div ref={ref}>
          {width > 0 &&
            (shape === "line" ? (
              <TrendStack
                panels={panels}
                width={width}
                domain={[yearNums[0]!, yearNums.at(-1)!]}
                hoverYear={hoverYear}
                onHoverYear={setHoverYear}
              />
            ) : (
              <PurposeStream
                years={yearNums}
                layers={STREAM_LAYERS.map((layer) => ({
                  ...layer,
                  label: SHORT[layer.key]!,
                  values: cube.series("trips", "year", { dest, purpose: layer.key }),
                }))}
                width={width}
                hoverYear={hoverYear}
                onHoverYear={setHoverYear}
                format={(v) => int.format(Math.round(v))}
              />
            ))}
        </div>

        <section className="mt-10 max-w-[560px]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <SplitLegend a="観光・レクリエーション" b="出張・業務" />
            <YearSelect years={years} value={year} onChange={setYear} />
          </div>
          <SplitBars rows={ranking} />
          <p className="px-2 pt-2 text-[10.5px] leading-relaxed text-faint">
            帰省・知人訪問は棒に入っていない。{year}年の合計は {visit === null ? "—" : `${int.format(visit)}人`}。
          </p>
        </section>
      </main>
    </div>
  );
}
