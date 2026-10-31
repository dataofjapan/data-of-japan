import { Suspense } from "react";
import { ElectionView } from "./views/ElectionView.tsx";
import { TrendView } from "./views/TrendView.tsx";
import { useUrlState } from "./hooks/useUrlState.ts";
import { SeriesBar, SeriesFooter } from "./components/Brand.tsx";

const VIEWS = [
  { id: "election", label: "選挙", hint: "選挙区と比例代表" },
  { id: "trend", label: "推移", hint: "2001–2025" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const SIBLINGS = [
  { href: "/politics/elections/sangiin/votes/", label: "参議院選挙で、どの党がどれだけ票を得てきたか" },
  { href: "/politics/elections/sangiin/candidates/", label: "参議院選挙で、誰が立候補し、誰が当選したか" },
  { href: "/politics/elections/sangiin/turnout/", label: "参議院選挙で、どれだけの人が投票したか" },
];

export function App() {
  const [view, setView] = useUrlState<ViewId>("view", "election", (v) => VIEWS.some((x) => x.id === v));

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-paper/85 backdrop-blur-sm">
        <SeriesBar />
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-4 px-6 pt-5">
          <div className="pb-2">
            <h1 className="text-[15px] font-semibold tracking-tight">参議院選挙で、得た票はどれだけ議席になったか</h1>
            <p className="text-[11px] text-muted">総務省「参議院議員通常選挙結果調」</p>
          </div>
          <nav className="-mb-px flex gap-1" aria-label="ビュー">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`cursor-pointer border-b-2 px-3 pt-1 pb-2 text-[13px] whitespace-nowrap transition-colors duration-150 ${
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
        {view === "election" && <ElectionView />}
        {view === "trend" && <TrendView />}
      </Suspense>

      <footer className="mx-auto w-full max-w-[1240px] px-6 pt-2 pb-10 text-[11px] leading-relaxed text-faint">
        出典: 総務省「参議院議員通常選挙結果調」。得票は兄弟サイト「参議院選挙で、どの党がどれだけ票を得てきたか」、
        議席は兄弟サイト「参議院選挙で、誰が立候補し、誰が当選したか」が各回の結果ページの表から読んだ値。第27回は確定結果が未公表のため速報。
        <span className="mt-2 flex flex-wrap gap-x-4">
          {SIBLINGS.map((s) => (
            <a key={s.href} href={s.href} className="w-fit transition-colors duration-150 hover:text-muted">
              {s.label}
            </a>
          ))}
        </span>
        <SeriesFooter />
      </footer>
    </div>
  );
}

function Loading() {
  return <div className="mx-auto w-full max-w-[1240px] px-6 py-16 text-[12px] text-faint">読み込み中</div>;
}
