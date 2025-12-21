'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { AlertCircle, Clock, TrendingDown, CheckCircle, Zap, Shield, Timer, AlertTriangle } from 'lucide-react';
import type { View } from '@/types/view';

// 1. Definiujemy, jak wyglądają dane przychodzące z serwera
export interface DashboardStats {
  activeCount: number;
  atRiskCount: number;
  breachedCount: number;
  successRate: number;
  typeStats: {
    VIP: { active: number; breached: number };
    EXPRESS: { active: number; breached: number };
    STANDARD: { active: number; breached: number };
    WARRANTY: { active: number; breached: number };
  };
}

// 2. Mówimy komponentowi: "Spodziewaj się właściwości 'stats'"
interface SLADashboardProps {
  stats: DashboardStats; 
}

export function SLADashboard({ stats }: SLADashboardProps) {
  const router = useRouter();

  const handleNavigate = (view: View, id?: string) => {
    router.push(viewToPath(view, id));
  };

  // 3. Używamy danych z 'stats' zamiast wymyślonych liczb
  const slaTypesConfig = [
    { 
      name: 'VIP', 
      time: '12 hours', 
      color: 'from-[#A78BFA] to-[#8B5CF6]', 
      icon: <Zap className="w-6 h-6 text-white" />,
      active: stats.typeStats.VIP.active, 
      breached: stats.typeStats.VIP.breached 
    },
    { 
      name: 'Express', 
      time: '24 hours', 
      color: 'from-[#00D9FF] to-[#0099CC]', 
      icon: <Timer className="w-6 h-6 text-white" />,
      active: stats.typeStats.EXPRESS.active, 
      breached: stats.typeStats.EXPRESS.breached 
    },
    { 
      name: 'Standard', 
      time: '3-5 days', 
      color: 'from-[#00FF88] to-[#00CC6A]', 
      icon: <Shield className="w-6 h-6 text-white" />,
      active: stats.typeStats.STANDARD.active, 
      breached: stats.typeStats.STANDARD.breached 
    },
    { 
      name: 'Warranty', 
      time: '5-7 days', 
      color: 'from-[#FFB800] to-[#CC9400]', 
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      active: stats.typeStats.WARRANTY.active, 
      breached: stats.typeStats.WARRANTY.breached 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl mb-1">SLA & Repair Time Tracking</h1>
        <p className="text-[#94A3B8]">Monitor service level agreements and deadlines</p>
      </div>

      {/* Stats Grid - GÓRNE KARTY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[#00D9FF]" />
            <span className="text-[#00D9FF] text-sm">Active</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.activeCount}</p>
          <p className="text-[#94A3B8] text-sm">Total Active Tickets</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-[#FF6B35]" />
            <span className="text-[#FF6B35] text-sm">At Risk</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.atRiskCount}</p>
          <p className="text-[#94A3B8] text-sm">Approaching Deadline</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-[#FFB800]" />
            <span className="text-[#FFB800] text-sm">Breached</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.breachedCount}</p>
          <p className="text-[#94A3B8] text-sm">SLA Breached Today</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[#00FF88]" />
            <span className="text-[#00FF88] text-sm">On Time</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.successRate}%</p>
          <p className="text-[#94A3B8] text-sm">Success Rate (30d)</p>
        </div>
      </div>

      {/* SLA Types - DOLNE KARTY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {slaTypesConfig.map((sla) => (
          <div key={sla.name} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sla.color} flex items-center justify-center mb-4`}>
              {sla.icon}
            </div>
            <h3 className="text-white mb-1">{sla.name}</h3>
            <p className="text-[#64748B] text-sm mb-4">{sla.time}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
              <div>
                <p className="text-[#94A3B8] text-xs mb-1">Active</p>
                <p className="text-white">{sla.active}</p>
              </div>
              <div>
                <p className="text-[#FF6B35] text-xs mb-1">Breached</p>
                <p className={`font-bold ${sla.breached > 0 ? 'text-[#FF6B35]' : 'text-white'}`}>
                  {sla.breached}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Miejsce na przyszłe wykresy */}
      <div className="grid grid-cols-1 gap-6">
         <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg text-center text-gray-500">
            Wykresy i lista szczegółowa pojawią się w kolejnym etapie.
         </div>
      </div>
    </div>
  );
}