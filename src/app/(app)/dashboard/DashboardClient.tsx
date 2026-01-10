"use client";

import { useRouter } from "next/navigation";
import { viewToPath } from "@/lib/viewRouter";
import { Dashboard, type DashboardStats } from "@/components/Dashboard";
import type { TicketPriority, TicketStatus, SLATYPE } from "@prisma/client";

type RecentTicketRow = {
  id: string;
  number: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaType: SLATYPE;
  createdAt: string | Date;

  customer: { name: string };
  device: { name: string } | null;
};

export default function DashboardClient({
  stats,
  recentTickets,
}: {
  stats: DashboardStats;
  recentTickets: RecentTicketRow[];
}) {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  return <Dashboard onNavigate={onNavigate} statsData={stats} recentTickets={recentTickets} />;
}
