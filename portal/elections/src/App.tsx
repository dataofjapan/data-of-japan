import type { LucideIcon } from "lucide-react";
import { CATALOG, CATEGORIES, type CatalogEntry } from "./catalog.ts";
import { VISUALIZING_URL, VisualizingMark } from "./Brand.tsx";
import { MARKS } from "./marks.ts";

// 領域の番号は大字で振る。数字よりも静かに並ぶ。
const CATEGORY_NUMERALS = ["壱", "弐", "参", "肆", "伍", "陸"];

const LINK_TRANSITION =
  "transition-colors duration-150 ease-[var(--ease-out)]";

export function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-14 px-6 pt-14 sm:px-10 lg:flex-row lg:gap-16 lg:px-20 lg:pt-[120px] min-[87.5rem]:gap-20">
      <SideTitle />
      <MobileTitle />

      <main className="flex min-w-0 grow flex-col gap-20 lg:gap-24">
        {CATEGORIES.map((cat, i) => {
          const items = CATALOG.filter((e) => e.category === cat.id);
          return (
            <section key={cat.id} className="flex flex-col gap-8 lg:gap-10">
              <h2 className="flex items-baseline gap-6 font-serif">
                <span className="text-[14px] text-accent" aria-hidden>
                  {CATEGORY_NUMERALS[i]}
                </span>
                <span className="text-[20px] font-medium tracking-[0.3em] lg:text-[22px]">
                  <a href={`/politics/elections/${cat.id}/`} className="hover:text-accent">{cat.label}</a>
                </span>
                <span className="h-px grow self-center bg-rule" aria-hidden />
              </h2>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-12 min-[30rem]:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 min-[87.5rem]:grid-cols-4">
                {items.map((entry) => (
                  <li key={entry.slug}>
                    <ProjectCard entry={entry} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <footer className="flex flex-col gap-2 pt-6 pb-24 text-[11px] leading-loose tracking-[0.06em] text-muted">
          <p>
            国政選挙・都道府県知事選挙の記録をもとにした可視化コンテンツの一覧です。
          </p>
          <p>
            出典: 総務省「衆議院議員総選挙・最高裁判所裁判官国民審査結果調」「参議院議員通常選挙結果調」ほか。
          </p>
          <a
            href={VISUALIZING_URL}
            className={`mt-4 inline-flex w-fit items-center gap-2.5 ${LINK_TRANSITION} hover:text-ink`}
          >
            <VisualizingMark className="h-8 w-auto" />
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] tracking-[0.08em] text-faint">
                Visualized by
              </span>
              <span className="text-[13px] font-medium tracking-[0.04em]">
                Data of Japan
              </span>
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
        日本人は、
        <br />
        どう政治を選んできたか
      </h1>
      <p className="vertical pt-32 font-serif text-[15px] leading-[2] tracking-[0.18em] text-muted">
        国政選挙と知事選挙の記録でたどる、長期の変化。
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
        日本人は、
        <br />
        どう政治を
        <wbr />
        選んできたか
      </h1>
      <p className="font-serif text-[14px] leading-loose tracking-[0.12em] text-muted">
        国政選挙と知事選挙の記録でたどる、長期の変化。
      </p>
    </header>
  );
}

/** 線幅 1 を non-scaling-stroke で画面画素に固定する。 */
function LineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      aria-hidden
      strokeWidth={1}
      nonScalingStroke
      className="card-mark h-20 w-20 text-ink"
    />
  );
}

function CardMark({ slug }: { slug: string }) {
  const Icon = MARKS[slug];
  if (!Icon) return null;
  return <LineIcon icon={Icon} />;
}

function ProjectCard({ entry }: { entry: CatalogEntry }) {
  const pending = entry.status === "pending" || entry.url === null;
  const body = (
    <div className={`flex flex-col gap-4 ${pending ? "opacity-40" : ""}`}>
      <div className="card-art flex items-center justify-center overflow-hidden">
        <span className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
          <CardMark slug={entry.slug} />
        </span>
      </div>
      <p
        className={`font-serif text-[16px] leading-[1.7] font-medium tracking-[0.04em] ${LINK_TRANSITION} ${
          pending ? "text-muted" : "text-ink group-hover:text-accent"
        }`}
      >
        {entry.title}
      </p>
      <p className="text-[13px] leading-loose text-muted">{entry.description}</p>
      <p className="flex flex-wrap gap-x-3 text-[11px] tracking-[0.04em] text-muted">
        <span>{entry.source}</span>
        {entry.period !== "—" && <span className="tnum">{entry.period}</span>}
        {pending && <span className="text-faint">準備中</span>}
      </p>
    </div>
  );

  if (pending || entry.url === null) {
    return (
      <div className="block cursor-default" aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <a href={entry.url} className="group block active:scale-[0.99]">
      {body}
    </a>
  );
}
