'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import type { View } from '@/types/view';
import type { TicketPriority, TicketStatus } from '@prisma/client';

type TicketRow = {
  id: string; // prisma id
  number: string; // INCxxxxx  ✅

  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string | Date;

  customer: { name: string };
  device?: { name: string } | null;
};

interface TicketListProps {
  onNavigate: (view: View, id?: string) => void;
  tickets: TicketRow[];
}

export function TicketList({ onNavigate, tickets }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all');

  // Mapowanie statusów/prio na Twoje kolory (zostaje)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/20';
      case 'IN_PROGRESS': return 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20';
      case 'WAITING': return 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20';
      case 'DONE': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20';
      case 'CANCELED': return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20';
      default: return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-[#FF6B35]';
      case 'HIGH': return 'bg-[#FF6B35]';
      case 'NORMAL': return 'bg-[#FFB800]';
      case 'LOW': return 'bg-[#00D9FF]';
      default: return 'bg-[#64748B]';
    }
  };

  // Prosty „deadline” placeholder (bo w schema nie masz SLA/deadline jeszcze)
  // Możesz później podłączyć SLA policzone po createdAt + reguły.
  const deadlineLabel = (status: TicketStatus) => {
    if (status === 'NEW') return '—';
    if (status === 'IN_PROGRESS') return '—';
    if (status === 'WAITING') return '—';
    if (status === 'DONE') return 'OK';
    if (status === 'CANCELED') return '—';
    return '—';
  };

  const getDeadlineColor = (deadline: string) => {
    if (deadline.includes('m') || (deadline.includes('h') && parseInt(deadline) < 4)) {
      return 'text-[#FF6B35]';
    }
    if (deadline.includes('h') || deadline === '1d') {
      return 'text-[#FFB800]';
    }
    return 'text-[#00FF88]';
  };

  const fmtCreated = (d: string | Date) => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    // format “YYYY-MM-DD HH:mm”
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return tickets.filter((t) => {
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.customer?.name?.toLowerCase().includes(q) ||
        (t.device?.name ?? '').toLowerCase().includes(q) ||
        t.number.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;

      return matchQuery && matchStatus && matchPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Zgłoszenia</h1>
          <p className="text-[#94A3B8]">Zarządzanie zgłoszeniami</p>
        </div>
        <button
          onClick={() => onNavigate('new-ticket')}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nowe zgłoszenie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Sprawdź po ID, tytule, kliencie lub urządzeniu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="NEW">Nowe</option>
              <option value="IN_PROGRESS">W trakcie realizacji</option>
              <option value="WAITING">Oczekujące</option>
              <option value="DONE">Wykonane</option>
              <option value="CANCELED">Anulowane</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
            >
              <option value="all">Wszystkie priorytety</option>
              <option value="CRITICAL">Krytyczny</option>
              <option value="HIGH">Wysoki</option>
              <option value="NORMAL">Normalny</option>
              <option value="LOW">Niski</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1A2642]">
          <button className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Eksportuj
          </button>
          <div className="ml-auto text-[#94A3B8] text-sm">
            {filteredTickets.length} znalezione
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[#0C1222] rounded-xl border border-[#1A2642] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A2642]">
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Numer zgłoszenia</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Tytuł</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Klient</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Urządzenie</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Status</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Priorytet</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Termin realizacji</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Data utworzenia</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const dl = deadlineLabel(t.status);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onNavigate('ticket-detail', t.id)}
                    className="border-b border-[#1A2642] hover:bg-[#121B2D] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white">{t.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8]">{t.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8]">{t.customer?.name ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#64748B]" />
                        <span className="text-[#94A3B8]">{t.device?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(t.priority)}`}></div>
                        <span className="text-[#94A3B8] text-sm">{t.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(dl.includes('m') || (dl.includes('h') && parseInt(dl) < 4)) ? (
                          <AlertCircle className="w-4 h-4 text-[#FF6B35]" />
                        ) : null}
                        <span className={`text-sm ${getDeadlineColor(dl)}`}>{dl}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{fmtCreated(t.createdAt)}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#94A3B8]">
                    Brak ticketów dla wybranych filtrów.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
