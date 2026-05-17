"use client";

import { useTransition } from "react";
// Zwróć uwagę na poprawioną ścieżkę do akcji
import { toggleChecklistItem } from "@/app/(app)/_actions/checklist";
import { CheckSquare, Square } from "lucide-react";

type ChecklistItem = {
  id: string;
  task: string;
  isChecked: boolean;
};

interface TicketChecklistProps {
  ticketId: string;
  items: ChecklistItem[];
}

export function TicketChecklist({ ticketId, items }: TicketChecklistProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (itemId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleChecklistItem(itemId, !currentStatus, ticketId);
    });
  };

  const completedCount = items.filter((item) => item.isChecked).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="bg-[#0C1222] border border-[#1A2642] rounded-xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium text-lg">Checklista serwisowa</h3>
          <p className="text-[#94A3B8] text-xs">Upewnij się, że wykonałeś wszystkie kroki uniwersalne.</p>
        </div>
        <span className="text-sm font-semibold text-[#00FF88] bg-[#00FF88]/10 px-2.5 py-1 rounded">
          {progressPercent}%
        </span>
      </div>

      <div className="w-full bg-[#121B2D] h-2 rounded-full overflow-hidden border border-[#1A2642]">
        <div
          className="bg-gradient-to-r from-[#00FF88] to-[#00CC6A] h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-2 pt-2">
        {items.map((item) => (
          <button
            key={item.id}
            disabled={isPending}
            onClick={() => handleToggle(item.id, item.isChecked)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left text-sm ${
              item.isChecked
                ? "bg-[#00FF88]/5 border-[#00FF88]/20 text-[#94A3B8] line-through"
                : "bg-[#121B2D] border-[#1A2642] text-white hover:border-[#00FF88]/30"
            } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {item.isChecked ? (
              <CheckSquare className="w-5 h-5 text-[#00FF88] shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-[#64748B] shrink-0" />
            )}
            <span className="flex-1">{item.task}</span>
          </button>
        ))}

        {items.length === 0 && (
          <p className="text-[#64748B] text-sm text-center py-4">Brak elementów na liście.</p>
        )}
      </div>
    </div>
  );
}