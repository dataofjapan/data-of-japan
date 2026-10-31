/**
 * 都道府県ビュー。選挙区と比例代表で共用する。
 * 回と党を選んで都道府県ごとの得票率を塗り、選んだ都道府県の回ごとの推移を横に出す。
 */

import { use, useMemo } from "react";
import { prefCode } from "../../lib/data/areas.ts";
import type { AreaJson, System } from "../../lib/data/cube.ts";
import { loadPalette, loadPrPref, loadSdPref } from "../data/load.ts";
import { election, longDate, man, pct } from "../data/format.ts";
import { majorParties, stack } from "../data/parties.ts";
import { ElectionSelect } from "../components/ElectionSelect.tsx";
import { PartyList, type PartyRow } from "../components/PartyList.tsx";
import { Preliminary } from "../components/Preliminary.tsx";
import { StackedBars, type Column } from "../components/StackedBars.tsx";
import { TileMap } from "../components/TileMap.tsx";
import { useUrlState } from "../hooks/useUrlState.ts";

const SYSTEM_TEXT: Record<System, string> = { sd: "選挙区", pr: "比例代表" };

/** 都道府県の合計が全国と一致することは npm run verify で確かめてある。 */
function nationalOf(data: AreaJson) {
  const totals = data.totals.map((row) => row.reduce((a, b) => a + b, 0));
  const votes = data.votes.map((byElection) =>
    byElection.map((row) => (row === null ? null : row.reduce<number>((a, b) => a + (b ?? 0), 0))),
  );
  return { totals, votes };
}

