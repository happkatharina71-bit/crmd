"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Onboarding from "@/components/Onboarding";
import Briefing from "@/components/Briefing";
import { MODULES, DEFAULT_ORDER } from "@/lib/data";

export default function HomePage() {
  const [phase, setPhase] = useState<"onboarding" | "briefing">("onboarding");

  const [active, setActive] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MODULES.forEach((m) => {
      initial[m.id] = m.defaultOn;
    });
    return initial;
  });

  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);

  function toggle(id: string) {
    setActive((a) => ({ ...a, [id]: !a[id] }));
  }

  const activeIds = order.filter((id) => active[id]);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <Header />

      {phase === "onboarding" && (
        <Onboarding
          active={active}
          toggle={toggle}
          order={order}
          setOrder={setOrder}
          onDone={() => {
            setPhase("briefing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {phase === "briefing" && (
        <Briefing
          activeIds={activeIds}
          onEdit={() => {
            setPhase("onboarding");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      <div className="mx-auto mb-8 px-4 py-3.5 bg-[#fff9e0] border-l-4 border-[#ffd400] text-[12px] text-[#444] leading-relaxed max-w-2xl">
        <strong>Prototyp-Hinweis:</strong> Inhalte sind Mock-Daten. Im echten
        Produkt würde eine KI tagesaktuelle web.de-News pro Modul auswählen,
        zusammenfassen und (bei Job) auf den Beruf übersetzen. Reihenfolge und
        Auswahl der Module sind per Drag & Drop sortierbar.
      </div>
    </div>
  );
}
