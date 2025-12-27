'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, AlertTriangle, Package, Edit, Minus, BookmarkPlus } from 'lucide-react';
import type { PartListItem, TicketOption } from '@/types/inventory';

type InventoryListProps = {
  parts: PartListItem[];
  tickets: TicketOption[];
  onCreatePart: (payload: { sku: string; name: string; quantity: number; minQuantity: number; price: number; }) => Promise<any>;
  onUpdatePart: (id: string, payload: Partial<{ sku: string; name: string; quantity: number; minQuantity: number; price: number; }>) => Promise<any>;
  onReserve: (partId: string, ticketId: string, quantity: number) => Promise<any>;
  onConsume: (partId: string, quantity: number) => Promise<any>;
};

export function InventoryList({ parts, tickets, onCreatePart, onUpdatePart, onReserve, onConsume }: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartListItem | null>(null);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | string>(0);
  const [minQuantity, setMinQuantity] = useState<number | string>(0);
  const [price, setPrice] = useState<number | string>(0);

  const [reserveTicketId, setReserveTicketId] = useState('');
  const [reserveQty, setReserveQty] = useState<number | string>(1);
  const [consumeQty, setConsumeQty] = useState<number | string>(1);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return { bg: 'bg-[#00FF88]/10', text: 'text-[#00FF88]', border: 'border-[#00FF88]/20', label: 'In Stock' };
      case 'low':
        return { bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', border: 'border-[#FFB800]/20', label: 'Low Stock' };
      case 'critical':
        return { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/20', label: 'Critical' };
      default:
        return { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', border: 'border-[#64748B]/20', label: 'Unknown' };
    }
  };

  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (parts ?? []).filter((part) =>
      !q ||
      part.name.toLowerCase().includes(q) ||
      part.sku.toLowerCase().includes(q)
    );
  }, [parts, searchQuery]);

  const lowStockCount = useMemo(
    () => (parts ?? []).filter((p) => p.status === 'low' || p.status === 'critical').length,
    [parts]
  );

  const openAdd = () => {
    setSku('');
    setName('');
    setQuantity(0);
    setMinQuantity(0);
    setPrice(0);
    setError(null);
    setShowAddModal(true);
  };

  const openEdit = (part: PartListItem) => {
    setSelectedPart(part);
    setSku(part.sku);
    setName(part.name);
    setQuantity(part.quantity);
    setMinQuantity(part.minQuantity);
    setPrice(part.price);
    setError(null);
    setShowEditModal(true);
  };

  const openReserve = (part: PartListItem) => {
    setSelectedPart(part);
    setReserveTicketId(tickets[0]?.id ?? '');
    setReserveQty(1);
    setError(null);
    setShowReserveModal(true);
  };

  const openConsume = (part: PartListItem) => {
    setSelectedPart(part);
    setConsumeQty(1);
    setError(null);
    setShowConsumeModal(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreatePart({
        sku: sku.trim(),
        name: name.trim(),
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        price: Number(price),
      });
      setShowAddModal(false);
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się dodać części.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onUpdatePart(selectedPart.id, {
        sku: sku.trim(),
        name: name.trim(),
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        price: Number(price),
      });
      setShowEditModal(false);
      setSelectedPart(null);
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się zaktualizować części.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReserve = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onReserve(selectedPart.id, reserveTicketId, Number(reserveQty));
      setShowReserveModal(false);
      setSelectedPart(null);
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się zarezerwować części.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsume = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onConsume(selectedPart.id, Number(consumeQty));
      setShowConsumeModal(false);
      setSelectedPart(null);
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się zużyć części.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Inventory & Parts Management</h1>
          <p className="text-[#94A3B8]">Manage repair parts and stock levels</p>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Part
        </button>
      </div>

      {/* Alert */}
      {lowStockCount > 0 && (
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FF6B35] mt-0.5" />
          <div>
            <p className="text-[#FF6B35] mb-1">Low Stock Alert</p>
            <p className="text-[#94A3B8] text-sm">{lowStockCount} parts are running low or out of stock</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
            />
          </div>
        </div>
        <div className="text-[#94A3B8] text-sm">
          {filteredParts.length} parts found
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-[#0C1222] rounded-xl border border-[#1A2642] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A2642]">
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">SKU</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Part Name</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Category</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Quantity</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Min Stock</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Reserved</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Price</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Status</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => {
                const statusBadge = getStatusBadge(part.status);
                return (
                  <tr key={part.id} className="border-b border-[#1A2642] hover:bg-[#121B2D] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{part.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8]">{part.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8] text-sm">{part.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className={`w-4 h-4 ${part.status === 'ok' ? 'text-[#00FF88]' : 'text-[#FF6B35]'}`} />
                        <span className="text-white">{part.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{part.minQuantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{part.reserved}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#00FF88]">${part.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(part)}
                          className="p-2 text-[#94A3B8] hover:text-[#00FF88] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openReserve(part)}
                          className="p-2 text-[#94A3B8] hover:text-[#00D9FF] transition-colors"
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openConsume(part)}
                          className="p-2 text-[#94A3B8] hover:text-[#FF6B35] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Add New Part</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="SCR-IP14-001"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Part Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="iPhone 14 Pro Screen"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Min Quantity</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="5"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="199.99"
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
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
                  {isSubmitting ? 'Adding...' : 'Add Part'}
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

      {/* Edit Modal */}
      {showEditModal && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Edit Part - {selectedPart.name}</h3>
              <button
                onClick={() => { setShowEditModal(false); setSelectedPart(null); }}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Part Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Min Quantity</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
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
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedPart(null); }}
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

      {/* Reserve Modal */}
      {showReserveModal && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Reserve Part - {selectedPart.name}</h3>
              <button onClick={() => { setShowReserveModal(false); setSelectedPart(null); }} className="text-[#94A3B8] hover:text-white">✕</button>
            </div>
            <form className="space-y-4" onSubmit={handleReserve}>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Ticket</label>
                <select
                  value={reserveTicketId}
                  onChange={(e) => setReserveTicketId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                >
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number} {t.title ? `— ${t.title}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Quantity to reserve</label>
                <input
                  type="number"
                  value={reserveQty}
                  onChange={(e) => setReserveQty(e.target.value)}
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
                  className="flex-1 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {isSubmitting ? 'Reserving...' : 'Reserve'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReserveModal(false); setSelectedPart(null); }}
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

      {/* Consume Modal */}
      {showConsumeModal && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Zużyj część - {selectedPart.name}</h3>
              <button onClick={() => { setShowConsumeModal(false); setSelectedPart(null); }} className="text-[#94A3B8] hover:text-white">✕</button>
            </div>
            <form className="space-y-4" onSubmit={handleConsume}>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Quantity to consume</label>
                <input
                  type="number"
                  value={consumeQty}
                  onChange={(e) => setConsumeQty(e.target.value)}
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
                  className="flex-1 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF944D] text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {isSubmitting ? 'Processing...' : 'Consume'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowConsumeModal(false); setSelectedPart(null); }}
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
