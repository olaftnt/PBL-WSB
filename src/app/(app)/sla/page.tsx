import { prisma } from "@/lib/prisma";
import { SLADashboard } from '@/components/SLA/SLADashboard';
import { SLATYPE } from "@prisma/client";
import { addHours, isPast, isBefore, add, subDays } from "date-fns";

const SLA_LIMITS = {
  [SLATYPE.VIP]: { hours: 12 },
  [SLATYPE.EXPRESS]: { hours: 24 },
  [SLATYPE.STANDARD]: { days: 5 },
  [SLATYPE.WARRANTY]: { days: 7 },
};

export default async function SlaPage() {
  const allTickets = await prisma.ticket.findMany({
    where: { status: { not: "CANCELED" } },
    select: {
      id: true,
      status: true,
      createdAt: true,
      slaType: true,
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

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  
  let totalClosed30d = 0;
  let successClosed30d = 0;

  allTickets.forEach((ticket) => {
    const duration = SLA_LIMITS[ticket.slaType] || { days: 5 };
    const deadline = add(ticket.createdAt, duration);
    
    const isBreached = isPast(deadline);
    
    const isDone = ticket.status === "DONE"; 

    if (!isDone) {
      activeCount++;
      
      const warningTime = addHours(now, 4); 
      if (!isBreached && isBefore(deadline, warningTime)) {
        atRiskCount++;
      }

      if (isBreached) {
        breachedCount++;
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

  const stats = {
    activeCount,
    atRiskCount,
    breachedCount,
    successRate,
    typeStats
  };

  return <SLADashboard stats={stats} />;
}