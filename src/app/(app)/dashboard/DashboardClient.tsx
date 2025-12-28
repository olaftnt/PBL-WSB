"use client";

import { useRouter } from "next/navigation";
import { viewToPath } from "@/lib/viewRouter";
import { Dashboard, DashboardStats } from "@/components/Dashboard";

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  return <Dashboard onNavigate={onNavigate} statsData={stats} />;
}
