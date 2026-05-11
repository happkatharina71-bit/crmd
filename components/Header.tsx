export default function Header() {
  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="border-b-[3px] border-[#ffd400] px-5 py-4 bg-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-[#ffd400] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#1a1a1a]">
          WEB.DE
        </div>
        <div className="text-[11px] tracking-widest uppercase text-[#666]">
          Morning Briefing
        </div>
      </div>
      <h1 className="text-[26px] font-bold tracking-tight text-[#1a1a1a] m-0 mb-1">
        Was heute für dich zählt
      </h1>
      <div className="text-[13px] text-[#666]">{today}</div>
    </div>
  );
}
