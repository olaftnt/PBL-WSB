import { ArrowLeft, Laptop, User, Ticket, History, Edit } from 'lucide-react';
import type { View } from '@/types/view';

interface DeviceDetailProps {
  deviceId: string;
  onNavigate: (view: View, id?: string) => void;
}

export function DeviceDetail({ deviceId, onNavigate }: DeviceDetailProps) {
  const device = {
    id: deviceId,
    type: 'laptop',
    brand: 'Apple',
    model: 'MacBook Pro 16"',
    serial: 'C02XL12345',
    customer: { id: '1', name: 'John Smith', email: 'john@email.com' },
    purchaseDate: '2022-05-15',
    warranty: 'Active until 2025-05-15',
    notes: 'Customer preference for original parts only.',
  };

  const repairHistory = [
    { id: 'TK-2024-1247', date: '2024-12-09', issue: 'Screen replacement', status: 'diagnosis', cost: 'TBD' },
    { id: 'TK-2024-0892', date: '2024-08-15', issue: 'Battery replacement', status: 'completed', cost: '$199.00' },
    { id: 'TK-2024-0234', date: '2024-03-20', issue: 'Keyboard cleaning', status: 'completed', cost: '$49.00' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diagnosis': return 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20';
      case 'completed': return 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20';
      default: return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('devices')}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white">
              <Laptop className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white text-2xl mb-1">{device.brand} {device.model}</h1>
              <p className="text-[#94A3B8]">Serial: {device.serial}</p>
            </div>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Device
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Information */}
        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Device Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Type</p>
                <p className="text-white capitalize">{device.type}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Brand</p>
                <p className="text-white">{device.brand}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Model</p>
                <p className="text-white">{device.model}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Serial Number</p>
                <p className="text-white">{device.serial}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Purchase Date</p>
                <p className="text-white">{device.purchaseDate}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Warranty Status</p>
                <p className="text-[#00FF88]">{device.warranty}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00D9FF]" />
              Owner
            </h3>
            <button
              onClick={() => onNavigate('customer-detail', device.customer.id)}
              className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
            >
              <p className="text-white mb-1">{device.customer.name}</p>
              <p className="text-[#94A3B8] text-sm">{device.customer.email}</p>
            </button>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Notes</h3>
            <p className="text-[#94A3B8] text-sm">{device.notes}</p>
          </div>
        </div>

        {/* Repair History */}
        <div className="lg:col-span-2">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#FFB800]" />
                Full Repair History
              </h3>
              <button
                onClick={() => onNavigate('new-ticket')}
                className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform text-sm"
              >
                New Repair
              </button>
            </div>
            <div className="space-y-4">
              {repairHistory.map((repair) => (
                <button
                  key={repair.id}
                  onClick={() => onNavigate('ticket-detail', repair.id)}
                  className="w-full bg-[#121B2D] rounded-lg p-6 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-[#00FF88]" />
                      <span className="text-white">{repair.id}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(repair.status)}`}>
                      {repair.status}
                    </span>
                  </div>
                  <h4 className="text-white mb-2">{repair.issue}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">{repair.date}</span>
                    <span className="text-[#00FF88]">{repair.cost}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#1A2642]">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Total Repairs</span>
                <span className="text-white">{repairHistory.length}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[#94A3B8]">Total Spent</span>
                <span className="text-[#00FF88]">$248.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
