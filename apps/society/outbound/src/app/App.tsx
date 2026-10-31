import { Suspense } from "react";
import { EraView } from "./views/EraView.tsx";
import { WhoView } from "./views/WhoView.tsx";
import { PurposeView } from "./views/PurposeView.tsx";
import { useUrlState } from "./hooks/useUrlState.ts";
import { SeriesBar, SeriesFooter } from "./components/Brand.tsx";

const VIEWS = [
  { id: "era", label: "時代", hint: "1964–2025" },
  { id: "who", label: "誰が", hint: "都道府県・年齢" },
  { id: "purpose", label: "目的", hint: "目的と州" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function App() {
  const [view, setView] = useUrlState<ViewId>("view", "era", (v) => VIEWS.some((x) => x.id === v));

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-paper/85 backdrop-blur-sm">
        <SeriesBar />
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-4 px-6 pt-5">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">日本人はどれだけ海外へ出てきたか</h1>
            <p className="text-[11px] text-muted">出入国在留管理庁「出入国管理統計」、日本政府観光局（JNTO）</p>
          </div>
          <nav className="flex gap-1 -mb-px" aria-label="ビュー">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`cursor-pointer border-b-2 px-3 pt-1 pb-2 text-[13px] transition-colors duration-150 ${
                  view === v.id ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {v.label}
                <span className="ml-1.5 text-[10px] font-normal text-faint">{v.hint}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <Suspense key={view} fallback={<Loading />}>
        {view === "era" && <EraView />}
        {view === "who" && <WhoView />}
        {view === "purpose" && <PurposeView />}
      </Suspense>

      <footer className="mx-auto w-full max-w-[1240px] px-6 pt-2 pb-10 text-[11px] leading-relaxed text-faint">
        出典: 出入国在留管理庁「出入国管理統計」の出国日本人数（1964年以降は日本政府観光局の年次表）、観光庁「旅行・観光消費動向調査」（目的と州だけ）。出国は回数で、海外に3か月以上住む人の人数（在留邦人）の内訳ではない。目的と州は帰国した人数に合わせた標本の推計で、出国回数の内訳でもない。
        <SeriesFooter />
      </footer>
    </div>
  );
}

function Loading() {
  return <div className="mx-auto w-full max-w-[1240px] px-6 py-16 text-[12px] text-faint">読み込み中</div>;
}
