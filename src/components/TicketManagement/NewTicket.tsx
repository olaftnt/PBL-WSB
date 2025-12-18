'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Save, User, Smartphone, Plus, Search } from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Device = {
  id: string;
  customerId: string;
  name: string;
  serial?: string | null;
  model?: string | null;
  notes?: string | null;
};

type PrismaPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
type PrismaSlaType = 'STANDARD' | 'EXPRESS' | 'VIP' | 'WARRANTY';

export type CreateCustomerPayload = {
  name: string;
  email?: string | null;
  phone: string; // wymagane
};

export type CreateDevicePayload = {
  customerId: string;
  name: string;
  model?: string | null;
  serial?: string | null;
  notes?: string | null;
};

interface NewTicketProps {
  customers: Customer[];
  devices: Device[];

  onCreate: (payload: {
    customerId: string;
    deviceId?: string | null;
    title: string;
    description?: string | null;
    priority: PrismaPriority;
    slaType: PrismaSlaType;
    physicalCondition?: string | null;
    accessories: string[];
  }) => Promise<any>;

  // szybkie tworzenie w trakcie
  onCreateCustomer: (payload: CreateCustomerPayload) => Promise<Customer>;
  onCreateDevice: (payload: CreateDevicePayload) => Promise<Device>;

  onCancel: () => void;
  onCreated: () => void;
}

