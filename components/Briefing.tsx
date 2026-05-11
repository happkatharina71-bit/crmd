"use client";

import Link from "next/link";
import { MODULES, MODULE_CONTENT, LEVEL_META } from "@/lib/data";

const LEVEL_COLORS: Record<number, string> = {
  1: "#c8200a",
  2: "#d68a00",
  3: "#3a6a4a",
};
const LEVEL_LABELS: Record<number, string> = {
  1: "Musst du wissen",
  2: "Solltest du kennen",
  3: "Könnte dich inspirieren",
};

type Props = {
  activeIds: string[];
  onEdit: () => void;
};

export default function Briefing({ activeIds, onEdit }: Props) {
  if (activeIds.length === 0) {
    return (
      <div className="py-10 px-5 text-center text-[#666]">
        Keine Module aktiviert.
        <br />
        <button
          onClick={onEdit}
          className="mt-3 text-[#1c63b8] bg-none border-none underline cursor-pointer text-[14px] font-[inherit]"
        >
          Module auswählen
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4 text-[13px] text-[#666]">
        <span>{activeIds.length} aktive Module</span>
        <button
          onClick={onEdit}
          className="text-[#1c63b8] bg-none border-none cursor-pointer text-[13px] font-[inherit] underline"
        >
          Anpassen
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {activeIds.map((id) => (
          <ModuleCard key={id} moduleId={id} />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ moduleId }: { moduleId: string }) {
  const meta = MODULES.find((m) => m.id === moduleId)!;
  const data = MODULE_CONTENT[moduleId];

  return (
    <section className="bg-white border border-[#e0e0e0] px-[18px] pt-[18px] pb-5">
      <ModuleHeader moduleId={moduleId} meta={meta} data={data} />
      <ModuleBody moduleId={moduleId} meta={meta} data={data} />
    </section>
  );
}

function ModuleHeader({
  moduleId,
  meta,
  data,
}: {
  moduleId: string;
  meta: ReturnType<typeof MODULES.find>;
  data: any;
}) {
  if (!meta) return null;
  let context = "";
  if (moduleId === "lokales" && data?.region) context = data.region;
  if (moduleId === "job" && data?.profile) context = data.profile;
  if (moduleId === "thema" && data?.themen) context = data.themen.join(", ");

  return (
    <div className="flex items-baseline justify-between mb-3.5 pb-2.5 border-b-2 border-[#ffd400]">
      <div>
        <h2 className="text-[18px] font-bold m-0 tracking-tight">{meta.label}</h2>
        {context && (
          <div className="text-[12px] text-[#666] mt-0.5">{context}</div>
        )}
      </div>
    </div>
  );
}

function ModuleBody({
  moduleId,
  meta,
  data,
}: {
  moduleId: string;
  meta: ReturnType<typeof MODULES.find>;
  data: any;
}) {
  if (!meta) return null;
  if (meta.placeholder) return <PlaceholderAstro />;
  if (moduleId === "job") return <JobBody data={data} />;
  if (moduleId === "thema") return <ThemenBody data={data} />;
  return <CompactList data={data} />;
}

function JobBody({ data }: { data: any }) {
  return (
    <div>
      <p className="text-[13px] text-[#666] mb-3.5 italic m-0">{data.summary}</p>
      <div className="flex flex-col gap-3">
        {data.items.map((item: any, i: number) => (
          <article
            key={i}
            style={{ borderLeft: `3px solid ${LEVEL_COLORS[item.level]}` }}
            className="pl-3"
          >
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-1"
              style={{ color: LEVEL_COLORS[item.level] }}
            >
              {LEVEL_LABELS[item.level]} · {item.ressort}
            </div>
            <h3 className="text-[15px] font-semibold m-0 mb-1 leading-snug">
              {item.headline}
            </h3>
            <p className="text-[14px] m-0 leading-relaxed">{item.translation}</p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[12px] text-[#1c63b8] no-underline mt-1 inline-block font-semibold"
            >
              Mehr dazu →
            </a>
          </article>
        ))}
      </div>
      <Link
        href="/job/baeckerin"
        className="mt-3.5 block text-[13px] text-[#1c63b8] font-semibold no-underline"
      >
        → Vollständiges Job-Briefing öffnen
      </Link>
    </div>
  );
}

function CompactList({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-3.5">
      {data.items.map((item: any, i: number) => (
        <article key={i}>
          <div className="text-[10px] font-semibold text-[#666] tracking-widest uppercase mb-0.5">
            {item.ressort}
          </div>
          <h3 className="text-[15px] font-semibold m-0 mb-1 leading-snug">
            <a
              href="#"
              className="text-[#1a1a1a] no-underline"
              onClick={(e) => e.preventDefault()}
            >
              {item.headline}
            </a>
          </h3>
          <p className="text-[14px] m-0 leading-relaxed text-[#333]">{item.summary}</p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[12px] text-[#1c63b8] no-underline mt-1 inline-block"
          >
            Mehr dazu →
          </a>
        </article>
      ))}
    </div>
  );
}

function ThemenBody({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-3.5">
      {data.items.map((item: any, i: number) => (
        <article key={i}>
          <div className="text-[10px] font-semibold text-[#666] tracking-widest uppercase mb-0.5">
            {item.ressort} ·{" "}
            <span className="text-[#1c63b8]">#{item.thema}</span>
          </div>
          <h3 className="text-[15px] font-semibold m-0 mb-1 leading-snug">
            <a
              href="#"
              className="text-[#1a1a1a] no-underline"
              onClick={(e) => e.preventDefault()}
            >
              {item.headline}
            </a>
          </h3>
          <p className="text-[14px] m-0 leading-relaxed text-[#333]">{item.summary}</p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[12px] text-[#1c63b8] no-underline mt-1 inline-block"
          >
            Mehr dazu →
          </a>
        </article>
      ))}
    </div>
  );
}

function PlaceholderAstro() {
  return (
    <div className="p-4 bg-[#f7f7f7] text-[13px] text-[#666] leading-relaxed">
      <strong className="text-[#1a1a1a]">Astro-Modul folgt.</strong> In der
      echten Version würde hier ein KI-gestütztes Tageshoroskop auf Basis von
      Geburtsdaten und individuellem Natalchart angezeigt — kein
      Standard-Sternzeichen-Text.
    </div>
  );
}
