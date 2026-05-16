import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Smartphone, Trash2 } from 'lucide-react';
import type { View } from '@/types/view';
import type { DeviceListItem } from '@/types/device';
import type { CustomerListItem } from '@/types/customer';

interface DeviceListProps {
  onNavigate: (view: View, id?: string) => void;
  devices: DeviceListItem[];
  customers: Pick<CustomerListItem, 'id' | 'name' | 'phone'>[];
  onCreateDevice: (payload: {
    customerId: string;
    name: string;
    model?: string | null;
    serial?: string | null;
    notes?: string | null;
  }) => Promise<any>;
}

export function DeviceList({ onNavigate, devices, customers, onCreateDevice }: DeviceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'active' | 'deleted' | 'all'>('active');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDeviceIcon = () => <Smartphone className="w-6 h-6" />;

  const filteredDevices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = devices ?? [];
    return list.filter((device) => {
      if (visibilityFilter === 'active' && device.isDeleted) return false;
      if (visibilityFilter === 'deleted' && !device.isDeleted) return false;

      if (!q) return true;
      return (
        device.name.toLowerCase().includes(q) ||
        (device.model ?? '').toLowerCase().includes(q) ||
        (device.serial ?? '').toLowerCase().includes(q) ||
        device.customerName.toLowerCase().includes(q)
      );
    });
  }, [devices, searchQuery, visibilityFilter]);

  const resetForm = () => {
    setName('');
    setModel('');
    setSerial('');
    setNotes('');
    setCustomerId('');
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedModel = model.trim();
    const trimmedSerial = serial.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedName) {
      setError('Nazwa urządzenia jest wymagana.');
      return;
    }
    if (!customerId) {
      setError('Wybierz klienta.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreateDevice({
        name: trimmedName,
        model: trimmedModel || null,
        serial: trimmedSerial || null,
        notes: trimmedNotes || null,
        customerId,
      });
      resetForm();
      setShowModal(false);
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się dodać urządzenia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Baza urządzeń</h1>
          <p className="text-[#94A3B8]">Zarządzanie urządzeniami i historią napraw</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Dodaj urządzenie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Szukaj po nazwie, modelu, numerze seryjnym lub kliencie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
            />
          </div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as 'active' | 'deleted' | 'all')}
            className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
          >
            <option value="active">Aktywne urządzenia</option>
            <option value="deleted">Usunięte urządzenia</option>
            <option value="all">Wszystkie urządzenia</option>
          </select>
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <div
            key={device.id}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('device-detail', device.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onNavigate('device-detail', device.id);
              }
            }}
            className={`bg-[#0C1222] rounded-xl p-6 border shadow-lg hover:border-[#00FF88] transition-all text-left group ${
              device.isDeleted ? 'border-[#FF6B35]/40 opacity-75' : 'border-[#1A2642]'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-lg flex items-center justify-center text-white">
                {getDeviceIcon()}
              </div>
              {device.isDeleted && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-2 py-1 text-xs text-[#FF6B35]">
                  <Trash2 className="w-3 h-3" />
                  Usunięte
                </span>
              )}
            </div>
            <h3 className="text-white mb-1 group-hover:text-[#00FF88] transition-colors">
              {device.name} {device.model ?? ''}
            </h3>
            <p className="text-[#64748B] text-sm mb-4">SN: {device.serial ?? '—'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
              <p className="text-[#94A3B8] text-sm">{device.customerName}</p>
              <span className="text-[#64748B] text-xs">Naprawy: {device.tickets}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center text-[#94A3B8] border border-dashed border-[#1A2642] rounded-xl p-8">
          Brak urządzeń spełniających kryteria.
        </div>
      )}

      {/* Add Device Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Dodaj urządzenie</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Nazwa urządzenia</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="np. MacBook Pro"
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
                    disabled={isSubmitting}
                    placeholder="16'' 2023"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Numer seryjny</label>
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="SN..."
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Klient</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                >
                  <option value="">Wybierz klienta</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Notatki (opcjonalnie)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Opis stanu, akcesoria..."
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
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {isSubmitting ? 'Dodawanie...' : 'Dodaj urządzenie'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
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
