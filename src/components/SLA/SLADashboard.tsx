import { AlertCircle, Clock, TrendingDown, CheckCircle, Filter } from 'lucide-react';
import type { View } from '@/types/view';

interface SLADashboardProps {
  onNavigate: (view: View, id?: string) => void;
}

const slaTickets = [
  { id: 'TK-2024-1240', customer: 'Alice Cooper', device: 'Google Pixel 8', sla: 'vip', deadline: '2024-12-09 16:00', remaining: '30 minutes', status: 'critical' },
  { id: 'TK-2024-1247', customer: 'John Smith', device: 'MacBook Pro 16"', sla: 'express', deadline: '2024-12-09 21:30', remaining: '2 hours', status: 'critical' },
  { id: 'TK-2024-1238', customer: 'David Lee', device: 'iPad Air', sla: 'express', deadline: '2024-12-09 23:00', remaining: '4 hours', status: 'warning' },
  { id: 'TK-2024-1246', customer: 'Sarah Johnson', device: 'iPhone 14 Pro', sla: 'standard', deadline: '2024-12-10 08:15', remaining: '14 hours', status: 'warning' },
  { id: 'TK-2024-1235', customer: 'Linda Martinez', device: 'Dell Laptop', sla: 'standard', deadline: '2024-12-10 16:45', remaining: '22 hours', status: 'ok' },
  { id: 'TK-2024-1233', customer: 'Chris Brown', device: 'Samsung Phone', sla: 'warranty', deadline: '2024-12-12 10:00', remaining: '2 days', status: 'ok' },
];

const slaTypes = [
  { name: 'VIP', time: '12 hours', color: 'from-[#A78BFA] to-[#8B5CF6]', active: 8, breached: 1 },
  { name: 'Express', time: '24 hours', color: 'from-[#00D9FF] to-[#0099CC]', active: 15, breached: 3 },
  { name: 'Standard', time: '3-5 days', color: 'from-[#00FF88] to-[#00CC6A]', active: 42, breached: 2 },
  { name: 'Warranty', time: '5-7 days', color: 'from-[#FFB800] to-[#CC9400]', active: 12, breached: 1 },
];

export function SLADashboard({ onNavigate }: SLADashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/20', icon: 'text-[#FF6B35]' };
      case 'warning': return { bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', border: 'border-[#FFB800]/20', icon: 'text-[#FFB800]' };
      case 'ok': return { bg: 'bg-[#00FF88]/10', text: 'text-[#00FF88]', border: 'border-[#00FF88]/20', icon: 'text-[#00FF88]' };
      default: return { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', border: 'border-[#64748B]/20', icon: 'text-[#64748B]' };
    }
  };

  const totalBreached = slaTypes.reduce((acc, type) => acc + type.breached, 0);
  const totalActive = slaTypes.reduce((acc, type) => acc + type.active, 0);
  const atRisk = slaTickets.filter(t => t.status === 'critical' || t.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl mb-1">SLA & Repair Time Tracking</h1>
        <p className="text-[#94A3B8]">Monitor service level agreements and deadlines</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[#00D9FF]" />
            <span className="text-[#00D9FF] text-sm">Active</span>
          </div>
          <p className="text-white text-3xl mb-1">{totalActive}</p>
          <p className="text-[#94A3B8] text-sm">Total Active Tickets</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-[#FF6B35]" />
            <span className="text-[#FF6B35] text-sm">At Risk</span>
          </div>
          <p className="text-white text-3xl mb-1">{atRisk}</p>
          <p className="text-[#94A3B8] text-sm">Approaching Deadline</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-[#FFB800]" />
            <span className="text-[#FFB800] text-sm">Breached</span>
          </div>
          <p className="text-white text-3xl mb-1">{totalBreached}</p>
          <p className="text-[#94A3B8] text-sm">SLA Breached Today</p>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[#00FF88]" />
            <span className="text-[#00FF88] text-sm">On Time</span>
          </div>
          <p className="text-white text-3xl mb-1">92%</p>
          <p className="text-[#94A3B8] text-sm">Success Rate (30d)</p>
        </div>
      </div>

      {/* SLA Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {slaTypes.map((sla) => (
          <div key={sla.name} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sla.color} flex items-center justify-center mb-4`}>
              <Clock className="w-6 h-6 text-white" />
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
                <p className="text-white">{sla.breached}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* At Risk Tickets */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF6B35]" />
            Tickets At Risk
          </h3>
          <button className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="space-y-3">
          {slaTickets.map((ticket) => {
            const colors = getStatusColor(ticket.status);
            return (
              <button
                key={ticket.id}
                onClick={() => onNavigate('ticket-detail', ticket.id)}
                className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white">{ticket.id}</span>
                      <span className="px-2 py-1 rounded text-xs bg-[#64748B]/10 text-[#94A3B8] border border-[#64748B]/20 uppercase">
                        {ticket.sla}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] text-sm mb-1">{ticket.customer}</p>
                    <p className="text-[#64748B] text-sm">{ticket.device}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-2 mb-2`}>
                      <Clock className={`w-4 h-4 ${colors.icon}`} />
                      <span className={`text-sm ${colors.text}`}>{ticket.remaining}</span>
                    </div>
                    <p className="text-[#64748B] text-xs">Due: {ticket.deadline}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SLA Performance Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <h3 className="text-white mb-6">SLA Performance (Last 30 Days)</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#1A2642] rounded-lg">
            <div className="text-center">
              <Clock className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
              <p className="text-[#94A3B8]">Chart visualization would go here</p>
              <p className="text-[#64748B] text-sm">(Use recharts library for implementation)</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
          <h3 className="text-white mb-6">Average Repair Times by Type</h3>
          <div className="space-y-4">
            {[
              { type: 'Screen Repair', time: '2.5 hours', color: 'bg-[#00FF88]', width: '80%' },
              { type: 'Battery Replacement', time: '1.5 hours', color: 'bg-[#00D9FF]', width: '60%' },
              { type: 'Water Damage', time: '5.2 hours', color: 'bg-[#FFB800]', width: '95%' },
              { type: 'Software Issue', time: '0.8 hours', color: 'bg-[#A78BFA]', width: '30%' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#94A3B8] text-sm">{item.type}</span>
                  <span className="text-white text-sm">{item.time}</span>
                </div>
                <div className="w-full bg-[#121B2D] rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: item.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
