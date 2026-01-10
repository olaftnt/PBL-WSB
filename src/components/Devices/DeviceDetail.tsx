'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Laptop, User, Ticket, Edit } from 'lucide-react';
import { TicketStatus } from '@prisma/client';
import { updateDevice } from '@/app/(app)/_actions/devices';
import { viewToPath } from '@/lib/viewRouter';

type DeviceSummary = {
  id: string;
  name: string;
  model: string | null;
  serial: string | null;
  notes: string | null;
  customer: { id: string; name: string; email: string | null };
  ticketsCount: number;
};

type DeviceTicket = {
  id: string;
  number: string;
  status: TicketStatus;
  createdAt: string;
};

interface DeviceDetailProps {
  device: DeviceSummary;
  tickets: DeviceTicket[];
}

const statusClasses = {
  NEW: 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/20',
  IN_PROGRESS: 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20',
  WAITING: 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20',
  DONE: 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20',
  CANCELED: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pl-PL');
};

export function DeviceDetail({ device, tickets }: DeviceDetailProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(device.name);
  const [model, setModel] = useState(device.model ?? '');
  const [serial, setSerial] = useState(device.serial ?? '');
  const [notes, setNotes] = useState(device.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Nazwa urządzenia jest wymagana.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateDevice({
        id: device.id,
        name: trimmedName,
        model: model.trim() || null,
        serial: serial.trim() || null,
        notes: notes.trim() || null,
      });
      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się zapisać zmian.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/devices')}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white">
              <Laptop className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white text-2xl mb-1">
                {device.name} {device.model ?? ''}
              </h1>
              <p className="text-[#94A3B8]">Serial: {device.serial ?? '—'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="px-6 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Edytuj urządzenie
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informacje o urządzeniu */}
        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Informacje o urządzeniu</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Nazwa</p>
                <p className="text-white capitalize">{device.name}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Model</p>
                <p className="text-white">{device.model ?? '—'}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Numer seryjny</p>
                <p className="text-white">{device.serial ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00D9FF]" />
              Właściciel
            </h3>
            <button
              onClick={() => router.push(viewToPath('customer-detail', device.customer.id))}
              className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
            >
              <p className="text-white mb-1">{device.customer.name}</p>
              <p className="text-[#94A3B8] text-sm">{device.customer.email ?? '—'}</p>
            </button>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Notatki</h3>
            <p className="text-[#94A3B8] text-sm">{device.notes ?? '—'}</p>
          </div>
        </div>

        {/* Repair History */}
        <div className="lg:col-span-2">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#00FF88]" />
                Powiązane zgłoszenia
              </h3>
              <button
                onClick={() => router.push('/tickets/new')}
                className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform text-sm"
              >
                Nowe zgłoszenie
              </button>
            </div>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => router.push(viewToPath('ticket-detail', ticket.id))}
                  className="w-full bg-[#121B2D] rounded-lg p-6 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-[#00FF88]" />
                      <span className="text-white">{ticket.number}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs border ${statusClasses[ticket.status] ?? statusClasses.WAITING}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">{formatDate(ticket.createdAt)}</span>
                    <span className="text-[#94A3B8]">{ticket.status}</span>
                  </div>
                </button>
              ))}
              {tickets.length === 0 && (
                <div className="text-center text-[#94A3B8] border border-dashed border-[#1A2642] rounded-lg p-6">
                  Brak zgłoszeń dla tego urządzenia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Edytuj urządzenie</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Nazwa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Numer seryjny</label>
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Notatki</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSaving}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white transition-colors disabled:opacity-60"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
