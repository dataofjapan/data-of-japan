import { PREFECTURES, REGIONS, type Prefecture } from "./catalog.ts";
import { VISUALIZING_URL, VisualizingMark } from "./Brand.tsx";

const LINK_TRANSITION = "transition-colors duration-150 ease-[var(--ease-out)]";

export function App() {
  const published = PREFECTURES.filter((p) => p.site !== null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-14 px-6 pt-14 sm:px-10 lg:flex-row lg:gap-16 lg:px-20 lg:pt-[120px] min-[87.5rem]:gap-20">
      <SideTitle />
      <MobileTitle />

      <main className="flex min-w-0 grow flex-col gap-16 lg:gap-20">
        <p className="text-[12px] leading-loose tracking-[0.06em] text-muted">
          都道府県ごとに、知事選挙の得票と投票率を県全体と市町村別でたどるサイトを作っている。いま公開しているのは
          {published.length}都道府県。
        </p>

        <section className="flex flex-col gap-6">
          <h2 className="flex items-baseline gap-6 font-serif">
            <span className="text-[18px] font-medium tracking-[0.3em] lg:text-[20px]">公開中</span>
            <span className="h-px grow self-center bg-rule" aria-hidden />
          </h2>
          <ul className="grid grid-cols-1 gap-4 min-[30rem]:grid-cols-2 xl:grid-cols-3">
            {published.map((p) => (
              <li key={p.code}>
                <FeaturedCard prefecture={p} />
              </li>
            ))}
          </ul>
        </section>

        {REGIONS.map((region) => (
          <section key={region.id} className="flex flex-col gap-6">
            <h2 className="flex items-baseline gap-6 font-serif">
              <span className="text-[18px] font-medium tracking-[0.3em] lg:text-[20px]">{region.label}</span>
              <span className="h-px grow self-center bg-rule" aria-hidden />
            </h2>
            <ul className="grid grid-cols-2 gap-3 min-[30rem]:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 min-[87.5rem]:grid-cols-6">
              {PREFECTURES.filter((p) => p.region === region.id).map((p) => (
                <li key={p.code}>
                  <PrefectureCard prefecture={p} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <footer className="flex flex-col gap-2 pt-6 pb-24 text-[11px] leading-loose tracking-[0.06em] text-muted">
          <p>都道府県知事選挙の記録をもとにしたシリーズの表紙です。各都道府県のページは独立したサイトです。</p>
          <p>出典: 各都道府県選挙管理委員会の年報・選挙結果調ほか（出典の詳細は各サイトに記載）。</p>
          <a href={VISUALIZING_URL} className={`mt-4 inline-flex w-fit items-center gap-2.5 ${LINK_TRANSITION} hover:text-ink`}>
            <VisualizingMark className="h-8 w-auto" />
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] tracking-[0.08em] text-faint">Visualized by</span>
              <span className="text-[13px] font-medium tracking-[0.04em]">Data of Japan</span>
            </span>
          </a>
        </footer>
      </main>
    </div>
  );
}

/** 広い画面: 縦組みのタイトルを左に置き、スクロールしても残す。 */
function SideTitle() {
  return (
    <aside className="sticky top-[120px] hidden shrink-0 flex-row-reverse gap-7 self-start lg:flex">
      <h1 className="vertical v-title font-serif font-medium">
        都道府県
        <br />
        知事選挙の記録
      </h1>
      <p className="vertical pt-32 font-serif text-[15px] leading-[2] tracking-[0.18em] text-muted">
        知事選挙の結果でたどる、長期の変化。
      </p>
      <a
        href={VISUALIZING_URL}
        className={`flex flex-col items-center gap-3 pt-32 text-[11px] tracking-[0.3em] text-muted ${LINK_TRANSITION} hover:text-ink`}
      >
        <VisualizingMark className="h-7 w-auto" />
        <span className="vertical">Data of Japan</span>
      </a>
    </aside>
  );
}

/** 狭い画面: 縦組みは収まらないので横組みにする。 */
function MobileTitle() {
  return (
    <header className="flex flex-col gap-5 lg:hidden">
      <a
        href={VISUALIZING_URL}
        className={`inline-flex w-fit items-center gap-2 text-[11px] tracking-[0.3em] text-muted ${LINK_TRANSITION} hover:text-ink`}
      >
        <VisualizingMark className="h-6 w-auto" />
        Data of Japan
      </a>
      <h1 className="font-serif text-[26px] leading-snug font-medium tracking-[0.12em] break-keep sm:text-[40px]">
        都道府県
        <br />
        知事選挙の記録
      </h1>
      <p className="font-serif text-[14px] leading-loose tracking-[0.12em] text-muted">知事選挙の結果でたどる、長期の変化。</p>
    </header>
  );
}

/** 公開中の都道府県。一覧の小さな札より大きく、タイトルと範囲を添える。 */
function FeaturedCard({ prefecture: p }: { prefecture: Prefecture }) {
  if (p.site === null) return null;
  return (
    <a
      href={p.site.url}
      className="group flex h-full flex-col gap-3 rounded-md border border-rule-strong bg-surface px-5 py-5 transition-[border-color,transform] duration-150 ease-[var(--ease-out)] hover:border-accent active:scale-[0.99]"
    >
      <span className={`font-serif text-[22px] font-medium tracking-[0.1em] ${LINK_TRANSITION} group-hover:text-accent`}>
        {p.name}
      </span>
      <span className="font-serif text-[14px] leading-[1.7] tracking-[0.04em]">
        {p.name}知事選挙で、誰がどれだけ票を得てきたか
      </span>
      <span className="tnum flex flex-wrap gap-x-3 text-[11px] tracking-[0.04em] text-muted">
        <span>県全体 {p.site.period}</span>
        <span>市町村別 {p.site.municipal}</span>
      </span>
    </a>
  );
}

function PrefectureCard({ prefecture: p }: { prefecture: Prefecture }) {
  if (p.site === null) {
    return (
      <div className="flex h-full flex-col gap-1 rounded-md border border-rule px-3 py-2.5 opacity-50" aria-disabled="true">
        <span className="font-serif text-[15px] tracking-[0.06em] text-muted">{p.name}</span>
        <span className="text-[10px] tracking-[0.04em] text-faint">準備中</span>
      </div>
    );
  }

  return (
    <a
      href={p.site.url}
      className={`group flex h-full flex-col gap-1 rounded-md border border-rule-strong bg-surface px-3 py-2.5 transition-[border-color,transform] duration-150 ease-[var(--ease-out)] hover:border-accent active:scale-[0.98]`}
    >
      <span className={`font-serif text-[15px] font-medium tracking-[0.06em] ${LINK_TRANSITION} group-hover:text-accent`}>
        {p.name}
      </span>
      <span className="tnum text-[10px] leading-relaxed tracking-[0.04em] text-muted">
        {p.site.period}
        <br />
        市町村別 {p.site.municipal}
      </span>
    </a>
  );
}
