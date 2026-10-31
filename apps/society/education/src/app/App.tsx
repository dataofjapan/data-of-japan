import { Suspense } from "react";
import { EraView } from "./views/EraView.tsx";
import { GenderView } from "./views/GenderView.tsx";
import { SchoolView } from "./views/SchoolView.tsx";
import { useUrlState } from "./hooks/useUrlState.ts";
import { SeriesBar, SeriesFooter } from "./components/Brand.tsx";

const VIEWS = [
  { id: "era", label: "時代", hint: "1948–2023", ready: true },
  { id: "gender", label: "男女", hint: "性別差", ready: true },
  { id: "school", label: "学校種", hint: "在学者", ready: true },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function App() {
  const [view, setView] = useUrlState<ViewId>("view", "era", (v) =>
    VIEWS.some((x) => x.id === v && x.ready),
  );

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-paper/85 backdrop-blur-sm">
        <SeriesBar />
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-4 px-6 pt-5">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">
              日本人はどこまで学ぶようになったか
            </h1>
            <p className="text-[11px] text-muted">
              文部科学省「学校基本調査」（社会・人口統計体系経由含む）
            </p>
          </div>
          <nav className="flex gap-1 -mb-px" aria-label="ビュー">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.ready}
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`cursor-pointer border-b-2 px-3 pt-1 pb-2 text-[13px] transition-colors duration-150 disabled:cursor-not-allowed disabled:text-faint ${
                  view === v.id
                    ? "border-accent font-semibold text-ink"
                    : "border-transparent text-muted hover:text-ink disabled:hover:text-faint"
                }`}
              >
                {v.label}
                <span className="ml-1.5 text-[10px] font-normal text-faint">
                  {v.ready ? v.hint : "準備中"}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <Suspense key={view} fallback={<Loading />}>
        {view === "era" && <EraView />}
        {view === "gender" && <GenderView />}
        {view === "school" && <SchoolView />}
      </Suspense>

      <footer className="mx-auto w-full max-w-[1240px] px-6 pt-2 pb-10 text-[11px] leading-relaxed text-faint">
        出典: 文部科学省「学校基本調査」（社会・人口統計体系「Ｅ　教育」経由含む、e-Stat）。
        進学率は年次統計（1948–2016）を主とし、高校（通信制除く）と大学・短大現役は SSDS
        で2023年まで延長。学校種は在学者数とその構成比。
        <SeriesFooter />
      </footer>
    </div>
  );
}

function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-16 text-[12px] text-faint">
      読み込み中
    </div>
  );
}
