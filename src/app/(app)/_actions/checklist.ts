"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleChecklistItem(itemId: string, isChecked: boolean, ticketId: string) {
  try {
    await prisma.ticketChecklistItem.update({
      where: { id: itemId },
      data: { isChecked },
    });

    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Błąd aktualizacji checklisty:", error);
    return { success: false, error: "Nie udało się zaktualizować statusu" };
  }
}
