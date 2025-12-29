'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Smartphone,
  AlertCircle,
  Clock // Dodano ikonkę zegara
} from 'lucide-react';
import type { View } from '@/types/view';
import type { TicketPriority, TicketStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import { formatDistanceToNow, isPast, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';

type TicketRow = {
  id: string;
  number: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string | Date;
  deadline: string;

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

  const getDeadlineInfo = (status: TicketStatus, deadlineStr: string) => {
    if (status === 'DONE') return { label: 'OK', color: 'text-[#00FF88]' };
    if (status === 'CANCELED') return { label: '—', color: 'text-[#64748B]' };

    const dateObj = new Date(deadlineStr);
    if (!isValid(dateObj)) return { label: '—', color: 'text-[#64748B]' };

    const isOverdue = isPast(dateObj);
    const timeText = formatDistanceToNow(dateObj, { addSuffix: true, locale: pl });

    return {
      label: timeText,
      color: isOverdue ? 'text-[#FF6B35] font-bold' : 'text-[#94A3B8]',
      icon: isOverdue ? <AlertCircle className="w-4 h-4 text-[#FF6B35]" /> : null
    };
  };
  // --------------------------------------

  const fmtCreated = (d: string | Date) => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const shouldHideDoneCanceledByDefault = statusFilter === 'all';

    return tickets.filter((t) => {
      if (shouldHideDoneCanceledByDefault && (t.status === 'DONE' || t.status === 'CANCELED')) {
        return false;
      }

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      if (!matchStatus) return false;

      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      if (!matchPriority) return false;

      const matchQuery =
        !q ||
        t.number.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.customer?.name?.toLowerCase().includes(q) ||
        (t.device?.name ?? '').toLowerCase().includes(q);

      return matchQuery;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const handleExportXlsx = () => {
    const rows = filteredTickets.map((t) => ({
      'Numer zgłoszenia': t.number,
      'Tytuł': t.title,
      'Klient': t.customer?.name ?? '',
      'Urządzenie': t.device?.name ?? '',
      'Status': t.status,
      'Priorytet': t.priority,
      'Termin': getDeadlineInfo(t.status, t.deadline).label,
      'Utworzono': fmtCreated(t.createdAt),
      'ID (wewn.)': t.id,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Zgloszenia');

    ws['!cols'] = [
      { wch: 16 }, { wch: 40 }, { wch: 24 }, { wch: 24 }, 
      { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 36 },
    ];

    const yyyy = new Date().getFullYear();
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    const dd = String(new Date().getDate()).padStart(2, '0');

    XLSX.writeFile(wb, `zgloszenia_${yyyy}-${mm}-${dd}.xlsx`);
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Szukaj po numerze (INC...), tytule, kliencie lub urządzeniu..."
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
              <option value="all">Aktywne (bez wykonanych i anulowanych)</option>
              <option value="NEW">Nowe</option>
              <option value="IN_PROGRESS">W trakcie</option>
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
          <button
            type="button"
            onClick={handleExportXlsx}
            className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Eksportuj (XLSX)
          </button>

          <div className="ml-auto text-[#94A3B8] text-sm">
            {filteredTickets.length} znalezione
          </div>
        </div>
      </div>

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
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Termin</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Utworzono</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const dlInfo = getDeadlineInfo(t.status, t.deadline);
                
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
                        {t.status === 'NEW' ? 'Nowe' : 
                         t.status === 'IN_PROGRESS' ? 'W trakcie' :
                         t.status === 'WAITING' ? 'Oczekujące' :
                         t.status === 'DONE' ? 'Wykonane' :
                         t.status === 'CANCELED' ? 'Anulowane' : t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(t.priority)}`} />
                        <span className="text-[#94A3B8] text-sm">
                          {t.priority === 'CRITICAL' ? 'Krytyczny' :
                           t.priority === 'HIGH' ? 'Wysoki' :
                           t.priority === 'NORMAL' ? 'Normalny' :
                           t.priority === 'LOW' ? 'Niski' : t.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* dynamiczny licznik */}
                      <div className="flex items-center gap-2">
                        {dlInfo.icon}
                        <span className={`text-sm ${dlInfo.color}`}>{dlInfo.label}</span>
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
                    Brak zgłoszeń dla wybranych filtrów.
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