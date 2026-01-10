'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  User,
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  MessageSquare,
  X
} from 'lucide-react';
import type { TicketStatus, TicketPriority, SLATYPE, TicketEventType } from '@prisma/client';
import { TicketEventType as TicketEventTypeEnum } from '@prisma/client';
import { formatDistanceToNow, isPast, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';

type TicketDetailModel = {
  id: string;
  number: string;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  slaType: SLATYPE;
  physicalCondition?: string | null;
  accessories: string[];
  createdAt: string | Date;

  customer: { name: string; email?: string | null; phone?: string | null };
  device?: { name: string; model?: string | null; serial?: string | null } | null;

  events: Array<{
    id: string;
    type: TicketEventType;
    message: string;
    author?: string | null;
    createdAt: string | Date;
  }>;
};

interface Props {
  ticket: TicketDetailModel;
  deadline: string | Date; 
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => Promise<any>;
  onAddNote: (message: string) => Promise<any>;
  onEdit: (payload: {
    title: string;
    description: string | null;
    priority: TicketPriority;
    slaType: SLATYPE;
    physicalCondition: string | null;
    accessories: string[];
  }) => Promise<any>;
  onDelete: () => Promise<any>;
}

export function TicketDetail({ ticket, deadline, onBack, onUpdateStatus, onAddNote, onEdit, onDelete }: Props) {
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editState, setEditState] = useState(() => ({
    title: ticket.title ?? '',
    description: ticket.description ?? '',
    priority: ticket.priority,
    slaType: ticket.slaType,
    physicalCondition: ticket.physicalCondition ?? '',
    accessories: (ticket.accessories ?? []).join(', '),
  }));

  const fmt = (d: string | Date) => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const statuses: Array<{ id: TicketStatus; label: string; color: string; bg: string }> = [
    { id: 'NEW', label: 'Nowe', color: 'text-[#00D9FF]', bg: 'bg-[#00D9FF]/10' },
    { id: 'IN_PROGRESS', label: 'W trakcie', color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10' },
    { id: 'WAITING', label: 'Oczekujące', color: 'text-[#FFB800]', bg: 'bg-[#FFB800]/10' },
    { id: 'DONE', label: 'Wykonane', color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10' },
    { id: 'CANCELED', label: 'Anulowane', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10' },
  ];

  const currentStatusIndex = Math.max(0, statuses.findIndex(s => s.id === ticket.status));

  const getActivityIcon = (type: TicketEventType) => {
    switch (type) {
      case TicketEventTypeEnum.STATUS:
        return <Clock className="w-4 h-4" />;
      case TicketEventTypeEnum.NOTE:
        return <MessageSquare className="w-4 h-4" />;
      case TicketEventTypeEnum.CREATED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const deadlineInfo = useMemo(() => {
    if (ticket.status === 'DONE') {
      return { label: 'Zakończono', color: 'text-[#00FF88]' };
    }
    if (ticket.status === 'CANCELED') {
      return { label: 'Anulowano', color: 'text-[#64748B]' };
    }

    const dateObj = new Date(deadline);
    
    if (!isValid(dateObj)) {
      return { label: '—', color: 'text-[#64748B]' };
    }

    const isOverdue = isPast(dateObj);
    const timeText = formatDistanceToNow(dateObj, { addSuffix: true, locale: pl });
    
    return {
      label: timeText,
      color: isOverdue ? 'text-[#FF6B35] font-bold' : 'text-[#00D9FF]'
    };
  }, [ticket.status, deadline]);

  const submitNote = async () => {
    const msg = newNote.trim();
    if (!msg) return;

    setSubmittingNote(true);
    try {
      await onAddNote(msg);
      setNewNote('');
    } finally {
      setSubmittingNote(false);
    }
  };

  const setStatus = async (status: TicketStatus) => {
    setSubmittingStatus(true);
    try {
      await onUpdateStatus(status);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const saveEdit = async () => {
    const title = editState.title.trim();
    if (!title) return;

    setSavingEdit(true);
    try {
      const accessories = editState.accessories
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await onEdit({
        title,
        description: editState.description.trim() || null,
        priority: editState.priority,
        slaType: editState.slaType,
        physicalCondition: editState.physicalCondition.trim() || null,
        accessories,
      });
      setShowEdit(false);
    } finally {
      setSavingEdit(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">{ticket.number}</h1>
            <p className="text-[#94A3B8]">Szczegóły zgłoszenia</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edytuj
          </button>

          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 bg-[#121B2D] border border-[#FF6B35] rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Usuń
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-6">Status zgłoszenia</h3>

            <div className="relative">
              <div className="flex items-center justify-between">
                {statuses.map((status, index) => (
                  <div key={status.id} className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setStatus(status.id)}
                      disabled={submittingStatus}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        index <= currentStatusIndex
                          ? `${status.bg} ${status.color} border-2 border-current`
                          : 'bg-[#121B2D] border-2 border-[#1A2642] text-[#64748B]'
                      } ${submittingStatus ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={submittingStatus ? 'Aktualizuję...' : `Ustaw: ${status.label}`}
                    >
                      {index < currentStatusIndex ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs">{index + 1}</span>}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Nazwa</p>
                  <p className="text-white">{ticket.device?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Model</p>
                  <p className="text-white">{ticket.device?.model ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm mb-1">SN</p>
                  <p className="text-white">{ticket.device?.serial ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Akcesoria</p>
                  <p className="text-white">{ticket.accessories?.length ? ticket.accessories.join(', ') : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Opis problemu</h3>
            <p className="text-[#94A3B8]">{ticket.description ?? '—'}</p>
          </div>

          {/* Physical */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Stan fizyczny</h3>
            <p className="text-[#94A3B8]">{ticket.physicalCondition ?? '—'}</p>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FFB800]" />
              Powiązane informacje
            </h3>
            <p className="text-[#64748B]">Historia poprzednich napraw: do wdrożenia.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Informacje o zgłoszeniu</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Utworzono</p>
                <p className="text-white text-sm">{fmt(ticket.createdAt)}</p>
              </div>
              
              {/* --- WYŚWIETLANIE CZASU SLA --- */}
              <div>
                <p className="text-[#64748B] text-sm mb-1">Czas realizacji</p>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${deadlineInfo.color}`} />
                  <p className={`${deadlineInfo.color} text-sm`}>{deadlineInfo.label}</p>
                </div>
              </div>
              {/* --------------------------------- */}

              <div>
                <p className="text-[#64748B] text-sm mb-1">Priorytet</p>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121B2D] border border-[#1A2642] text-[#94A3B8] text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' ? 'bg-[#FF6B35]' : 
                    ticket.priority === 'NORMAL' ? 'bg-[#FFB800]' : 'bg-[#00D9FF]'
                  }`} />
                  {ticket.priority === 'CRITICAL' ? 'Krytyczny' :
                   ticket.priority === 'HIGH' ? 'Wysoki' :
                   ticket.priority === 'NORMAL' ? 'Normalny' :
                   ticket.priority === 'LOW' ? 'Niski' : ticket.priority}
                </span>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">SLA</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#64748B]/10 text-[#94A3B8] text-sm border border-[#64748B]/20">
                  {ticket.slaType === 'STANDARD' ? 'Standard' :
                   ticket.slaType === 'EXPRESS' ? 'Ekspres' :
                   ticket.slaType === 'VIP' ? 'VIP' :
                   ticket.slaType === 'WARRANTY' ? 'Gwarancja' : ticket.slaType}
                </span>
              </div>
            </div>
          </div>

          {/* Add Note */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#00FF88]" />
              Dodaj notatkę
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Dodaj notatkę do logu..."
              rows={4}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none mb-3"
            />
            <button
              type="button"
              onClick={submitNote}
              disabled={submittingNote || !newNote.trim()}
              className="w-full py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submittingNote ? 'Dodawanie…' : 'Dodaj notatkę'}
            </button>
          </div>

          {/* Activity Log */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Log aktywności</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ticket.events?.length ? (
                ticket.events.map((ev) => (
                  <div key={ev.id} className="border-l-2 border-[#1A2642] pl-4 pb-3">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="text-[#00FF88] mt-1">{getActivityIcon(ev.type)}</div>
                      <div className="flex-1">
                        <p className="text-[#94A3B8] text-sm">{ev.message}</p>
                        <p className="text-[#64748B] text-xs mt-1">
                          {(ev.author ?? '—')} • {fmt(ev.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#64748B]">Brak wpisów w logu.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Edytuj zgłoszenie</h3>
              <button onClick={() => setShowEdit(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Tytuł</label>
                <input
                  value={editState.title}
                  onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Opis</label>
                <textarea
                  value={editState.description}
                  onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Priorytet</label>
                  <select
                    value={editState.priority}
                    onChange={(e) => setEditState({ ...editState, priority: e.target.value as TicketPriority })}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88]"
                  >
                    <option value="LOW">Niski</option>
                    <option value="NORMAL">Normalny</option>
                    <option value="HIGH">Wysoki</option>
                    <option value="CRITICAL">Krytyczny</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">SLA</label>
                  <select
                    value={editState.slaType}
                    onChange={(e) => setEditState({ ...editState, slaType: e.target.value as SLATYPE })}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88]"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Ekspres</option>
                    <option value="VIP">VIP</option>
                    <option value="WARRANTY">Gwarancja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Stan fizyczny</label>
                <textarea
                  value={editState.physicalCondition}
                  onChange={(e) => setEditState({ ...editState, physicalCondition: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Akcesoria (oddzielone przecinkami)</label>
                <input
                  value={editState.accessories}
                  onChange={(e) => setEditState({ ...editState, accessories: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88]"
                >
                  Anuluj
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit || !editState.title.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {savingEdit ? 'Zapisuję…' : 'Zapisz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-md w-full">
            <h3 className="text-white mb-3">Usunąć zgłoszenie {ticket.number}?</h3>
            <p className="text-[#94A3B8] text-sm mb-6">
              Ta operacja jest nieodwracalna (usunie także log/notatki).
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88]"
              >
                Anuluj
              </button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#121B2D] border border-[#FF6B35] rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Usuwanie…' : 'Usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}