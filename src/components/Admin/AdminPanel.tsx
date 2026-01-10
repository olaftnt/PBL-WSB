'use client';

import { useState } from 'react';
import { 
  Users, 
  Shield, 
  Clock, 
  Bell, 
  BarChart3, 
  Settings,
  Plus,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'sla' | 'notifications' | 'analytics'>('users');

  const users = [
    { id: '1', name: 'Admin User', email: 'admin@itsm.com', role: 'admin', status: 'active', lastActive: '2024-12-09 15:30' },
    { id: '2', name: 'Tech Mike', email: 'mike@itsm.com', role: 'technician', status: 'active', lastActive: '2024-12-09 15:25' },
    { id: '3', name: 'Warehouse Sam', email: 'sam@itsm.com', role: 'warehouse', status: 'active', lastActive: '2024-12-09 14:00' },
    { id: '4', name: 'Receptionist Anna', email: 'anna@itsm.com', role: 'receptionist', status: 'active', lastActive: '2024-12-09 15:20' },
  ];

  const roles = [
    { name: 'Admin', users: 1, permissions: ['all'], color: 'from-[#FF6B35] to-[#CC5529]' },
    { name: 'Technician', users: 5, permissions: ['tickets', 'devices', 'quotes', 'inventory'], color: 'from-[#00D9FF] to-[#0099CC]' },
    { name: 'Warehouse', users: 2, permissions: ['inventory', 'tickets-view'], color: 'from-[#A78BFA] to-[#8B5CF6]' },
    { name: 'Receptionist', users: 3, permissions: ['tickets-view', 'customers-view', 'devices-view'], color: 'from-[#FFB800] to-[#CC9400]' },
  ];

  const slaConfigs = [
    { name: 'VIP', duration: '12 hours', active: true, color: 'text-[#A78BFA]' },
    { name: 'Express', duration: '24 hours', active: true, color: 'text-[#00D9FF]' },
    { name: 'Standard', duration: '3-5 days', active: true, color: 'text-[#00FF88]' },
    { name: 'Warranty', duration: '5-7 days', active: true, color: 'text-[#FFB800]' },
  ];

  const analytics = [
    { label: 'Naprawy (dziennie)', value: '15', change: '+12%', icon: BarChart3, color: 'from-[#00FF88] to-[#00CC6A]' },
    { label: 'Naprawy (miesięcznie)', value: '342', change: '+8%', icon: BarChart3, color: 'from-[#00D9FF] to-[#0099CC]' },
    { label: 'Średni czas naprawy', value: '4.2h', change: '-5%', icon: Clock, color: 'from-[#A78BFA] to-[#8B5CF6]' },
    { label: 'Satysfakcja klienta', value: '94%', change: '+3%', icon: TrendingUp, color: 'from-[#FFB800] to-[#CC9400]' },
  ];

  const mostUsedParts = [
    { name: 'Ekran iPhone 14 Pro', uses: 45, trend: 'up' },
    { name: 'Bateria MacBook', uses: 32, trend: 'up' },
    { name: 'Ekran Samsung', uses: 28, trend: 'down' },
    { name: 'Ładowarka USB-C', uses: 24, trend: 'up' },
  ];

  const tabs = [
    { id: 'users' as const, label: 'Zarządzanie użytkownikami', icon: Users },
    { id: 'roles' as const, label: 'Role i dostęp', icon: Shield },
    { id: 'sla' as const, label: 'Konfiguracja SLA', icon: Clock },
    { id: 'notifications' as const, label: 'Powiadomienia', icon: Bell },
    { id: 'analytics' as const, label: 'Analityka', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl mb-1">Panel Administratora</h1>
        <p className="text-[#94A3B8]">Konfiguracja systemu i zarządzanie</p>
      </div>

      {/* Tabs */}
      <div className="bg-[#0C1222] rounded-xl p-2 border border-[#1A2642] shadow-lg">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]'
                    : 'text-[#94A3B8] hover:bg-[#121B2D]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white">Zarządzanie użytkownikami</h2>
            <button className="px-4 py-2 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Dodaj użytkownika
            </button>
          </div>
          <div className="bg-[#0C1222] rounded-xl border border-[#1A2642] shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A2642]">
                  <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Imię</th>
                  <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Email</th>
                  <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Rola</th>
                  <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Status</th>
                  <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Ostatnio aktywny</th>
                  <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#1A2642] hover:bg-[#121B2D] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8]">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/20 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{user.lastActive}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-[#94A3B8] hover:text-[#00FF88] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#94A3B8] hover:text-[#FF6B35] transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <h2 className="text-white">Role i kontrola dostępu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.name} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <button className="p-2 text-[#94A3B8] hover:text-[#00FF88] transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-white mb-2">{role.name}</h3>
                <p className="text-[#64748B] text-sm mb-4">Przypisanych użytkowników: {role.users}</p>
                <div>
                  <p className="text-[#94A3B8] text-sm mb-2">Uprawnienia:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm, index) => (
                      <span key={index} className="px-2 py-1 rounded text-xs bg-[#121B2D] text-[#94A3B8] border border-[#1A2642]">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="space-y-6">
          <h2 className="text-white">Konfiguracja SLA</h2>
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="space-y-4">
              {slaConfigs.map((sla) => (
                <div key={sla.name} className="bg-[#121B2D] rounded-lg p-6 border border-[#1A2642]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock className={`w-8 h-8 ${sla.color}`} />
                      <div>
                        <h3 className="text-white mb-1">{sla.name}</h3>
                        <p className="text-[#94A3B8] text-sm">{sla.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={sla.active} readOnly className="w-5 h-5" />
                        <span className="text-[#94A3B8] text-sm">Aktywny</span>
                      </label>
                      <button className="px-4 py-2 bg-[#0C1222] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors">
                        Edytuj
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <h2 className="text-white">Ustawienia powiadomień</h2>
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="space-y-6">
              {[
                { title: 'Powiadomienia Email', description: 'Wysyłaj aktualizacje e-mail do klientów i pracowników' },
                { title: 'Powiadomienia SMS', description: 'Wysyłaj alerty SMS o ważnych aktualizacjach' },
                { title: 'Ostrzeżenia SLA', description: 'Alertuj, gdy zgłoszenia zbliżają się do terminów' },
                { title: 'Alerty o niskim stanie zapasów', description: 'Powiadamiaj, gdy kończą się części w magazynie' },
                { title: 'Alerty o nowych zgłoszeniach', description: 'Powiadamiaj personel o utworzeniu nowych zgłoszeń' },
              ].map((setting, index) => (
                <div key={index} className="flex items-start justify-between py-4 border-b border-[#1A2642] last:border-0">
                  <div>
                    <h4 className="text-white mb-1">{setting.title}</h4>
                    <p className="text-[#94A3B8] text-sm">{setting.description}</p>
                  </div>
                  <label className="relative inline-block w-14 h-8">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-8 bg-[#121B2D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00FF88]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-white">Analityka systemowa</h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[#00FF88] text-sm">{stat.change}</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-2">{stat.label}</p>
                  <p className="text-white text-3xl">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Most Used Parts */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-6">Najczęściej używane części (w tym miesiącu)</h3>
            <div className="space-y-4">
              {mostUsedParts.map((part, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[#64748B]">#{index + 1}</span>
                    <div>
                      <p className="text-white">{part.name}</p>
                      <p className="text-[#64748B] text-sm">{part.uses} użyć</p>
                    </div>
                  </div>
                  <TrendingUp className={`w-5 h-5 ${part.trend === 'up' ? 'text-[#00FF88]' : 'text-[#FF6B35] rotate-180'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-6">Miesięczna wydajność</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#1A2642] rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#94A3B8]">Wizualizacja wykresu pojawi się tutaj</p>
                <p className="text-[#64748B] text-sm">(Użyj biblioteki recharts do wdrożenia)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