export function NewTicket({
  customers,
  devices,
  onCreate,
  onCreateCustomer,
  onCreateDevice,
  onCancel,
  onCreated,
}: NewTicketProps) {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // lokalne listy (żeby po quick-create od razu było w UI)
  const [customersState, setCustomersState] = useState<Customer[]>(customers);
  const [devicesState, setDevicesState] = useState<Device[]>(devices);

  // quick-create modale
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [showQuickDevice, setShowQuickDevice] = useState(false);

  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [creatingDevice, setCreatingDevice] = useState(false);

  const [newCustomer, setNewCustomer] = useState<{ name: string; email: string; phone: string }>({
    name: '',
    email: '',
    phone: '',
  });

  const [newDevice, setNewDevice] = useState<{ name: string; model: string; serial: string; notes: string }>({
    name: '',
    model: '',
    serial: '',
    notes: '',
  });

  const [formData, setFormData] = useState({
    priorityUi: 'medium' as 'low' | 'medium' | 'high',
    slaTypeUi: 'standard' as 'standard' | 'express' | 'vip' | 'warranty',
    issueDescription: '',
    physicalCondition: '',
    accessories: [] as string[],
  });

  const accessoryOptions = ['Charger', 'Case', 'Box', 'Cable', 'Headphones', 'Manual'];

  const devicesForCustomer = useMemo(() => {
    if (!selectedCustomer) return devicesState;
    return devicesState.filter((d) => d.customerId === selectedCustomer.id);
  }, [devicesState, selectedCustomer]);

  const mapPriorityToPrisma = (p: 'low' | 'medium' | 'high'): PrismaPriority => {
    if (p === 'low') return 'LOW';
    if (p === 'high') return 'HIGH';
    return 'NORMAL';
  };

  const mapSlaToPrisma = (sla: 'standard' | 'express' | 'vip' | 'warranty'): PrismaSlaType => {
    switch (sla) {
      case 'express':
        return 'EXPRESS';
      case 'vip':
        return 'VIP';
      case 'warranty':
        return 'WARRANTY';
      default:
        return 'STANDARD';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedDevice) return;

    setSubmitting(true);
    try {
      const title = `Serwis: ${selectedDevice.name}`;

      await onCreate({
        customerId: selectedCustomer.id,
        deviceId: selectedDevice.id,
        title,
        description: formData.issueDescription?.trim() || null,
        priority: mapPriorityToPrisma(formData.priorityUi),
        slaType: mapSlaToPrisma(formData.slaTypeUi),
        physicalCondition: formData.physicalCondition?.trim() || null,
        accessories: formData.accessories,
      });

      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuickCustomer = () => setNewCustomer({ name: '', email: '', phone: '' });
  const resetQuickDevice = () => setNewDevice({ name: '', model: '', serial: '', notes: '' });

  const submitQuickCustomer = async () => {
    const name = newCustomer.name.trim();
    const email = newCustomer.email.trim();
    const phone = newCustomer.phone.trim();

    if (!name) {
      alert('Podaj nazwę klienta.');
      return;
    }
    if (!phone) {
      alert('Telefon jest wymagany.');
      return;
    }

    setCreatingCustomer(true);
    try {
      const created = await onCreateCustomer({
        name,
        email: email || null,
        phone, // wymagane string
      });

      setCustomersState((prev) => [created, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCustomer(created);
      setSelectedDevice(null);

      setShowQuickCustomer(false);
      setShowCustomerModal(false);
      resetQuickCustomer();
    } finally {
      setCreatingCustomer(false);
    }
  };

  const submitQuickDevice = async () => {
    if (!selectedCustomer) {
      alert('Najpierw wybierz klienta.');
      return;
    }

    const name = newDevice.name.trim();
    const model = newDevice.model.trim();
    const serial = newDevice.serial.trim();
    const notes = newDevice.notes.trim();

    if (!name) {
      alert('Podaj nazwę urządzenia.');
      return;
    }

    setCreatingDevice(true);
    try {
      const created = await onCreateDevice({
        customerId: selectedCustomer.id,
        name,
        model: model || null,
        serial: serial || null,
        notes: notes || null,
      });

      setDevicesState((prev) => [created, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedDevice(created);

      setShowQuickDevice(false);
      setShowDeviceModal(false);
      resetQuickDevice();
    } finally {
      setCreatingDevice(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">Nowe zgłoszenie</h1>
            <p className="text-[#94A3B8]">Tworzenie zgłoszenia serwisowego</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[#64748B] text-sm">Numer zgłoszenia</p>
          <p className="text-[#00FF88]">INC… (po utworzeniu)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#00D9FF]" />
                Klient
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors flex items-center gap-2 text-sm"
                >
                  {selectedCustomer ? 'Zmień' : 'Wybierz'}
                  <Search className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetQuickCustomer();
                    setShowQuickCustomer(true);
                    setShowCustomerModal(true);
                  }}
                  className="px-4 py-2 bg-[#00FF88]/10 border border-[#00FF88] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/20 transition-colors flex items-center gap-2 text-sm"
                >
                  Dodaj
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedCustomer ? (
              <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
                <p className="text-white mb-2">{selectedCustomer.name}</p>
                <p className="text-[#94A3B8] text-sm mb-1">{selectedCustomer.email ?? '—'}</p>
                <p className="text-[#94A3B8] text-sm">{selectedCustomer.phone ?? '—'}</p>
              </div>
            ) : (
              <div className="bg-[#121B2D] rounded-lg p-6 border border-[#1A2642] border-dashed text-center">
                <User className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#94A3B8]">Nie wybrano klienta</p>
              </div>
            )}
          </div>

          {/* Device */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#A78BFA]" />
                Urządzenie
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(true)}
                  className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedCustomer}
                  title={!selectedCustomer ? 'Najpierw wybierz klienta' : undefined}
                >
                  {selectedDevice ? 'Zmień' : 'Wybierz'}
                  <Search className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedCustomer) return;
                    resetQuickDevice();
                    setShowQuickDevice(true);
                    setShowDeviceModal(true);
                  }}
                  className="px-4 py-2 bg-[#00FF88]/10 border border-[#00FF88] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/20 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedCustomer}
                  title={!selectedCustomer ? 'Najpierw wybierz klienta' : undefined}
                >
                  Dodaj
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedDevice ? (
              <div className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-10 h-10 text-[#A78BFA] mt-1" />
                  <div className="flex-1">
                    <p className="text-white mb-1">{selectedDevice.name}</p>
                    <p className="text-[#94A3B8] text-sm mb-1">Model: {selectedDevice.model ?? '—'}</p>
                    <p className="text-[#64748B] text-sm">Serial: {selectedDevice.serial ?? '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#121B2D] rounded-lg p-6 border border-[#1A2642] border-dashed text-center">
                <Smartphone className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#94A3B8]">Nie wybrano urządzenia</p>
              </div>
            )}
          </div>

          {/* Issue */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Opis problemu</h3>
            <textarea
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              placeholder="Opisz usterkę..."
              rows={5}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
              required
            />
          </div>

          {/* Physical */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Stan fizyczny (opcjonalnie)</h3>
            <textarea
              value={formData.physicalCondition}
              onChange={(e) => setFormData({ ...formData, physicalCondition: e.target.value })}
              placeholder="Rysy, pęknięcia, brakujące elementy..."
              rows={4}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
            />
          </div>

          {/* Accessories */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Akcesoria</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {accessoryOptions.map((accessory) => (
                <label
                  key={accessory}
                  className="flex items-center gap-2 px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg cursor-pointer hover:border-[#00FF88] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.accessories.includes(accessory)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, accessories: [...formData.accessories, accessory] });
                      } else {
                        setFormData({
                          ...formData,
                          accessories: formData.accessories.filter((a) => a !== accessory),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-[#1A2642] bg-[#121B2D]"
                  />
                  <span className="text-[#94A3B8]">{accessory}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Priority */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Priorytet</h3>
            <div className="space-y-2">
              {[
                { value: 'low', label: 'Niski', color: 'from-[#00D9FF] to-[#0099CC]' },
                { value: 'medium', label: 'Normalny', color: 'from-[#FFB800] to-[#CC9400]' },
                { value: 'high', label: 'Wysoki', color: 'from-[#FF6B35] to-[#CC5529]' },
              ].map((priority) => (
                <label
                  key={priority.value}
                  className={`block px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    formData.priorityUi === priority.value
                      ? `bg-gradient-to-r ${priority.color}`
                      : 'bg-[#121B2D] border border-[#1A2642] hover:border-[#00FF88]'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priorityUi === (priority.value as any)}
                    onChange={(e) => setFormData({ ...formData, priorityUi: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className={formData.priorityUi === priority.value ? 'text-white' : 'text-[#94A3B8]'}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* SLA */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">SLA</h3>
            <div className="space-y-2">
              {[
                { value: 'standard', label: 'Standard', time: '3-5 dni' },
                { value: 'express', label: 'Express', time: '24h' },
                { value: 'vip', label: 'VIP', time: '12h' },
                { value: 'warranty', label: 'Gwarancja', time: '5-7 dni' },
              ].map((sla) => (
                <label
                  key={sla.value}
                  className={`block px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    formData.slaTypeUi === sla.value
                      ? 'bg-[#00FF88]/10 border border-[#00FF88]'
                      : 'bg-[#121B2D] border border-[#1A2642] hover:border-[#00FF88]'
                  }`}
                >
                  <input
                    type="radio"
                    name="slaType"
                    value={sla.value}
                    checked={formData.slaTypeUi === (sla.value as any)}
                    onChange={(e) => setFormData({ ...formData, slaTypeUi: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <span className={formData.slaTypeUi === sla.value ? 'text-[#00FF88]' : 'text-[#94A3B8]'}>
                      {sla.label}
                    </span>
                    <span className="text-[#64748B] text-sm">{sla.time}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedCustomer || !selectedDevice || submitting}
            className="w-full py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-5 h-5" />
            {submitting ? 'Tworzenie…' : 'Utwórz zgłoszenie'}
          </button>
        </div>
      </form>

      {/* CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Wybierz klienta</h3>
              <button type="button" onClick={() => setShowCustomerModal(false)} className="text-[#94A3B8] hover:text-white">
                ✕
              </button>
            </div>

            {showQuickCustomer ? (
              <div className="mb-6 p-4 rounded-xl border border-[#00FF88]/30 bg-[#00FF88]/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-medium">Szybkie dodanie klienta</div>
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomer(false)}
                    className="text-[#94A3B8] hover:text-white text-sm"
                  >
                    Zamknij
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Imię i nazwisko / firma"
                    className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                  <input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Telefon (wymagany)"
                    className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                  <input
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email (opcjonalnie)"
                    className="md:col-span-2 px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={creatingCustomer}
                    onClick={submitQuickCustomer}
                    className="px-4 py-2 rounded-lg bg-[#00FF88] text-[#0C1222] font-medium disabled:opacity-60"
                  >
                    {creatingCustomer ? 'Dodawanie…' : 'Dodaj klienta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetQuickCustomer();
                      setShowQuickCustomer(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              {customersState.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setSelectedDevice(null);
                    setShowCustomerModal(false);
                  }}
                  className="w-full p-4 bg-[#121B2D] border border-[#1A2642] rounded-lg hover:border-[#00FF88] transition-colors text-left"
                >
                  <p className="text-white mb-1">{customer.name}</p>
                  <p className="text-[#94A3B8] text-sm">{customer.email ?? '—'}</p>
                  <p className="text-[#64748B] text-sm">{customer.phone ?? '—'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEVICE MODAL */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Wybierz urządzenie</h3>
              <button type="button" onClick={() => setShowDeviceModal(false)} className="text-[#94A3B8] hover:text-white">
                ✕
              </button>
            </div>

            {showQuickDevice ? (
              <div className="mb-6 p-4 rounded-xl border border-[#00FF88]/30 bg-[#00FF88]/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-medium">Szybkie dodanie urządzenia</div>
                  <button
                    type="button"
                    onClick={() => setShowQuickDevice(false)}
                    className="text-[#94A3B8] hover:text-white text-sm"
                  >
                    Zamknij
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={newDevice.name}
                    onChange={(e) => setNewDevice((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nazwa urządzenia (np. iPhone 14 Pro)"
                    className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                  <input
                    value={newDevice.model}
                    onChange={(e) => setNewDevice((p) => ({ ...p, model: e.target.value }))}
                    placeholder="Model (opcjonalnie)"
                    className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                  <input
                    value={newDevice.serial}
                    onChange={(e) => setNewDevice((p) => ({ ...p, serial: e.target.value }))}
                    placeholder="Numer seryjny (opcjonalnie)"
                    className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                  <input
                    value={newDevice.notes}
                    onChange={(e) => setNewDevice((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Notatki (opcjonalnie)"
                    className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={creatingDevice || !selectedCustomer}
                    onClick={submitQuickDevice}
                    className="px-4 py-2 rounded-lg bg-[#00FF88] text-[#0C1222] font-medium disabled:opacity-60"
                  >
                    {creatingDevice ? 'Dodawanie…' : 'Dodaj urządzenie'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetQuickDevice();
                      setShowQuickDevice(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              {devicesForCustomer.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => {
                    setSelectedDevice(device);
                    setShowDeviceModal(false);
                  }}
                  className="w-full p-4 bg-[#121B2D] border border-[#1A2642] rounded-lg hover:border-[#00FF88] transition-colors text-left flex items-start gap-3"
                >
                  <Smartphone className="w-8 h-8 text-[#A78BFA] mt-1" />
                  <div>
                    <p className="text-white mb-1">{device.name}</p>
                    <p className="text-[#94A3B8] text-sm mb-1">Model: {device.model ?? '—'}</p>
                    <p className="text-[#64748B] text-sm">Serial: {device.serial ?? '—'}</p>
                  </div>
                </button>
              ))}

              {selectedCustomer ? null : (
                <div className="text-sm text-[#94A3B8]">Najpierw wybierz klienta.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
