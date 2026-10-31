/**
 * 時代ビュー。全国の有権者のうち投票した人を、第1回（1947年）から回ごとの棒で見せる。
 */

import { use, useMemo } from "react";
import type { System } from "../../lib/data/cube.ts";
import { FIRST_PR } from "../../lib/data/elections.ts";
import { loadEra } from "../data/load.ts";
import { election, longDate, man, pct, points, systemLabel } from "../data/format.ts";
import { SEXES, SEX_LABEL, isSex, pick, rateOf, type Sex } from "../data/sex.ts";
import { Preliminary } from "../components/Preliminary.tsx";
import { Segmented } from "../components/Segmented.tsx";
import { SeriesLegend } from "../components/SeriesLegend.tsx";
import { TurnoutBars, toColumn, type Column, type Measure } from "../components/TurnoutBars.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const SYSTEMS = [
  { value: "sd", label: "選挙区" },
  { value: "pr", label: "比例代表" },
] as const;

const MEASURES = [
  { value: "rate", label: "投票率" },
  { value: "count", label: "人数" },
] as const;

const MARKS = [
  { n: FIRST_PR, label: "比例代表制" },
  { n: 24, label: "18歳選挙権" },
];

export function EraView() {
  const era = use(loadEra());
  const last = era.elections.at(-1)!;

  const [system, setSystem] = useUrlState<System>("sys", "sd", (v) => v === "sd" || v === "pr");
  const [sex, setSex] = useUrlState<Sex>("sex", "all", isSex);
  const [measure, setMeasure] = useUrlState<Measure>("measure", "rate", (v) => v === "rate" || v === "count");
  const [focusParam, setFocus] = useUrlState<string>("n", String(last), (v) => era.elections.includes(Number(v)));
  const focus = Number(focusParam);
  const fi = era.elections.indexOf(focus);
  const series = era[system];

  const columns = useMemo(
    (): Column[] => era.elections.map((n, e) => toColumn(n, series[e]!, sex)),
    [era.elections, series, sex],
  );

  const counts = series[fi]!;
  const prev = fi > 0 ? series[fi - 1]! : null;
  const t = pick(counts, sex);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-6">
      <main className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h1 className="text-[19px] font-semibold tracking-tight">全国の投票率</h1>
          <div className="flex flex-wrap gap-2">
            <Segmented label="制度" options={SYSTEMS} value={system} onChange={setSystem} />
            <Segmented label="男女" options={SEXES} value={sex} onChange={setSex} />
            <Segmented label="尺度" options={MEASURES} value={measure} onChange={setMeasure} />
          </div>
        </header>

        <p className="tnum min-h-9 pb-3 text-[12.5px]">
          <span className="font-semibold">
            第{focus}回 {longDate(focus)}
          </span>
          {election(focus).edition === "速報" && <Preliminary />}
          <span className="text-muted">{` · ${systemLabel(system, focus)}${sex === "all" ? "" : `・${SEX_LABEL[sex]}`} 有権者 ${man(t.electors)} → 投票者 ${man(t.voters)} · `}</span>
          <span className="font-semibold">投票率 {pct(rateOf(t))}</span>
          {prev !== null && <span className="text-muted">{`（前回比 ${points(rateOf(t) - rateOf(pick(prev, sex)))}）`}</span>}
          {sex !== "all" && (
            <span className="text-muted">{` · 女性 − 男性 ${points(rateOf(pick(counts, "f")) - rateOf(pick(counts, "m")))}`}</span>
          )}
        </p>

        <div className="flex h-5 items-center">
          <SeriesLegend sex={sex} />
        </div>

        <TurnoutBars
          columns={columns}
          measure={measure}
          focused={focus}
          onFocus={(n) => setFocus(String(n))}
          marks={MARKS}
          height={340}
          label={`全国の${system === "pr" ? "比例代表" : "選挙区"}の${SEX_LABEL[sex]}の${measure === "rate" ? "投票率" : "有権者数と投票者数"}`}
        />

        <ul className="mt-5 flex flex-col gap-1 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          <li>投票率は、投票者数 ÷ 選挙当日の有権者数。棒の濃い部分が投票者、淡い部分が棄権者で、合わせて有権者。棒を押すと、その回を上の要約に出す。</li>
          <li>
            「選挙区」は第12回までの地方区、「比例代表」は第12回までの全国区（全国を1つの選挙区とする選挙）を含む。比例代表は第13回（1983年）から。第1回の地方区の有権者数は、無投票だった選挙区を除いた数。
          </li>
          <li>
            総務省の注記による制度の変化：1980年（第12回）と1986年（第14回）は衆参同日選挙。1998年（第18回）から投票時間が2時間延びて午後8時まで。2004年（第20回）から期日前投票制度。2007年（第21回）から選挙区でも在外投票。2016年（第24回）から選挙権年齢が18歳以上。
          </li>
          <li>
            第1〜26回は第26回確定結果調の「当日有権者数、投票者数」（印字された男女別投票率と一致を確認）、第27回は結果ページの表（確定結果が未公表のため速報）。
          </li>
        </ul>
      </main>
    </div>
  );
}
