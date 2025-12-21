'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { AlertCircle, Clock, TrendingDown, CheckCircle, Zap, Shield, Timer, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import type { View } from '@/types/view';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  urgentTickets: {
    id: string;
    number: string;
    customerName: string;
    deviceModel: string;
    slaType: string;
    deadline: Date;
    status: 'BREACHED' | 'RISK';
  }[];
  chartData: { name: string; Nowe: number }[];
}

interface SLADashboardProps {
  stats: DashboardStats;
}

export function SLADashboard({ stats }: SLADashboardProps) {
  const router = useRouter();
  
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleNavigate = (view: View, id?: string) => {
    router.push(viewToPath(view, id));
  };

  const slaTypesConfig = [
    {
      name: 'VIP',
      time: '12 godzin',
      color: 'from-[#A78BFA] to-[#8B5CF6]',
      icon: <Zap className="w-6 h-6 text-white" />,
      active: stats.typeStats.VIP.active,
      breached: stats.typeStats.VIP.breached
    },
    {
      name: 'Express',
      time: '24 godziny',
      color: 'from-[#00D9FF] to-[#0099CC]',
      icon: <Timer className="w-6 h-6 text-white" />,
      active: stats.typeStats.EXPRESS.active,
      breached: stats.typeStats.EXPRESS.breached
    },
    {
      name: 'Standard',
      time: '3-5 dni',
      color: 'from-[#00FF88] to-[#00CC6A]',
      icon: <Shield className="w-6 h-6 text-white" />,
      active: stats.typeStats.STANDARD.active,
      breached: stats.typeStats.STANDARD.breached
    },
    {
      name: 'Gwarancja',
      time: '5-7 dni',
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
        <h1 className="text-white text-2xl mb-1">Panel SLA i Realizacji</h1>
        <p className="text-[#94A3B8]">Monitorowanie terminowości napraw i umów serwisowych</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[#00D9FF]" />
            <span className="text-[#00D9FF] text-sm">W Toku</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.activeCount}</p>
          <p className="text-[#94A3B8] text-sm">Aktywne Zgłoszenia</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-[#FF6B35]" />
            <span className="text-[#FF6B35] text-sm">Zagrożone</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.atRiskCount}</p>
          <p className="text-[#94A3B8] text-sm">Zbliżający się termin</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-[#FFB800]" />
            <span className="text-[#FFB800] text-sm">Opóźnione</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.breachedCount}</p>
          <p className="text-[#94A3B8] text-sm">Przekroczony czas SLA</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[#00FF88]" />
            <span className="text-[#00FF88] text-sm">Terminowość</span>
          </div>
          <p className="text-white text-3xl mb-1">{stats.successRate}%</p>
          <p className="text-[#94A3B8] text-sm">Skuteczność (30 dni)</p>
        </div>
      </div>

      {/* Środkowa sekcja: Kafelki Typów + Wykres */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEWA STRONA: Kafelki Typów */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {slaTypesConfig.map((sla) => (
            <div key={sla.name} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sla.color} flex items-center justify-center mb-4`}>
                {sla.icon}
              </div>
              <h3 className="text-white mb-1">{sla.name}</h3>
              <p className="text-[#64748B] text-sm mb-4">Czas: {sla.time}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
                <div>
                  <p className="text-[#94A3B8] text-xs mb-1">Aktywne</p>
                  <p className="text-white">{sla.active}</p>
                </div>
                <div>
                  <p className="text-[#FF6B35] text-xs mb-1">Opóźnione</p>
                  <p className={`font-bold ${sla.breached > 0 ? 'text-[#FF6B35]' : 'text-white'}`}>
                    {sla.breached}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PRAWA STRONA: Wykres */}
        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg flex flex-col">
          <h3 className="text-white mb-6 font-semibold">Nowe Zgłoszenia (7 Dni)</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2642" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748B" 
                  tick={{fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1A2642', color: '#fff' }}
                  itemStyle={{ color: '#00D9FF' }}
                  cursor={{fill: '#1A2642', opacity: 0.4}}
                />
                <Bar dataKey="Nowe" fill="#00D9FF" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista Wymaganych Działań*/}
      <div className="bg-[#0C1222] rounded-xl border border-[#1A2642] shadow-lg">
        {/* Nagłówek z Tooltipem */}
        <div className="p-6 border-b border-[#1A2642] flex justify-between items-center rounded-t-xl relative z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-[#FF6B35]" />
            <h3 className="text-white text-lg font-semibold">
              Wymagane Działania
            </h3>
            
            <div 
              className="relative flex items-center ml-2 cursor-help"
              onMouseEnter={() => setIsTooltipOpen(true)}
              onMouseLeave={() => setIsTooltipOpen(false)}
            >
              <Info className={`w-5 h-5 transition-colors ${isTooltipOpen ? 'text-[#00D9FF]' : 'text-[#64748B]'}`} />
              
              {isTooltipOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-14 w-72 p-4 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl text-xs text-white z-[9999]">
                  <p className="font-semibold text-[#00D9FF] mb-2 uppercase tracking-wide border-b border-[#334155] pb-2">
                    Progi zagrożenia (At Risk)
                  </p>
                  <ul className="space-y-2 text-[#94A3B8]">
                    <li className="flex justify-between items-center">
                      <span>VIP / Express:</span>
                      <span className="text-white font-mono bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">4h przed</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Standard:</span>
                      <span className="text-white font-mono bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">6h przed</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Gwarancja:</span>
                      <span className="text-white font-mono bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">12h przed</span>
                    </li>
                  </ul>
                  
                  {/* Strzałeczka dymka */}
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1E293B] border-l border-b border-[#334155] rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          <span className="text-xs text-[#94A3B8] uppercase tracking-wider">
            {stats.urgentTickets.length} Zgłoszeń
          </span>
        </div>

        <div className="divide-y divide-[#1A2642] rounded-b-xl">
          {stats.urgentTickets.length === 0 ? (
            <div className="p-8 text-center text-[#94A3B8]">
              <CheckCircle className="w-12 h-12 text-[#00FF88] mx-auto mb-3 opacity-50" />
              <p>Świetnie! Wszystkie zgłoszenia są realizowane terminowo.</p>
            </div>
          ) : (
            stats.urgentTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => handleNavigate('ticket-detail', ticket.id)}
                className="p-4 hover:bg-[#121B2D] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${ticket.status === 'BREACHED' ? 'bg-[#FF6B35]' : 'bg-[#FFB800]'}`}></div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-mono">{ticket.number || ticket.id.slice(0,8)}</span>
                      <span className="text-xs px-2 py-0.5 rounded border border-[#1A2642] text-[#94A3B8] bg-[#0F172A]">
                        {ticket.slaType}
                      </span>
                    </div>
                    <div className="text-sm text-[#94A3B8]">
                      {ticket.customerName} • <span className="text-[#64748B]">{ticket.deviceModel}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-6">
                  <div>
                    <div className={`font-bold ${ticket.status === 'BREACHED' ? 'text-[#FF6B35]' : 'text-[#FFB800]'}`}>
                      {formatDistanceToNow(new Date(ticket.deadline), { addSuffix: true, locale: pl })}
                    </div>
                    <div className="text-xs text-[#64748B]">Termin realizacji</div>
                  </div>
                  
                  <div className="p-2 rounded-full group-hover:bg-[#1A2642] text-[#94A3B8] group-hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}