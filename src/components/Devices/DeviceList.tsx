import { useState } from 'react';
import { Plus, Search, Laptop, Smartphone, Monitor, Gamepad2 } from 'lucide-react';
import type { View } from '@/types/view';

interface DeviceListProps {
  onNavigate: (view: View, id?: string) => void;
}

const mockDevices = [
  { id: '1', type: 'laptop', brand: 'Apple', model: 'MacBook Pro 16"', serial: 'C02XL12345', customer: 'John Smith', tickets: 3 },
  { id: '2', type: 'telefon', brand: 'Apple', model: 'iPhone 14 Pro', serial: 'FFJK12345', customer: 'Sarah Johnson', tickets: 2 },
  { id: '3', type: 'laptop', brand: 'Dell', model: 'XPS 15', serial: 'DL12345678', customer: 'Mike Wilson', tickets: 1 },
  { id: '4', type: 'telefon', brand: 'Samsung', model: 'Galaxy S23', serial: 'SM98765432', customer: 'Emma Davis', tickets: 2 },
  { id: '5', type: 'laptop', brand: 'HP', model: 'Pavilion', serial: 'HP11223344', customer: 'Robert Brown', tickets: 3 },
  { id: '6', type: 'konsola', brand: 'Sony', model: 'PlayStation 5', serial: 'PS567890123', customer: 'Lisa Anderson', tickets: 1 },
  { id: '7', type: 'pc', brand: 'Apple', model: 'iMac 27"', serial: 'IM87654321', customer: 'Tom Martinez', tickets: 1 },
  { id: '8', type: 'telefon', brand: 'Google', model: 'Pixel 8', serial: 'GP12345678', customer: 'Alice Cooper', tickets: 2 },
];

const deviceTypes = [
  { id: 'all', label: 'Wszystkie urządzenia', icon: Smartphone },
  { id: 'laptop', label: 'Laptops', icon: Laptop },
  { id: 'telefon', label: 'Telefony', icon: Smartphone },
  { id: 'pc', label: 'Komputery', icon: Monitor },
  { id: 'konsola', label: 'Konsole', icon: Gamepad2 },
];

export function DeviceList({ onNavigate }: DeviceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-6 h-6" />;
      case 'telefon': return <Smartphone className="w-6 h-6" />;
      case 'pc': return <Monitor className="w-6 h-6" />;
      case 'konsola': return <Gamepad2 className="w-6 h-6" />;
      default: return <Smartphone className="w-6 h-6" />;
    }
  };

  const filteredDevices = mockDevices.filter(device => 
    (typeFilter === 'all' || device.type === typeFilter) &&
    (searchQuery === '' || 
      device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.customer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Baza urządzeń</h1>
          <p className="text-[#94A3B8]">Zarządzanie urządzeniami i historią napraw</p>
        </div>
        <button
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Dodaj urządzenie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search by brand, model, serial, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1A2642]">
          {deviceTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  typeFilter === type.id
                    ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]'
                    : 'bg-[#121B2D] text-[#94A3B8] border border-[#1A2642] hover:border-[#00FF88]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <button
            key={device.id}
            onClick={() => onNavigate('device-detail', device.id)}
            className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg hover:border-[#00FF88] transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-lg flex items-center justify-center text-white">
                {getDeviceIcon(device.type)}
              </div>
              <span className="px-2 py-1 rounded text-xs bg-[#121B2D] text-[#94A3B8] border border-[#1A2642] capitalize">
                {device.type}
              </span>
            </div>
            <h3 className="text-white mb-1 group-hover:text-[#00FF88] transition-colors">
              {device.brand} {device.model}
            </h3>
            <p className="text-[#64748B] text-sm mb-4">SN: {device.serial}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
              <p className="text-[#94A3B8] text-sm">{device.customer}</p>
              <span className="text-[#64748B] text-xs">{device.tickets} repairs</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
