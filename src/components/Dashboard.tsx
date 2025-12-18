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

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: 'Wszystkie zlecenia', value: '247', change: '+12%', icon: Ticket, color: 'from-[#00FF88] to-[#00CC6A]' },
    { label: 'W trakcie', value: '42', change: '+5%', icon: Clock, color: 'from-[#00D9FF] to-[#0099CC]' },
    { label: 'Uwagi SLA', value: '8', change: '-3%', icon: AlertCircle, color: 'from-[#FF6B35] to-[#CC5529]' },
    { label: 'Zakończone dzisiaj', value: '15', change: '+8%', icon: CheckCircle, color: 'from-[#A78BFA] to-[#8B5CF6]' },
  ];

  const recentTickets = [
    { id: 'TK-2024-1247', customer: 'Jan Kowalski', device: 'MacBook Pro 16"', status: 'diagnostyka', priority: 'high', sla: 'express' },
    { id: 'TK-2024-1246', customer: 'Marian Kowalski', device: 'iPhone 14 Pro', status: 'naprawa', priority: 'medium', sla: 'standard' },
    { id: 'TK-2024-1245', customer: 'Johny Bravo', device: 'Dell XPS 15', status: 'testowanie', priority: 'low', sla: 'standard' },
    { id: 'TK-2024-1244', customer: 'Seba Kowalski', device: 'Samsung Galaxy S23', status: 'gotowy', priority: 'high', sla: 'vip' },
    { id: 'TK-2024-1243', customer: 'Robert Kowalski', device: 'HP Pavilion', status: 'nowe', priority: 'medium', sla: 'gwarancja' },
  ];

  const upcomingDeadlines = [
    { id: 'TK-2024-1240', customer: 'Jan Kowalski', deadline: '2 godziny', status: 'critical' },
    { id: 'TK-2024-1238', customer: 'Johny Bravo', deadline: '4 godziny', status: 'warning' },
    { id: 'TK-2024-1235', customer: 'Seba Kowalski', deadline: '8 godzin', status: 'ok' },
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

  const getDeadlineColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-[#FF6B35]';
      case 'warning': return 'text-[#FFB800]';
      case 'ok': return 'text-[#00FF88]';
      default: return 'text-[#64748B]';
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
                    <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                    <span className="text-[#00FF88] text-sm">{stat.change}</span>
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

        {/* Upcoming Deadlines */}
        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white">Terminy SLA</h3>
            <Clock className="w-5 h-5 text-[#FFB800]" />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">{item.id}</span>
                  <AlertCircle className={`w-4 h-4 ${getDeadlineColor(item.status)}`} />
                </div>
                <p className="text-[#94A3B8] text-sm mb-2">{item.customer}</p>
                <p className={`text-sm ${getDeadlineColor(item.status)}`}>
                  {item.deadline} do końca
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate('sla')}
            className="w-full mt-4 px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors text-sm"
          >
            Sprawdź wszystkie SLA
          </button>
        </div>
      </div>
    </div>
  );
}
