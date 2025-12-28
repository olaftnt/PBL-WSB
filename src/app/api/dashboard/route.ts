import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLA_CONFIG: Record<string, { hours: number; risk: number }> = {
  VIP: { hours: 12, risk: 4 },
  EXPRESS: { hours: 24, risk: 4 },
  STANDARD: { hours: 120, risk: 6 },
  WARRANTY: { hours: 168, risk: 12 },
};

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { status: { notIn: ["DONE", "CANCELED"] } },
      include: { customer: true },
    });

    const now = new Date();

    const processed = tickets
      .map((t) => {
        const conf = SLA_CONFIG[t.slaType] || SLA_CONFIG["STANDARD"];
        const deadline = new Date(t.createdAt.getTime() + conf.hours * 3600000);
        const diffMs = deadline.getTime() - now.getTime();
        const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));

        let status = "OK";
        if (hoursLeft < 0) status = "BREACHED";
        else if (hoursLeft <= conf.risk) status = "RISK";

        return {
          id: t.id,
          number: t.number,
          customerName: t.customer?.name || "Klient",
          slaType: t.slaType,
          deadline: deadline.toISOString(),
          status,
        };
      })
      .filter(Boolean);

    // Sortowanie:
    processed.sort(
      (a, b) =>
        new Date(a!.deadline).getTime() - new Date(b!.deadline).getTime()
    );

    return NextResponse.json(processed.slice(0, 10));
  } catch (error) {
    return NextResponse.json({ error: "SLA Error" }, { status: 500 });
  }
}
