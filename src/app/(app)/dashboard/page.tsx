import { prisma } from "@/lib/prisma";
import { SLATYPE } from "@prisma/client";
import { addHours, isPast, isBefore, add } from "date-fns";
import DashboardClient from "./DashboardClient";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Konfiguracja SLA
const SLA_LIMITS = {
  [SLATYPE.VIP]: { hours: 12 },
  [SLATYPE.EXPRESS]: { hours: 24 },
  [SLATYPE.STANDARD]: { days: 5 },
  [SLATYPE.WARRANTY]: { days: 7 },
};

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const allTickets = await prisma.ticket.findMany({
    select: {
      id: true,
      status: true,
      slaType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const recentTickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      number: true,
      status: true,
      priority: true,
      slaType: true,
      createdAt: true,
      customer: { select: { name: true } },
      device: { select: { name: true } },
    },
  });

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let activeCount = 0;
  let riskCount = 0;
  let doneTodayCount = 0;

  allTickets.forEach((ticket) => {
    if (ticket.status === "DONE") {
      if (ticket.updatedAt >= startOfToday) {
        doneTodayCount++;
      }
    }

    if (ticket.status !== "DONE" && ticket.status !== "CANCELED") {
      activeCount++;

      const duration = SLA_LIMITS[ticket.slaType] || { days: 5 };
      const deadline = add(ticket.createdAt, duration);
      const isBreached = isPast(deadline);

      let warningThresholdHours = 4;
      if (ticket.slaType === "STANDARD") warningThresholdHours = 6;
      else if (ticket.slaType === "WARRANTY") warningThresholdHours = 12;

      const warningTime = addHours(now, warningThresholdHours);
      const isAtRisk = !isBreached && isBefore(deadline, warningTime);

      if (isAtRisk) {
        riskCount++;
      }
    }
  });

  const dashboardStats = {
    total: allTickets.length,
    active: activeCount,
    risk: riskCount,
    doneToday: doneTodayCount,
  };

  return (
      <DashboardClient
          stats={dashboardStats}
          recentTickets={recentTickets}
      />
  );
}