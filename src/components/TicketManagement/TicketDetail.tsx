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
  X,
  Printer
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

  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };

  device?: {
    name: string;
    model?: string | null;
    serial?: string | null;
  } | null;

  events: Array<{
    id: string;
    type: TicketEventType;
    message: string;
    author?: string | null;
    createdAt: string | Date;
  }>;

  repairProtocol?: {
    id: string;
    performedWork: string;
    repairCost: string | number;
    servicePerson?: string | null;
    createdAt: string | Date;
  } | null;
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
  onCompleteWithProtocol: (payload: {
    ticketId: string;
    performedWork: string;
    repairCost: string;
    servicePerson: string | null;
  }) => Promise<any>;
}

export function TicketDetail({
  ticket,
  deadline,
  onBack,
  onUpdateStatus,
  onAddNote,
  onEdit,
  onDelete,
  onCompleteWithProtocol
}: Props) {
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolSubmitting, setProtocolSubmitting] = useState(false);

  const [protocolState, setProtocolState] = useState(() => ({
    performedWork: ticket.repairProtocol?.performedWork ?? '',
    repairCost: ticket.repairProtocol?.repairCost ? String(ticket.repairProtocol.repairCost) : '',
    servicePerson: ticket.repairProtocol?.servicePerson ?? '',
  }));

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

  const escapeHtml = (value: unknown) => {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const normalizeMoney = (value: string) => {
    const cleaned = value.trim().replace(',', '.');
    const number = Number(cleaned);

    if (Number.isNaN(number)) return value;

    return number.toFixed(2);
  };

  const statuses: Array<{ id: TicketStatus; label: string; color: string; bg: string }> = [
    { id: 'NEW', label: 'Nowe', color: 'text-[#00D9FF]', bg: 'bg-[#00D9FF]/10' },
    { id: 'IN_PROGRESS', label: 'W trakcie', color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10' },
    { id: 'WAITING', label: 'Oczekujące', color: 'text-[#FFB800]', bg: 'bg-[#FFB800]/10' },
    { id: 'DONE', label: 'Wykonane', color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10' },
    { id: 'CANCELED', label: 'Anulowane', color: 'text-[#64748B]', bg: 'bg-[#64748B]/10' },
  ];

  const currentStatusIndex = Math.max(0, statuses.findIndex((s) => s.id === ticket.status));

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
    if (status === 'DONE') {
      setShowProtocol(true);
      return;
    }

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
        .map((s) => s.trim())
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

  const printRepairProtocol = () => {
    const now = new Date();

    const performedWork = escapeHtml(
      protocolState.performedWork.trim() || ticket.repairProtocol?.performedWork || '—'
    );

    const repairCost = escapeHtml(
      normalizeMoney(protocolState.repairCost || String(ticket.repairProtocol?.repairCost ?? '0'))
    );

    const servicePerson = escapeHtml(
      protocolState.servicePerson.trim() || ticket.repairProtocol?.servicePerson || '—'
    );

    const protocolHtml = `
      <!doctype html>
      <html lang="pl">
      <head>
        <meta charset="utf-8" />
        <title>Protokół naprawy ${escapeHtml(ticket.number)}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.25;
          }

          .page {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
            padding: 0;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1.5px solid #111827;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }

          .title {
            font-size: 19px;
            font-weight: 700;
            margin: 0 0 2px 0;
          }

          .subtitle {
            color: #4b5563;
            margin: 0;
            font-size: 10px;
          }

          .protocol-number {
            text-align: right;
            font-size: 10px;
            color: #374151;
            line-height: 1.35;
          }

          .section {
            margin-bottom: 8px;
          }

          .section-title {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 4px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 3px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px 16px;
          }

          .field-label {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 1px;
          }

          .field-value {
            font-weight: 600;
            min-height: 13px;
            font-size: 11px;
          }

          .box {
            border: 1px solid #d1d5db;
            padding: 6px;
            min-height: 32px;
            max-height: 62px;
            overflow: hidden;
            white-space: pre-wrap;
            line-height: 1.25;
            font-size: 10.5px;
          }

          .box-small {
            min-height: 30px;
            max-height: 48px;
          }

          .box-large {
            min-height: 44px;
            max-height: 82px;
          }

          .cost {
            font-size: 15px;
            font-weight: 700;
          }

          .statement {
            border: 1px solid #d1d5db;
            padding: 6px;
            line-height: 1.25;
            font-size: 10px;
            color: #374151;
          }

          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 38px;
            margin-top: 34px;
          }

          .signature-line {
            border-top: 1px solid #111827;
            padding-top: 5px;
            text-align: center;
            font-size: 10px;
            color: #374151;
          }

          .footer {
            margin-top: 12px;
            font-size: 8.5px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 5px;
            line-height: 1.25;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          @media print {
            html,
            body {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }

            .page {
              page-break-after: avoid;
              page-break-before: avoid;
              page-break-inside: avoid;
            }

            .section,
            .header,
            .signatures,
            .footer {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>
        <div class="page">
          <div class="header">
            <div>
              <h1 class="title">Protokół naprawy</h1>
              <p class="subtitle">Potwierdzenie wykonania usługi serwisowej</p>
            </div>

            <div class="protocol-number">
              <div><strong>Nr zgłoszenia:</strong> ${escapeHtml(ticket.number)}</div>
              <div><strong>Data wystawienia:</strong> ${escapeHtml(fmt(now))}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dane klienta</div>
            <div class="grid">
              <div>
                <div class="field-label">Imię i nazwisko / nazwa</div>
                <div class="field-value">${escapeHtml(ticket.customer.name || '—')}</div>
              </div>

              <div>
                <div class="field-label">Telefon</div>
                <div class="field-value">${escapeHtml(ticket.customer.phone || '—')}</div>
              </div>

              <div>
                <div class="field-label">E-mail</div>
                <div class="field-value">${escapeHtml(ticket.customer.email || '—')}</div>
              </div>

              <div>
                <div class="field-label">Numer zgłoszenia</div>
                <div class="field-value">${escapeHtml(ticket.number)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dane urządzenia</div>
            <div class="grid">
              <div>
                <div class="field-label">Urządzenie</div>
                <div class="field-value">${escapeHtml(ticket.device?.name || '—')}</div>
              </div>

              <div>
                <div class="field-label">Model</div>
                <div class="field-value">${escapeHtml(ticket.device?.model || '—')}</div>
              </div>

              <div>
                <div class="field-label">Numer seryjny</div>
                <div class="field-value">${escapeHtml(ticket.device?.serial || '—')}</div>
              </div>

              <div>
                <div class="field-label">Akcesoria</div>
                <div class="field-value">${escapeHtml(ticket.accessories?.length ? ticket.accessories.join(', ') : '—')}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Opis zgłoszonego problemu</div>
            <div class="box box-small">${escapeHtml(ticket.description || '—')}</div>
          </div>

          <div class="section">
            <div class="section-title">Stan fizyczny urządzenia przy przyjęciu</div>
            <div class="box box-small">${escapeHtml(ticket.physicalCondition || '—')}</div>
          </div>

          <div class="section">
            <div class="section-title">Wykonane czynności serwisowe</div>
            <div class="box box-large">${performedWork}</div>
          </div>

          <div class="section">
            <div class="section-title">Koszt naprawy</div>
            <div class="cost">${repairCost} zł</div>
          </div>

          <div class="section">
            <div class="section-title">Serwisant</div>
            <div class="field-value">${servicePerson}</div>
          </div>

          <div class="section">
            <div class="section-title">Oświadczenie</div>
            <div class="statement">
              Klient potwierdza odbiór urządzenia oraz wykonanie usługi serwisowej zgodnie z opisem w niniejszym protokole.
              Podpis klienta oznacza akceptację zakresu wykonanych prac oraz kosztu naprawy.
            </div>
          </div>

          <div class="signatures">
            <div class="signature-line">
              Podpis klienta
            </div>

            <div class="signature-line">
              Podpis serwisanta
            </div>
          </div>

          <div class="footer">
            Protokół został wygenerowany automatycznie na podstawie danych zgłoszenia serwisowego.
          </div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=1200');

    if (!printWindow) {
      alert('Przeglądarka zablokowała okno drukowania. Zezwól na wyskakujące okna dla tej strony.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(protocolHtml);
    printWindow.document.close();
  };

  const completeWithProtocol = async () => {
    const performedWork = protocolState.performedWork.trim();
    const repairCost = protocolState.repairCost.trim();

    if (!performedWork) return;
    if (!repairCost) return;

    setProtocolSubmitting(true);

    try {
      await onCompleteWithProtocol({
        ticketId: ticket.id,
        performedWork,
        repairCost,
        servicePerson: protocolState.servicePerson.trim() || null,
      });

      printRepairProtocol();
      setShowProtocol(false);
    } finally {
      setProtocolSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-white text-2xl mb-1">{ticket.number}</h1>
            <p className="text-[#94A3B8]">Szczegóły zgłoszenia</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {ticket.repairProtocol ? (
            <button
              onClick={printRepairProtocol}
              className="px-4 py-2 bg-[#121B2D] border border-[#00FF88] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Drukuj protokół
            </button>
          ) : (
            <button
              onClick={() => setShowProtocol(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Wygeneruj protokół
            </button>
          )}

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
            <p className="text-[#94A3B8] whitespace-pre-wrap">{ticket.description ?? '—'}</p>
          </div>

          {/* Physical */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Stan fizyczny</h3>
            <p className="text-[#94A3B8] whitespace-pre-wrap">{ticket.physicalCondition ?? '—'}</p>
          </div>

          {/* Existing Protocol */}
          {ticket.repairProtocol && (
            <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
              <h3 className="text-white mb-4 flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#00FF88]" />
                Protokół naprawy
              </h3>

              <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] space-y-4">
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Wykonane czynności</p>
                  <p className="text-white whitespace-pre-wrap">{ticket.repairProtocol.performedWork}</p>
                </div>

                <div>
                  <p className="text-[#64748B] text-sm mb-1">Kwota naprawy</p>
                  <p className="text-[#00FF88] text-lg">{String(ticket.repairProtocol.repairCost)} zł</p>
                </div>

                <div>
                  <p className="text-[#64748B] text-sm mb-1">Serwisant</p>
                  <p className="text-white">{ticket.repairProtocol.servicePerson ?? '—'}</p>
                </div>

                <button
                  onClick={printRepairProtocol}
                  className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Drukuj / zapisz jako PDF
                </button>
              </div>
            </div>
          )}

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

              <div>
                <p className="text-[#64748B] text-sm mb-1">Czas realizacji</p>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${deadlineInfo.color}`} />
                  <p className={`${deadlineInfo.color} text-sm`}>{deadlineInfo.label}</p>
                </div>
              </div>

              <div>
                <p className="text-[#64748B] text-sm mb-1">Priorytet</p>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121B2D] border border-[#1A2642] text-[#94A3B8] text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'
                        ? 'bg-[#FF6B35]'
                        : ticket.priority === 'NORMAL'
                          ? 'bg-[#FFB800]'
                          : 'bg-[#00D9FF]'
                    }`}
                  />
                  {ticket.priority === 'CRITICAL'
                    ? 'Krytyczny'
                    : ticket.priority === 'HIGH'
                      ? 'Wysoki'
                      : ticket.priority === 'NORMAL'
                        ? 'Normalny'
                        : ticket.priority === 'LOW'
                          ? 'Niski'
                          : ticket.priority}
                </span>
              </div>

              <div>
                <p className="text-[#64748B] text-sm mb-1">SLA</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#64748B]/10 text-[#94A3B8] text-sm border border-[#64748B]/20">
                  {ticket.slaType === 'STANDARD'
                    ? 'Standard'
                    : ticket.slaType === 'EXPRESS'
                      ? 'Ekspres'
                      : ticket.slaType === 'VIP'
                        ? 'VIP'
                        : ticket.slaType === 'WARRANTY'
                          ? 'Gwarancja'
                          : ticket.slaType}
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
                        <p className="text-[#94A3B8] text-sm whitespace-pre-wrap">{ev.message}</p>
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

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0C1222] rounded-2xl border border-[#1A2642] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#1A2642] shrink-0">
              <h3 className="text-white">Edytuj zgłoszenie</h3>
              <button onClick={() => setShowEdit(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-4">
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
                <label className="block text-[#94A3B8] text-sm mb-2">Akcesoria oddzielone przecinkami</label>
                <input
                  value={editState.accessories}
                  onChange={(e) => setEditState({ ...editState, accessories: e.target.value })}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88]"
                />
              </div>
            </div>

            <div className="shrink-0 bg-[#0C1222] border-t border-[#1A2642] flex justify-end gap-3 px-6 py-4">
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
      )}

      {/* REPAIR PROTOCOL MODAL */}
      {showProtocol && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0C1222] rounded-2xl border border-[#1A2642] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#1A2642] shrink-0">
              <div>
                <h3 className="text-white text-xl">Protokół naprawy</h3>
                <p className="text-[#64748B] text-sm mt-1">
                  Zgłoszenie {ticket.number} zostanie oznaczone jako wykonane.
                </p>
              </div>

              <button onClick={() => setShowProtocol(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
                <p className="text-[#94A3B8] text-sm mb-1">Klient</p>
                <p className="text-white">{ticket.customer.name}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Urządzenie</p>
                    <p className="text-white">{ticket.device?.name ?? '—'}</p>
                  </div>

                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Model</p>
                    <p className="text-white">{ticket.device?.model ?? '—'}</p>
                  </div>

                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Numer seryjny</p>
                    <p className="text-white">{ticket.device?.serial ?? '—'}</p>
                  </div>

                  <div>
                    <p className="text-[#64748B] text-sm mb-1">Numer zgłoszenia</p>
                    <p className="text-white">{ticket.number}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Co zostało wykonane?</label>
                <textarea
                  value={protocolState.performedWork}
                  onChange={(e) =>
                    setProtocolState({
                      ...protocolState,
                      performedWork: e.target.value,
                    })
                  }
                  rows={5}
                  placeholder="Np. Wymieniono gniazdo ładowania, wykonano czyszczenie płyty głównej, przetestowano ładowanie oraz działanie urządzenia."
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Kwota naprawy</label>

                  <div className="relative">
                    <input
                      value={protocolState.repairCost}
                      onChange={(e) =>
                        setProtocolState({
                          ...protocolState,
                          repairCost: e.target.value,
                        })
                      }
                      placeholder="Np. 250"
                      className="w-full px-4 py-3 pr-12 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                      zł
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Serwisant</label>
                  <input
                    value={protocolState.servicePerson}
                    onChange={(e) =>
                      setProtocolState({
                        ...protocolState,
                        servicePerson: e.target.value,
                      })
                    }
                    placeholder="Imię i nazwisko serwisanta"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                </div>
              </div>

              <div className="bg-[#121B2D] border border-[#1A2642] rounded-lg p-4">
                <p className="text-[#94A3B8] text-sm">
                  Po zatwierdzeniu system zapisze protokół w bazie danych, doda wpis do logu,
                  oznaczy zgłoszenie jako wykonane i otworzy dokument gotowy do druku lub zapisu jako PDF.
                </p>
              </div>
            </div>

            <div className="shrink-0 bg-[#0C1222] border-t border-[#1A2642] flex justify-end gap-3 px-6 py-4">
              <button
                onClick={() => setShowProtocol(false)}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88]"
              >
                Anuluj
              </button>

              <button
                onClick={completeWithProtocol}
                disabled={protocolSubmitting || !protocolState.performedWork.trim() || !protocolState.repairCost.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {protocolSubmitting ? 'Generuję…' : 'Zatwierdź i drukuj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-md w-full">
            <h3 className="text-white mb-3">Usunąć zgłoszenie {ticket.number}?</h3>
            <p className="text-[#94A3B8] text-sm mb-6">
              Ta operacja jest nieodwracalna. Usunie także log, notatki oraz protokół naprawy.
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