export function AreaView({ kind }: { kind: System }) {
  const data = use(kind === "sd" ? loadSdPref() : loadPrPref());
  const palette = use(loadPalette());
  const system = SYSTEM_TEXT[kind];
  const last = data.elections.at(-1)!;

  const [nParam, setN] = useUrlState<string>("n", String(last), (v) => data.elections.includes(Number(v)));
  const [partyParam, setParty] = useUrlState<string>("party", "", (v) => data.parties.includes(v));
  const [area, setArea] = useUrlState<string>("area", "", (v) => data.areas.includes(v));
  const n = Number(nParam);
  const ei = data.elections.indexOf(n);

  const national = useMemo(() => nationalOf(data), [data]);
  const major = useMemo(
    () => majorParties(data.parties, national.votes, national.totals),
    [data.parties, national],
  );

  const rows = useMemo(
    (): PartyRow[] =>
      data.parties
        .flatMap((p, i) => {
          const v = national.votes[i]![ei];
          return v === null || v === undefined ? [] : [{ name: p, votes: v, share: v / national.totals[ei]! }];
        })
        .sort((a, b) => b.votes - a.votes),
    [data.parties, national, ei],
  );

  // 選んだ党がこの回に届出をしていなければ、この回の最大の党に落とす（URL の選択は残す）。
  const party = rows.some((r) => r.name === partyParam) ? partyParam : rows[0]!.name;
  const pi = data.parties.indexOf(party);
  const colors = palette(party);
  const row = rows.find((r) => r.name === party)!;

  const shares = data.areas.map((_, ai) => {
    const v = data.votes[pi]![ei]?.[ai] ?? null;
    return v === null ? null : v / data.totals[ei]![ai]!;
  });

  const ranked = data.areas
    .map((name, ai) => ({ name, share: shares[ai]! }))
    .filter((a) => a.share !== null)
    .sort((a, b) => b.share - a.share);

  const ai = area === "" ? -1 : data.areas.indexOf(area);
  const columns = useMemo(
    (): Column[] =>
      data.elections.map((en, e) => ({
        n: en,
        total: ai < 0 ? national.totals[e]! : data.totals[e]![ai]!,
        segments: stack(
          data.parties,
          data.parties.map((_, p) =>
            ai < 0 ? national.votes[p]![e]! : (data.votes[p]![e]?.[ai] ?? null),
          ),
          major,
          party,
          palette,
        ),
      })),
    [data, national, major, party, ai, palette],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 max-lg:w-full lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100dvh-3rem)] lg:flex-col lg:self-start">
        <h2 className="flex items-baseline justify-between px-2 pb-1 text-[11px] font-semibold tracking-wide text-faint">
          <span>
            党 <span className="font-normal">{rows.length}</span>
          </span>
          <span className="font-normal">全国の得票率</span>
        </h2>
        <PartyList rows={rows} selected={party} onSelect={setParty} palette={palette} />
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="flex min-w-0 items-center gap-2 text-[19px] font-semibold tracking-tight">
              <span aria-hidden className="size-[11px] shrink-0 rounded-[2px]" style={{ backgroundColor: colors.base }} />
              <span className="truncate">{party}</span>
            </h1>
            <p className="tnum shrink-0 text-[13px] text-muted">
              {system} 全国 {pct(row.share)}
            </p>
          </div>
          <ElectionSelect elections={data.elections} value={n} onChange={(v) => setN(String(v))} />
        </header>

        <p className="tnum min-h-9 pb-4 text-[12.5px] text-muted">
          {longDate(n)}
          {election(n).edition === "速報" && <Preliminary />}
          {ranked.length > 0 && (
            <>
              {" · 最も高い "}
              <span className="font-semibold text-ink">
                {ranked[0]!.name} {pct(ranked[0]!.share)}
              </span>
              {ranked.length > 1 && (
                <>
                  {" ／ 最も低い "}
                  <span className="font-semibold text-ink">
                    {ranked.at(-1)!.name} {pct(ranked.at(-1)!.share)}
                  </span>
                </>
              )}
              {ranked.length < data.areas.length && ` · 候補なしの都道府県 ${data.areas.length - ranked.length}`}
            </>
          )}
        </p>

        <div className="grid gap-8 xl:grid-cols-[minmax(460px,1fr)_minmax(340px,0.85fr)]">
          <section aria-label="都道府県別の得票率" className="min-w-0">
            <TileMap
              tiles={data.areas.map((name, i) => ({ code: prefCode(name), label: name, share: shares[i]! }))}
              hue={colors.hue}
              pinned={area === "" ? null : prefCode(area)}
              onPin={(code) => setArea(code === null ? "" : data.areas[Number(code) - 1]!)}
            />
          </section>

          <section aria-label="推移" className="min-w-0">
            <h2 className="flex items-baseline justify-between pb-2">
              <span className="text-[14px] font-semibold">
                {area === "" ? "全国" : area}の推移
                <span className="ml-2 text-[11px] font-normal text-muted">{system}・得票率</span>
              </span>
              {area !== "" && (
                <button
                  type="button"
                  onClick={() => setArea("")}
                  className="cursor-pointer text-[11px] text-muted transition-colors duration-150 hover:text-ink"
                >
                  全国に戻す
                </button>
              )}
            </h2>
            <StackedBars
              columns={columns}
              measure="share"
              highlighted={party}
              focused={n}
              onFocus={(v) => setN(String(v))}
              height={260}
              label={`${area === "" ? "全国" : area}の${system}の党派別得票率`}
            />
            <p className="pt-2 text-[11px] leading-relaxed text-faint">
              {area === ""
                ? "都道府県を選ぶと、その都道府県の推移に切り替わる。"
                : `有効投票 ${man(data.totals[ei]![ai]!)}（${longDate(n)}）`}
            </p>
          </section>
        </div>

        <ul className="mt-5 flex flex-col gap-1 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted">
          {kind === "sd" ? (
            <>
              <li>選挙区は原則として都道府県ごと。改選数が1の県（一人区）もあれば、複数の県もある。複数の県では同じ党が2人以上を立てることがあり、得票率はその合計。</li>
              <li>第24回から鳥取県・島根県、徳島県・高知県は2県で1つの選挙区（合区）。地図は県ごとの得票で塗る。</li>
              <li>地図は模式図。得票率は党の得票 ÷ その県の選挙区の有効投票。</li>
            </>
          ) : (
            <>
              <li>比例代表は全国で1つの選挙区。都道府県の値は、その都道府県で投じられた比例代表の票の内訳。</li>
              <li>地図は模式図。得票率は党の得票 ÷ その県の比例代表の有効投票。</li>
            </>
          )}
        </ul>
      </main>
    </div>
  );
}
