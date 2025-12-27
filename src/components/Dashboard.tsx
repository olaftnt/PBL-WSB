'use client';

import { 
  Ticket, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Smartphone,
  Package,
  ArrowRight
} from 'lucide-react';
import type { View } from '@/types/view';
import SLAWidget from '@/components/SLA/SLAWidget';

export interface DashboardStats {
  total: number;
  active: number;
  risk: number;    
  doneToday: number;
}

interface DashboardProps {
  onNavigate: (view: View, id?: string) => void;
  statsData: DashboardStats;
}

export function Dashboard({ onNavigate, statsData }: DashboardProps) { 
  
  const stats = [
    { 
      label: 'Wszystkie zlecenia', 
      value: statsData.total.toString(), 
      change: '', 
      icon: Ticket, 
      color: 'from-[#00FF88] to-[#00CC6A]' 
    },
    { 
      label: 'W trakcie', 
      value: statsData.active.toString(), 
      change: '', 
      icon: Clock, 
      color: 'from-[#00D9FF] to-[#0099CC]' 
    },
    { 
      label: 'Zagrożone SLA',
      value: statsData.risk.toString(), 
      change: '', 
      icon: AlertCircle, 
      color: 'from-[#FF6B35] to-[#CC5529]'
    },
    { 
      label: 'Zakończone dzisiaj', 
      value: statsData.doneToday.toString(), 
      change: '', 
      icon: CheckCircle, 
      color: 'from-[#A78BFA] to-[#8B5CF6]' 
    },
  ];

  const recentTickets = [
    { id: 'TK-2024-1247', customer: 'Jan Kowalski', device: 'MacBook Pro 16"', status: 'diagnostyka', priority: 'high', sla: 'express' },
    { id: 'TK-2024-1246', customer: 'Marian Kowalski', device: 'iPhone 14 Pro', status: 'naprawa', priority: 'medium', sla: 'standard' },
    { id: 'TK-2024-1245', customer: 'Johny Bravo', device: 'Dell XPS 15', status: 'testowanie', priority: 'low', sla: 'standard' },
    { id: 'TK-2024-1244', customer: 'Seba Kowalski', device: 'Samsung Galaxy S23', status: 'gotowy', priority: 'high', sla: 'vip' },
    { id: 'TK-2024-1243', customer: 'Robert Kowalski', device: 'HP Pavilion', status: 'nowe', priority: 'medium', sla: 'gwarancja' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nowe': return 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/20';
      case 'diagnostyka': return 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20';
      case 'naprawa': return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20';
      case 'testowanie': return 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20';
      case 'gotowy': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20';
      default: return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-[#FF6B35]';
      case 'medium': return 'bg-[#FFB800]';
      case 'low': return 'bg-[#00D9FF]';
      default: return 'bg-[#64748B]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#94A3B8] text-sm mb-2">{stat.label}</p>
                  <h3 className="text-white text-3xl mb-1">{stat.value}</h3>
                  <div className="flex items-center gap-1">
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('new-ticket')}
          className="bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-xl p-6 text-left hover:scale-105 transition-transform shadow-lg"
        >
          <Ticket className="w-8 h-8 text-[#0C1222] mb-3" />
          <h3 className="text-[#0C1222] mb-1">Nowe zlecenie</h3>
          <p className="text-[#0C1222]/70 text-sm">Tworzenie nowego zgłoszenia serwisowego</p>
        </button>
        
        <button 
          onClick={() => onNavigate('customers')}
          className="bg-[#0C1222] border border-[#1A2642] rounded-xl p-6 text-left hover:border-[#00D9FF] transition-colors shadow-lg"
        >
          <Users className="w-8 h-8 text-[#00D9FF] mb-3" />
          <h3 className="text-white mb-1">Klienci</h3>
          <p className="text-[#94A3B8] text-sm">Zarządzanie bazą klientów</p>
        </button>
        
        <button 
          onClick={() => onNavigate('inventory')}
          className="bg-[#0C1222] border border-[#1A2642] rounded-xl p-6 text-left hover:border-[#A78BFA] transition-colors shadow-lg"
        >
          <Package className="w-8 h-8 text-[#A78BFA] mb-3" />
          <h3 className="text-white mb-1">Magazyn</h3>
          <p className="text-[#94A3B8] text-sm">Sprawdzanie części i zapasów</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white">Najnowsze zlecenia</h3>
            <button 
              onClick={() => onNavigate('tickets')}
              className="text-[#00FF88] hover:text-[#00CC6A] transition-colors flex items-center gap-1 text-sm"
            >
              Zobacz wszystkie
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => onNavigate('ticket-detail', '1')}
                className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88]/30 transition-all text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white">{ticket.id}</span>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-[#64748B]/10 text-[#94A3B8] border border-[#64748B]/20">
                        {ticket.sla}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] text-sm mb-1">{ticket.customer}</p>
                    <p className="text-[#64748B] text-sm flex items-center gap-2">
                      <Smartphone className="w-3 h-3" />
                      {ticket.device}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#64748B]" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-full">
          <SLAWidget onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}