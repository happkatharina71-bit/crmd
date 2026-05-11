"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MODULES, Module } from "@/lib/data";

type Props = {
  active: Record<string, boolean>;
  toggle: (id: string) => void;
  order: string[];
  setOrder: (order: string[]) => void;
  onDone: () => void;
};

export default function Onboarding({ active, toggle, order, setOrder, onDone }: Props) {
  const anyActive = Object.values(active).some(Boolean);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active: dragActive, over } = event;
    if (over && dragActive.id !== over.id) {
      const oldIndex = order.indexOf(String(dragActive.id));
      const newIndex = order.indexOf(String(over.id));
      setOrder(arrayMove(order, oldIndex, newIndex));
    }
  }

  const orderedModules = order.map((id) => MODULES.find((m) => m.id === id)!);

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <p className="text-[15px] text-[#1a1a1a] leading-relaxed mb-1">
        Wähle die Module für dein tägliches Briefing.
      </p>
      <p className="text-[13px] text-[#666] mb-5 leading-relaxed">
        Tippe an, um zu aktivieren. Ziehe am Griff{" "}
        <span className="font-mono text-[#1a1a1a]">≡</span>, um die Reihenfolge zu ändern.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {orderedModules.map((m) => (
              <SortableModuleRow
                key={m.id}
                module={m}
                on={active[m.id]}
                toggle={() => toggle(m.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={onDone}
        disabled={!anyActive}
        className={`mt-6 w-full py-3.5 text-white text-[16px] font-semibold border-none transition-colors ${
          anyActive
            ? "bg-[#1c63b8] cursor-pointer hover:bg-[#1554a0]"
            : "bg-[#ccc] cursor-not-allowed"
        }`}
      >
        Briefing anzeigen
      </button>
    </div>
  );
}

function SortableModuleRow({
  module: m,
  on,
  toggle,
}: {
  module: Module;
  on: boolean;
  toggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: m.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 pr-3.5 pl-2 py-3.5 border transition-colors ${
        on
          ? "bg-[#fffbea] border-2 border-[#ffd400]"
          : "bg-white border border-[#e0e0e0]"
      }`}
    >
      {/* Drag-Griff */}
      <div
        {...attributes}
        {...listeners}
        className="text-[#666] text-xl leading-none px-1 cursor-grab touch-none select-none"
        title="Ziehen zum Sortieren"
      >
        ≡
      </div>

      {/* Checkbox-Button */}
      <button
        onClick={toggle}
        className="flex items-center gap-3 flex-1 bg-transparent border-none cursor-pointer text-left font-[inherit] p-0"
      >
        <div
          className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center shrink-0 text-sm font-bold text-[#1a1a1a] ${
            on ? "bg-[#ffd400]" : "bg-white border-2 border-[#e0e0e0]"
          }`}
        >
          {on ? "✓" : ""}
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-semibold mb-0.5 flex items-center gap-2 flex-wrap">
            {m.label}
            {m.placeholder && (
              <span className="text-[10px] bg-[#eee] text-[#666] px-1.5 py-0.5 rounded-[3px] font-medium tracking-wide uppercase">
                Bald verfügbar
              </span>
            )}
          </div>
          <div className="text-[13px] text-[#666]">
            {m.description}
            {m.needsSetup && (
              <span className="text-[#1c63b8]"> · braucht: {m.setupHint}</span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
