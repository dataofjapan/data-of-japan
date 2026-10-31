import { CATALOG, CATEGORIES, type CatalogEntry } from "./catalog.ts";
import { CardIcon } from "./card-icons.tsx";
import { VISUALIZING_URL, VisualizingMark } from "./Brand.tsx";

// 領域の番号は大字で振る。数字よりも静かに並ぶ。
const CATEGORY_NUMERALS = ["壱", "弐", "参", "肆", "伍", "陸"];

const LINK_TRANSITION =
  "transition-colors duration-150 ease-[var(--ease-out)]";

const CARD_GRID =
  "grid grid-cols-1 gap-x-8 gap-y-12 min-[30rem]:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 min-[87.5rem]:grid-cols-4";

/** カードが1枚の領域は、続けて同じ行に置く。 */
function catalogBands() {
  const bands: (
    | { key: string; kind: "wide"; index: number; label: string; items: CatalogEntry[] }
    | { key: string; kind: "row"; cells: { index: number; label: string; entry: CatalogEntry }[] }
  )[] = [];

  CATEGORIES.forEach((cat, index) => {
    const items = CATALOG.filter((e) => e.category === cat.id);
    const only = items.length === 1 ? items[0] : undefined;
    const open = bands.at(-1);
    if (only && open?.kind === "row") {
      open.cells.push({ index, label: cat.label, entry: only });
      return;
    }
    if (only) {
      bands.push({
        key: cat.id,
        kind: "row",
        cells: [{ index, label: cat.label, entry: only }],
      });
      return;
    }
    bands.push({ key: cat.id, kind: "wide", index, label: cat.label, items });
  });

  return bands;
}

export function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-14 px-6 pt-14 sm:px-10 lg:flex-row lg:gap-16 lg:px-20 lg:pt-[120px] min-[87.5rem]:gap-20">
      <SideTitle />
      <MobileTitle />

      <main className="flex min-w-0 grow flex-col gap-20 lg:gap-24">
        {catalogBands().map((band) =>
          band.kind === "wide" ? (
            <section key={band.key} className="flex flex-col gap-8 lg:gap-10">
              <CategoryHeading index={band.index} label={band.label} />
              <ul className={CARD_GRID}>
                {band.items.map((entry) => (
                  <li key={entry.slug}>
                    <ProjectCard entry={entry} />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <ul key={band.key} className={CARD_GRID}>
              {band.cells.map((cell) => (
                <li key={cell.entry.slug} className="flex flex-col gap-8 lg:gap-10">
                  <CategoryHeading index={cell.index} label={cell.label} />
                  <ProjectCard entry={cell.entry} />
                </li>
              ))}
            </ul>
          ),
        )}

        <p><a href="/society/foreign-residents/">関連：住民基本台帳から見る外国人住民の居住地</a></p><footer className="flex flex-col gap-2 pt-6 pb-24 text-[11px] leading-loose tracking-[0.06em] text-muted">
          <p>
            日本にいる外国人を公的統計でたどるシリーズのハブです。
          </p>
          <p>
            出典: 日本政府観光局（JNTO）「訪日外客統計」、観光庁、出入国在留管理庁、厚生労働省、警察庁。
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
        日本にいる外国人は、
        <br />
        どこから来たか
      </h1>
      <p className="vertical pt-32 font-serif text-[15px] leading-[2] tracking-[0.18em] text-muted">
        訪れる人、住む人、働く人、検挙された人。公的統計でたどる。
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
        日本にいる
        <wbr />
        外国人は、
        <br />
        どこから
        <wbr />
        来たか
      </h1>
      <p className="font-serif text-[14px] leading-loose tracking-[0.12em] text-muted">
        訪れる人、住む人、働く人、検挙された人。公的統計でたどる。
      </p>
    </header>
  );
}

function CategoryHeading({ index, label }: { index: number; label: string }) {
  return (
    <h2 className="flex items-baseline gap-6 font-serif">
      <span className="text-[14px] text-accent" aria-hidden>
        {CATEGORY_NUMERALS[index]}
      </span>
      <span className="text-[20px] font-medium tracking-[0.3em] lg:text-[22px]">
        {label}
      </span>
      <span className="h-px grow self-center bg-rule" aria-hidden />
    </h2>
  );
}

function ProjectCard({ entry }: { entry: CatalogEntry }) {
  const pending = entry.status === "pending" || entry.url === null;
  const body = (
    <div className={`flex flex-col gap-4 ${pending ? "opacity-40" : ""}`}>
      <div className="card-art flex items-center justify-center overflow-hidden">
        <span className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
          <CardIcon slug={entry.slug} />
        </span>
      </div>
      <p
        className={`font-serif text-[16px] leading-[1.7] font-medium tracking-[0.04em] ${LINK_TRANSITION} ${
          pending ? "text-muted" : "text-ink group-hover:text-accent"
        }`}
      >
        {entry.title}
      </p>
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
