import { prisma } from "@/lib/prisma";
import { SLADashboard } from '@/components/SLA/SLADashboard';
import { SLATYPE } from "@prisma/client";
import { addHours, isPast, isBefore, add, subDays, format, startOfDay, endOfDay } from "date-fns";

const SLA_LIMITS = {
  [SLATYPE.VIP]: { hours: 12 },
  [SLATYPE.EXPRESS]: { hours: 24 },
  [SLATYPE.STANDARD]: { days: 5 },
  [SLATYPE.WARRANTY]: { days: 7 },
};

export default async function SlaPage() {
  const allTickets = await prisma.ticket.findMany({
    include: {
      customer: true,
      device: true,
    },
  });

  let activeCount = 0;
  let atRiskCount = 0;
  let breachedCount = 0;

  const typeStats = {
    VIP: { active: 0, breached: 0 },
    EXPRESS: { active: 0, breached: 0 },
    STANDARD: { active: 0, breached: 0 },
    WARRANTY: { active: 0, breached: 0 },
  };

  const urgentTickets: any[] = [];
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  let totalClosed30d = 0;
  let successClosed30d = 0;

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const dateKey = format(date, 'dd.MM'); 
    
    const createdToday = allTickets.filter(t => 
      t.createdAt >= startOfDay(date) && t.createdAt <= endOfDay(date)
    ).length;

    chartData.push({
      name: dateKey,
      Nowe: createdToday,
    });
  }

  allTickets.forEach((ticket) => {
    if (ticket.status === "CANCELED") return;

    const duration = SLA_LIMITS[ticket.slaType] || { days: 5 };
    const deadline = add(ticket.createdAt, duration);
    const isBreached = isPast(deadline);
    const isDone = ticket.status === "DONE";

    if (!isDone) {
      activeCount++;
      
      // Ustalanie progu ostrzegania w zależności od typu SLA
      let warningThresholdHours = 4; // Domyślnie VIP i EXPRESS

      if (ticket.slaType === 'STANDARD') {
        warningThresholdHours = 6;
      } else if (ticket.slaType === 'WARRANTY') {
        warningThresholdHours = 12;
      }
      
      const warningTime = addHours(now, warningThresholdHours);
      const isAtRisk = !isBreached && isBefore(deadline, warningTime);

      if (isAtRisk) atRiskCount++;
      if (isBreached) breachedCount++;

      if (isBreached || isAtRisk) {
        urgentTickets.push({
          id: ticket.id,
          number: ticket.number,
          customerName: ticket.customer.name,
          deviceModel: ticket.device?.model || 'Nieznany model',
          slaType: ticket.slaType,
          deadline: deadline,
          status: isBreached ? 'BREACHED' : 'RISK'
        });
      }

      if (typeStats[ticket.slaType]) {
        typeStats[ticket.slaType].active++;
        if (isBreached) typeStats[ticket.slaType].breached++;
      }
    } else {
      if (ticket.createdAt >= thirtyDaysAgo) {
        totalClosed30d++;
        if (!isBreached) {
          successClosed30d++;
        }
      }
    }
  });

  const successRate = totalClosed30d > 0 
    ? Math.round((successClosed30d / totalClosed30d) * 100) 
    : 100;

  urgentTickets.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const stats = {
    activeCount,
    atRiskCount,
    breachedCount,
    successRate,
    typeStats,
    urgentTickets,
    chartData 
  };

  return <SLADashboard stats={stats} />;
}