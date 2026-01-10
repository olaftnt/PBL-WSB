import { prisma } from "@/lib/prisma";
import QuotesClient from "./QuotesClient";
import type { QuoteListItem } from "@/types/quote";

export default async function Page() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      ticket: true,
      device: true,
    },
  });

  const mapped: QuoteListItem[] = quotes.map((q) => ({
    id: q.id,
    number: q.number,
    status: q.status,
    customerName: q.customer?.name ?? "—",
    ticketNumber: q.ticket.number,
    deviceName: q.device?.name ?? q.device?.model ?? null,
    totalGross: Number(q.totalGross ?? 0),
    notes: q.notes ?? "",
    createdAt: q.createdAt.toISOString(),
  }));

  const stats = {
    total: mapped.length,
    sent: mapped.filter((q) => q.status === "SENT").length,
    accepted: mapped.filter((q) => q.status === "ACCEPTED").length,
    rejected: mapped.filter((q) => q.status === "REJECTED").length,
  };

  return <QuotesClient quotes={mapped} stats={stats} />;
}
