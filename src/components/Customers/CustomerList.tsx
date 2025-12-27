'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Mail, Phone, Ticket } from 'lucide-react';
import type { View } from '@/types/view';
import type { CustomerListItem } from '@/types/customer';
import type { CreateCustomerInput } from '@/app/(app)/_actions/customers';

interface CustomerListProps {
  onNavigate: (view: View, id?: string) => void;
  customers: CustomerListItem[];
  onCreateCustomer: (payload: CreateCustomerInput) => Promise<any>;
}

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleDateString('pl-PL');
};

const initials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('');

export function CustomerList({ onNavigate, customers, onCreateCustomer }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(q);
      const emailMatch = (customer.email ?? '').toLowerCase().includes(q);
      const phoneMatch = (customer.phone ?? '').toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [customers, searchQuery]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim() || firstName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!fullName) {
      setError('Imię i nazwisko są wymagane.');
      return;
    }
    if (!trimmedPhone) {
      setError('Telefon jest wymagany.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreateCustomer({
        name: fullName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
      });
      resetForm();
      setShowAddModal(false);
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się dodać klienta.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {filteredCustomers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => onNavigate('customer-detail', customer.id)}
            className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg hover:border-[#00FF88] transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00D9FF] to-[#0099CC] rounded-full flex items-center justify-center">
                <span className="text-white">
                  {initials(customer.name)}
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
                <span className="truncate">{customer.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || '—'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#64748B]" />
                <span className="text-[#94A3B8] text-sm">{customer.tickets} tickets</span>
              </div>
              <span className="text-[#64748B] text-xs">Since {formatDate(customer.joined)}</span>
            </div>
          </button>
        ))}
      </div>
      {filteredCustomers.length === 0 && (
        <div className="text-center text-[#94A3B8] border border-dashed border-[#1A2642] rounded-xl p-8">
          Brak klientów spełniających kryteria wyszukiwania.
        </div>
      )}

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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="john@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Adding...' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
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
