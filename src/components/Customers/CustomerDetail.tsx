import { ArrowLeft, Mail, Phone, MapPin, Edit, Ticket, Smartphone } from 'lucide-react';
import type { View } from '@/types/view';

interface CustomerDetailProps {
  customerId: string;
  onNavigate: (view: View, id?: string) => void;
}

export function CustomerDetail({ customerId, onNavigate }: CustomerDetailProps) {
  const customer = {
    id: customerId,
    name: 'John Smith',
    email: 'john@email.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, New York, NY 10001',
    joined: '2024-01-15',
    totalTickets: 5,
    activeTickets: 1,
  };

  const tickets = [
    { id: 'TK-2024-1247', device: 'MacBook Pro 16"', status: 'diagnosis', created: '2024-12-09', priority: 'high' },
    { id: 'TK-2024-0892', device: 'MacBook Pro 16"', status: 'delivered', created: '2024-08-15', priority: 'medium' },
    { id: 'TK-2024-0234', device: 'iPhone 13 Pro', status: 'delivered', created: '2024-03-20', priority: 'low' },
  ];

  const devices = [
    { id: '1', type: 'laptop', brand: 'Apple', model: 'MacBook Pro 16"', serial: 'C02XL12345' },
    { id: '2', type: 'phone', brand: 'Apple', model: 'iPhone 13 Pro', serial: 'FFJK12345' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diagnosis': return 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20';
      case 'repair': return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20';
      case 'delivered': return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20';
      default: return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('customers')}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00D9FF] to-[#0099CC] rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-white text-2xl mb-1">{customer.name}</h1>
              <p className="text-[#94A3B8]">Customer since {customer.joined}</p>
            </div>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#00D9FF] mt-0.5" />
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Email</p>
                  <p className="text-white">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#00FF88] mt-0.5" />
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Phone</p>
                  <p className="text-white">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF6B35] mt-0.5" />
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Address</p>
                  <p className="text-white">{customer.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Total Tickets</p>
                <p className="text-white text-2xl">{customer.totalTickets}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Active Tickets</p>
                <p className="text-[#00FF88] text-2xl">{customer.activeTickets}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-sm mb-1">Registered Devices</p>
                <p className="text-white text-2xl">{devices.length}</p>
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
                Ticket History
              </h3>
              <button
                onClick={() => onNavigate('new-ticket')}
                className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform text-sm"
              >
                New Ticket
              </button>
            </div>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => onNavigate('ticket-detail', ticket.id)}
                  className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">{ticket.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-1">{ticket.device}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-xs">{ticket.created}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.priority === 'high' ? 'bg-[#FF6B35]' :
                        ticket.priority === 'medium' ? 'bg-[#FFB800]' : 'bg-[#00D9FF]'
                      }`}></div>
                      <span className="text-[#64748B] text-xs capitalize">{ticket.priority}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#A78BFA]" />
                Registered Devices
              </h3>
              <button
                onClick={() => onNavigate('devices')}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors text-sm"
              >
                Add Device
              </button>
            </div>
            <div className="space-y-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => onNavigate('device-detail', device.id)}
                  className="w-full bg-[#121B2D] rounded-lg p-4 border border-[#1A2642] hover:border-[#00FF88] transition-all text-left flex items-start gap-3"
                >
                  <Smartphone className="w-10 h-10 text-[#A78BFA] mt-1" />
                  <div className="flex-1">
                    <p className="text-white mb-1">{device.brand} {device.model}</p>
                    <p className="text-[#94A3B8] text-sm mb-1">Type: <span className="capitalize">{device.type}</span></p>
                    <p className="text-[#64748B] text-sm">Serial: {device.serial}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
