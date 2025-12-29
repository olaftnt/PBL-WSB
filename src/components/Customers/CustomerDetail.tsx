'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Edit, Ticket, Smartphone } from 'lucide-react';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { updateCustomer } from '@/app/(app)/_actions/customers';
import { viewToPath } from '@/lib/viewRouter';

type CustomerSummary = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  joined: string;
  totalTickets: number;
  activeTickets: number;
  devicesCount: number;
};

type CustomerTicket = {
  id: string;
  number: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  device: string | null;
};

type CustomerDevice = {
  id: string;
  name: string;
  model?: string | null;
  serial?: string | null;
  type?: string | null;
};

interface CustomerDetailProps {
  customer: CustomerSummary;
  tickets: CustomerTicket[];
  devices: CustomerDevice[];
}

const statusClasses = {
  NEW: 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/20',
  IN_PROGRESS: 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20',
  WAITING: 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20',
  DONE: 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20',
  CANCELED: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20',
};

const priorityDot = {
  CRITICAL: 'bg-[#FF6B35]',
  HIGH: 'bg-[#FF6B35]',
  NORMAL: 'bg-[#FFB800]',
  LOW: 'bg-[#00D9FF]',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pl-PL');
};

const initials = (full: string) =>
  full
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('');

export function CustomerDetail({ customer, tickets, devices }: CustomerDetailProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email ?? '');
  const [phone, setPhone] = useState(customer.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError('Imię i nazwisko są wymagane.');
      return;
    }
    if (!trimmedPhone) {
      setError('Telefon jest wymagany.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateCustomer({
        id: customer.id,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
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
            onClick={() => router.push('/customers')}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00D9FF] to-[#0099CC] rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">
                {initials(customer.name)}
              </span>
            </div>
            <div>
              <h1 className="text-white text-2xl mb-1">{customer.name}</h1>
              <p className="text-[#94A3B8]">Klient od {formatDate(customer.joined)}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="px-6 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Edytuj klienta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Informacje kontaktowe</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#00D9FF] mt-0.5" />
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Email</p>
                  <p className="text-white">{customer.email ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#00FF88] mt-0.5" />
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Telefon</p>
                  <p className="text-white">{customer.phone ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Statystyki</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Wszystkie zgłoszenia</p>
                <p className="text-white text-2xl">{customer.totalTickets}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Aktywne zgłoszenia</p>
                <p className="text-[#00FF88] text-2xl">{customer.activeTickets}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Zarejestrowane urządzenia</p>
                <p className="text-white text-2xl">{customer.devicesCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets & Devices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tickets */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#00FF88]" />
                Historia zgłoszeń
              </h3>
              <button
                onClick={() => router.push('/tickets/new')}
                className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform text-sm"
              >
                Nowe zgłoszenie
              </button>
            </div>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => router.push(viewToPath('ticket-detail', ticket.id))}
                  className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">{ticket.number}</span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${statusClasses[ticket.status] ?? statusClasses.WAITING}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-1">{ticket.device ?? '—'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-xs">{formatDate(ticket.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityDot[ticket.priority] ?? 'bg-[#64748B]'}`}></div>
                      <span className="text-[#64748B] text-xs capitalize">{ticket.priority.toLowerCase()}</span>
                    </div>
                  </div>
                </button>
              ))}
              {tickets.length === 0 && (
                <div className="text-center text-[#94A3B8] border border-dashed border-[#1A2642] rounded-lg p-6">
                  Brak zgłoszeń dla tego klienta.
                </div>
              )}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#A78BFA]" />
                Zarejestrowane urządzenia
              </h3>
              <button
                onClick={() => router.push('/devices')}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors text-sm"
              >
                Dodaj urządzenie
              </button>
            </div>
            <div className="space-y-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => router.push(viewToPath('device-detail', device.id))}
                  className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left flex items-start gap-3"
                >
                  <Smartphone className="w-10 h-10 text-[#A78BFA] mt-1" />
                  <div className="flex-1">
                    <p className="text-white mb-1">{device.name}{device.model ? ` ${device.model}` : ''}</p>
                    <p className="text-[#94A3B8] text-sm mb-1">Type: <span className="capitalize">{device.type ?? 'device'}</span></p>
                    <p className="text-[#64748B] text-sm">Serial: {device.serial ?? '—'}</p>
                  </div>
                </button>
              ))}
              {devices.length === 0 && (
                <div className="text-center text-[#94A3B8] border border-dashed border-[#1A2642] rounded-lg p-6">
                  Brak urządzeń przypisanych do klienta.
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
              <h3 className="text-white">Edytuj klienta</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Imię i nazwisko</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
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
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
