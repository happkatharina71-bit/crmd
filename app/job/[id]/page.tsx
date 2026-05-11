import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { JOBS, BRIEFINGS, NEWS_POOL, LEVEL_META } from "@/lib/data";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === id);

  if (!job) notFound();

  const briefing = BRIEFINGS[id] ?? [];

  const grouped = {
    1: briefing.filter((b) => b.level === 1),
    2: briefing.filter((b) => b.level === 2),
    3: briefing.filter((b) => b.level === 3),
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <Header />

      <div className="px-5 py-8 max-w-2xl mx-auto">
        {/* Zurück-Link */}
        <Link
          href="/"
          className="text-[#1c63b8] text-[13px] no-underline mb-6 inline-block"
        >
          ← Zurück zum Briefing
        </Link>

        {/* Berufstitel */}
        <div className="mb-6 pb-4 border-b-2 border-[#1a1a1a]">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[#666] font-mono mb-1">
            Briefing für
          </div>
          <div className="text-[24px]">
            {job.label}{" "}
            <span className="italic text-[#666] text-[16px]">— {job.sub}</span>
          </div>
        </div>

        {/* Stufen */}
        {([1, 2, 3] as const).map((lvl) => {
          const items = grouped[lvl];
          if (!items || items.length === 0) return null;
          const meta = LEVEL_META[lvl];

          return (
            <div key={lvl} className="mb-10">
              {/* Stufen-Header */}
              <div className="flex items-baseline gap-3 mb-4">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: meta.color }}
                />
                <div className="text-[20px] font-medium italic">{meta.label}</div>
                <div className="text-[12px] text-[#666] font-mono">{meta.sub}</div>
              </div>

              {/* News-Karten */}
              <div className="flex flex-col gap-4">
                {items.map((b) => {
                  const news = NEWS_POOL.find((n) => n.id === b.newsId);
                  if (!news) return null;

                  return (
                    <article
                      key={b.newsId}
                      className="bg-white px-5 py-5"
                      style={{ borderLeft: `3px solid ${meta.color}` }}
                    >
                      {/* Ressort */}
                      <div className="text-[11px] font-mono text-[#666] mb-1.5 tracking-wide">
                        {news.ressort}
                        {news.format && ` · ${news.format}`}
                      </div>

                      {/* Headline */}
                      <h3 className="text-[18px] m-0 mb-3 font-medium leading-snug">
                        {news.headline}
                      </h3>

                      {/* Was heißt das für dich? */}
                      <div
                        className="text-[11px] font-mono uppercase tracking-widest mb-1.5"
                        style={{ color: meta.color }}
                      >
                        Was heißt das für dich?
                      </div>
                      <p className="text-[15px] leading-relaxed m-0 text-[#1a1a1a]">
                        {b.translation}
                      </p>

                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="inline-block mt-2.5 text-[13px] font-semibold text-[#1c63b8] no-underline"
                      >
                        Mehr dazu →
                      </a>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Prototyp-Hinweis */}
        <div className="mt-16 p-4 bg-[#fff9e0] border-l-4 border-[#ffd400] text-[13px] text-[#444] leading-relaxed">
          <strong>Prototyp-Hinweis:</strong> Headlines und Übersetzungen sind
          hier statisch. In der echten Version würde eine KI tagesaktuelle News
          aus web.de-Ressorts ziehen, nach Berufsprofil filtern und die
          Übersetzung „Was heißt das für dich" live generieren.
        </div>
      </div>
    </div>
  );
}
