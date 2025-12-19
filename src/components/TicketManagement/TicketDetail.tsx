'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  User,
  Smartphone,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import type { TicketPriority, TicketStatus, SLATYPE } from '@prisma/client';

type TicketDetailModel = {
  id: string;
  number: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  slaType: SLATYPE;
  physicalCondition: string | null;
  accessories: string[];
  createdAt: string | Date;
  updatedAt: string | Date;

  customer: { name: string; email: string | null; phone: string | null };
  device: { name: string; model: string | null; serial: string | null } | null;
};

export function TicketDetail({
  ticket,
  onBack,
  onUpdateStatus,
}: {
  ticket: TicketDetailModel;
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => Promise<void>;
}) {
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(ticket.status);
  const [savingStatus, setSavingStatus] = useState(false);

  const statuses = useMemo(() => ([
    { id: 'NEW' as const, label: 'Nowe', color: 'text-[#00D9FF]', bg: 'bg-[#00D9FF]/10' },
    { id: 'IN_PROGRESS' as const, label: 'W trakcie', color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10' },
    { id: 'WAITING' as const, label: 'Oczekujące', color: 'text-[#FFB800]', bg: 'bg-[#FFB800]/10' },
    { id: 'DONE' as const, label: 'Wykonane', color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10' },
    { id: 'CANCELED' as const, label: 'Anulowane', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10' },
  ]), []);

  const currentStatusIndex = statuses.findIndex(s => s.id === currentStatus);

  const fmtDateTime = (d: string | Date) => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  // „Czas realizacji”: gdy DONE => OK, w innym razie licz od createdAt
  const resolutionLabel = () => {
    if (currentStatus === 'DONE') return 'OK';

    const created = typeof ticket.createdAt === 'string' ? new Date(ticket.createdAt) : ticket.createdAt;
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return '—';

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const handleSetStatus = async (status: TicketStatus) => {
    setCurrentStatus(status);
    setSavingStatus(true);
    try {
      await onUpdateStatus(status);
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">{ticket.number}</h1>
            <p className="text-[#94A3B8]">Szczegóły zgłoszenia</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2"
            onClick={() => alert('Edycja: do zrobienia')}
          >
            <Edit className="w-4 h-4" />
            Edytuj
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-[#121B2D] border border-[#FF6B35] rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors flex items-center gap-2"
            onClick={() => alert('Usuwanie: do zrobienia')}
          >
            <Trash2 className="w-4 h-4" />
            Usuń
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progress */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Status zgłoszenia</h3>
              <div className="text-xs text-[#94A3B8]">
                {savingStatus ? 'Zapisywanie statusu…' : ' '}
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                {statuses.map((status, index) => (
                  <div key={status.id} className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => handleSetStatus(status.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        index <= currentStatusIndex
                          ? `${status.bg} ${status.color} border-2 border-current`
                          : 'bg-[#121B2D] border-2 border-[#1A2642] text-[#64748B]'
                      }`}
                      title={status.label}
                    >
                      {index < currentStatusIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </button>
                    <span className={`mt-2 text-xs ${index <= currentStatusIndex ? status.color : 'text-[#64748B]'}`}>
                      {status.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#1A2642] -z-10">
                <div
                  className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A] transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00D9FF]" />
              Informacje o kliencie
            </h3>
            <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
              <p className="text-white mb-2">{ticket.customer.name}</p>
              <p className="text-[#94A3B8] text-sm mb-1">{ticket.customer.email ?? '—'}</p>
              <p className="text-[#94A3B8] text-sm">{ticket.customer.phone ?? '—'}</p>
            </div>
          </div>

          {/* Device */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#A78BFA]" />
              Informacje o urządzeniu
            </h3>

            <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
              {ticket.device ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Nazwa</p>
                    <p className="text-white">{ticket.device.name}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Model</p>
                    <p className="text-white">{ticket.device.model ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] text-sm mb-1">SN</p>
                    <p className="text-white">{ticket.device.serial ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Akcesoria</p>
                    <p className="text-white">{(ticket.accessories?.length ? ticket.accessories : ['—']).join(', ')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[#94A3B8]">Brak przypisanego urządzenia.</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Opis problemu</h3>
            <p className="text-[#94A3B8] whitespace-pre-wrap">
              {ticket.description ?? '—'}
            </p>
          </div>

          {/* Physical Condition */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Stan fizyczny</h3>
            <p className="text-[#94A3B8] whitespace-pre-wrap">
              {ticket.physicalCondition ?? '—'}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Informacje o zgłoszeniu</h3>

            <div className="space-y-3">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Utworzony</p>
                <p className="text-white text-sm">{fmtDateTime(ticket.createdAt)}</p>
              </div>

              <div>
                <p className="text-[#64748B] text-sm mb-1">Czas realizacji</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFB800]" />
                  <p className={currentStatus === 'DONE' ? 'text-[#00FF88] text-sm' : 'text-[#FFB800] text-sm'}>
                    {resolutionLabel()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[#64748B] text-sm mb-1">Priorytet</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#64748B]/10 text-[#94A3B8] text-sm border border-[#64748B]/20">
                  {ticket.priority}
                </span>
              </div>

              <div>
                <p className="text-[#64748B] text-sm mb-1">SLA</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#64748B]/10 text-[#94A3B8] text-sm border border-[#64748B]/20">
                  {ticket.slaType}
                </span>
              </div>

              <div>
                <p className="text-[#64748B] text-sm mb-1">Tytuł</p>
                <p className="text-white text-sm">{ticket.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
