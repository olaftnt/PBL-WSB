'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Save,
  User,
  Smartphone,
  Plus,
  Search
} from 'lucide-react';

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

  onCancel: () => void;
  onCreated: () => void;
}

export function NewTicket({ customers, devices, onCreate, onCancel, onCreated }: NewTicketProps) {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    priorityUi: 'medium' as 'low' | 'medium' | 'high', // UI values
    slaTypeUi: 'standard' as 'standard' | 'express' | 'vip' | 'warranty',
    issueDescription: '',
    physicalCondition: '',
    accessories: [] as string[],
  });

  const accessoryOptions = ['Charger', 'Case', 'Box', 'Cable', 'Headphones', 'Manual'];

  const devicesForCustomer = useMemo(() => {
    if (!selectedCustomer) return devices;
    return devices.filter((d) => d.customerId === selectedCustomer.id);
  }, [devices, selectedCustomer]);

  const mapPriorityToPrisma = (p: 'low' | 'medium' | 'high'): PrismaPriority => {
    if (p === 'low') return 'LOW';
    if (p === 'high') return 'HIGH';
    return 'NORMAL'; // medium -> NORMAL
  };

  const mapSlaToPrisma = (sla: 'standard' | 'express' | 'vip' | 'warranty'): PrismaSlaType => {
    switch (sla) {
      case 'express': return 'EXPRESS';
      case 'vip': return 'VIP';
      case 'warranty': return 'WARRANTY';
      default: return 'STANDARD';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setSubmitting(true);
    try {
      const title = selectedDevice
        ? `Serwis: ${selectedDevice.name}`
        : 'Serwis: urządzenie klienta';

      await onCreate({
        customerId: selectedCustomer.id,
        deviceId: selectedDevice?.id ?? null,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">New Ticket</h1>
            <p className="text-[#94A3B8]">Create device intake ticket</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#64748B] text-sm">Ticket ID</p>
          <p className="text-[#00FF88]">Auto (Prisma)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#00D9FF]" />
                Customer Information
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors flex items-center gap-2 text-sm"
              >
                {selectedCustomer ? 'Change Customer' : 'Select Customer'}
                <Search className="w-4 h-4" />
              </button>
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
                <p className="text-[#94A3B8]">No customer selected</p>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="mt-3 text-[#00FF88] hover:text-[#00CC6A] text-sm"
                >
                  Select customer
                </button>
              </div>
            )}
          </div>

          {/* Device Selection */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#A78BFA]" />
                Device Information
              </h3>
              <button
                type="button"
                onClick={() => setShowDeviceModal(true)}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors flex items-center gap-2 text-sm"
                disabled={!selectedCustomer}
                title={!selectedCustomer ? 'Select customer first' : undefined}
              >
                {selectedDevice ? 'Change Device' : 'Select Device'}
                <Search className="w-4 h-4" />
              </button>
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
                <p className="text-[#94A3B8]">No device selected</p>
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(true)}
                  className="mt-3 text-[#00FF88] hover:text-[#00CC6A] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedCustomer}
                >
                  Select device
                </button>
              </div>
            )}
          </div>

          {/* Issue Description */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Issue Description</h3>
            <textarea
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              placeholder="Describe the issue with the device..."
              rows={5}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
              required
            />
          </div>

          {/* Physical Condition */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Physical Condition Notes</h3>
            <textarea
              value={formData.physicalCondition}
              onChange={(e) => setFormData({ ...formData, physicalCondition: e.target.value })}
              placeholder="Note any scratches, dents, or physical damage..."
              rows={4}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
            />
          </div>

          {/* Accessories */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Included Accessories</h3>
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
            <h3 className="text-white mb-4">Priority Level</h3>
            <div className="space-y-2">
              {[
                { value: 'low', label: 'Low', color: 'from-[#00D9FF] to-[#0099CC]' },
                { value: 'medium', label: 'Medium', color: 'from-[#FFB800] to-[#CC9400]' },
                { value: 'high', label: 'High', color: 'from-[#FF6B35] to-[#CC5529]' },
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

          {/* SLA Type */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">SLA Type</h3>
            <div className="space-y-2">
              {[
                { value: 'standard', label: 'Standard', time: '3-5 days' },
                { value: 'express', label: 'Express', time: '24 hours' },
                { value: 'vip', label: 'VIP', time: '12 hours' },
                { value: 'warranty', label: 'Warranty', time: '5-7 days' },
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
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </form>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Select Customer</h3>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {customers.map((customer) => (
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
              <button
                type="button"
                className="w-full p-4 bg-[#00FF88]/10 border border-[#00FF88] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/20 transition-colors flex items-center justify-center gap-2"
                onClick={() => alert('Dodawanie klienta: do zrobienia (Customers CRUD)')}
              >
                <Plus className="w-5 h-5" />
                Add New Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Select Device</h3>
              <button
                type="button"
                onClick={() => setShowDeviceModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
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
              <button
                type="button"
                className="w-full p-4 bg-[#00FF88]/10 border border-[#00FF88] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => alert('Dodawanie urządzenia: do zrobienia (Devices CRUD)')}
                disabled={!selectedCustomer}
              >
                <Plus className="w-5 h-5" />
                Add New Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
