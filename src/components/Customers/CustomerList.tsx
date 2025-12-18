import { useState } from 'react';
import { Plus, Search, Mail, Phone, Ticket } from 'lucide-react';
import type { View } from '@/types/view';

interface CustomerListProps {
  onNavigate: (view: View, id?: string) => void;
}

const mockCustomers = [
  { id: '1', name: 'John Smith', email: 'john@email.com', phone: '+1 234 567 8900', tickets: 5, activeTickets: 1, joined: '2024-01-15' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1 234 567 8901', tickets: 12, activeTickets: 2, joined: '2023-11-20' },
  { id: '3', name: 'Mike Wilson', email: 'mike@email.com', phone: '+1 234 567 8902', tickets: 3, activeTickets: 1, joined: '2024-03-10' },
  { id: '4', name: 'Emma Davis', email: 'emma@email.com', phone: '+1 234 567 8903', tickets: 8, activeTickets: 0, joined: '2023-09-05' },
  { id: '5', name: 'Robert Brown', email: 'robert@email.com', phone: '+1 234 567 8904', tickets: 15, activeTickets: 3, joined: '2023-06-12' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa@email.com', phone: '+1 234 567 8905', tickets: 4, activeTickets: 1, joined: '2024-02-28' },
  { id: '7', name: 'Tom Martinez', email: 'tom@email.com', phone: '+1 234 567 8906', tickets: 6, activeTickets: 0, joined: '2023-12-08' },
  { id: '8', name: 'Alice Cooper', email: 'alice@email.com', phone: '+1 234 567 8907', tickets: 9, activeTickets: 2, joined: '2023-08-17' },
];

export function CustomerList({ onNavigate }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Customer Database</h1>
          <p className="text-[#94A3B8]">Manage customer information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCustomers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => onNavigate('customer-detail', customer.id)}
            className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg hover:border-[#00FF88] transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00D9FF] to-[#0099CC] rounded-full flex items-center justify-center">
                <span className="text-white">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              {customer.activeTickets > 0 && (
                <span className="px-2 py-1 rounded-full text-xs bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">
                  {customer.activeTickets} active
                </span>
              )}
            </div>
            <h3 className="text-white mb-3 group-hover:text-[#00FF88] transition-colors">
              {customer.name}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <Mail className="w-4 h-4" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#64748B]" />
                <span className="text-[#94A3B8] text-sm">{customer.tickets} tickets</span>
              </div>
              <span className="text-[#64748B] text-xs">Since {customer.joined}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Add New Customer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="john@email.com"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Address (Optional)</label>
                <textarea
                  placeholder="Street address..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform"
                >
                  Add Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white transition-colors"
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
