import { Suspense } from "react";
import { EraView } from "./views/EraView.tsx";
import { NationsView } from "./views/NationsView.tsx";
import { useUrlState } from "./hooks/useUrlState.ts";
import { SeriesBar, SeriesFooter } from "./components/Brand.tsx";

const VIEWS = [
  { id: "era", label: "時代", hint: "2015–" },
  { id: "nations", label: "国・地域", hint: "2015–" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function App() {
  const [view, setView] = useUrlState<ViewId>("view", "era", (v) => VIEWS.some((x) => x.id === v));

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-paper/85 backdrop-blur-sm">
        <SeriesBar />
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-4 px-6 pt-5">
          <div className="pb-2">
            <h1 className="text-[15px] font-semibold tracking-tight">日本で検挙された外国人は、どこから来たか</h1>
            <p className="text-[11px] text-muted">警察庁「犯罪統計書」</p>
            <p className="mt-2 max-w-[640px] text-[11px] leading-relaxed text-muted">
              件数と人員は人口あたりの率ではない。国籍の差には、在留する人数の違いが含まれる。来日外国人は、定着居住者、在日米軍関係者、在留資格不明の者を除く。特別法犯は交通法令違反を除く検挙で、刑法犯とは足さない。入管法違反が特別法犯の件数を押し上げる。
            </p>
          </div>
          <nav className="-mb-px flex gap-1" aria-label="ビュー">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`cursor-pointer border-b-2 px-3 pt-1 pb-2 text-[13px] whitespace-nowrap transition-colors duration-150 ease-out ${
                  view === v.id ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {v.label}
                <span className="ml-1.5 text-[10px] font-normal text-faint max-sm:hidden">{v.hint}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <Suspense key={view} fallback={<Loading />}>
        {view === "era" && <EraView />}
        {view === "nations" && <NationsView />}
      </Suspense>

      <footer className="mx-auto w-full max-w-[1240px] px-6 pt-2 pb-10 text-[11px] leading-relaxed text-faint">
        出典: 警察庁「犯罪統計書」令和6年の129表、132表、133表。2015年から2024年。刑法犯は交通業過を除く。「来日外国人」は129表の注にいう定着居住者（永住権を有する者等）以外で、それ以外は「その他の外国人」。警察白書は、永住者・永住者の配偶者等・特別永住者を除いた在留外国人の国籍構成が国によって違う、と注記している。「中国」には台湾、香港等を含む。韓国と朝鮮は表の1行。
        <SeriesFooter />
      </footer>
    </div>
  );
}

function Loading() {
  return <div className="mx-auto w-full max-w-[1240px] px-6 py-16 text-[12px] text-faint">読み込み中</div>;
}
