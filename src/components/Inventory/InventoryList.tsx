'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Plus, Search, AlertTriangle, Package, Edit, Minus } from 'lucide-react';
import type { PartListItem, TicketOption } from '@/types/inventory';

type InventoryListProps = {
  parts: PartListItem[];
  tickets: TicketOption[];
  focusPartId?: string;
  onCreatePart: (payload: { sku: string; name: string; warehouseLocation: string | null; quantity: number; minQuantity: number; price: number; }) => Promise<any>;
  onUpdatePart: (id: string, payload: Partial<{ sku: string; name: string; warehouseLocation: string | null; quantity: number; minQuantity: number; price: number; }>) => Promise<any>;
  onReserve: (partId: string, ticketId: string, quantity: number) => Promise<any>;
  onConsume: (partId: string, quantity: number) => Promise<any>;
};

export function InventoryList({
  parts,
  tickets,
  focusPartId,
  onCreatePart,
  onUpdatePart,
  onReserve,
  onConsume,
}: InventoryListProps) {
  const deepLinkHandledRef = useRef<string | null>(null);

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
  const [warehouseLocation, setWarehouseLocation] = useState('');

  const [reserveTicketId, setReserveTicketId] = useState('');
  const [reserveQty, setReserveQty] = useState<number | string>(1);
  const [consumeQty, setConsumeQty] = useState<number | string>(1);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashPartId, setFlashPartId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return { bg: 'bg-[#00FF88]/10', text: 'text-[#00FF88]', border: 'border-[#00FF88]/20', label: 'OK' };
      case 'low':
        return { bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', border: 'border-[#FFB800]/20', label: 'Niski stan' };
      case 'critical':
        return { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/20', label: 'Krytyczny' };
      default:
        return { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', border: 'border-[#64748B]/20', label: 'Brak danych' };
    }
  };

  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = (parts ?? []).filter((part) =>
      !q ||
      part.name.toLowerCase().includes(q) ||
      part.sku.toLowerCase().includes(q) ||
      (part.warehouseLocation ?? '').toLowerCase().includes(q)
    );
    const pinId = focusPartId?.trim();
    if (pinId && parts?.length && !list.some((p) => p.id === pinId)) {
      const pinned = parts.find((p) => p.id === pinId);
      if (pinned) list = [pinned, ...list];
    }
    return list;
  }, [parts, searchQuery, focusPartId]);

  const openEdit = useCallback((part: PartListItem) => {
    setSelectedPart(part);
    setSku(part.sku);
    setName(part.name);
    setQuantity(part.quantity);
    setMinQuantity(part.minQuantity);
    setPrice(part.price);
    setWarehouseLocation(part.warehouseLocation ?? '');
    setError(null);
    setShowEditModal(true);
  }, []);

  useEffect(() => {
    const id = focusPartId?.trim();
    if (!id) {
      deepLinkHandledRef.current = null;
      return;
    }
    const part = parts.find((p) => p.id === id);
    if (!part) return;
    if (deepLinkHandledRef.current === id) return;
    deepLinkHandledRef.current = id;

    setFlashPartId(id);
    const clearFlash = window.setTimeout(() => {
      setFlashPartId((cur) => (cur === id ? null : cur));
    }, 4000);

    const scrollToRow = () => {
      document.getElementById(`inventory-part-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };

    openEdit(part);
    requestAnimationFrame(() => scrollToRow());
    window.setTimeout(scrollToRow, 120);

    return () => window.clearTimeout(clearFlash);
  }, [focusPartId, parts, openEdit]);

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
    setWarehouseLocation('');
    setError(null);
    setShowAddModal(true);
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
        warehouseLocation: warehouseLocation.trim() === '' ? null : warehouseLocation.trim(),
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
        warehouseLocation: warehouseLocation.trim() === '' ? null : warehouseLocation.trim(),
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
          <h1 className="text-white text-2xl mb-1">Magazyn części</h1>
          <p className="text-[#94A3B8]">Zarządzaj częściami i stanami magazynowymi</p>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Dodaj część
        </button>
      </div>

      {/* Alert */}
      {lowStockCount > 0 && (
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FF6B35] mt-0.5" />
          <div>
            <p className="text-[#FF6B35] mb-1">Niski stan magazynowy</p>
            <p className="text-[#94A3B8] text-sm">{lowStockCount} pozycji ma niski lub krytyczny stan</p>
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
              placeholder="Szukaj po nazwie, SKU lub lokalizacji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
            />
          </div>
        </div>
        <div className="text-[#94A3B8] text-sm">
          {filteredParts.length} części
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-[#0C1222] rounded-xl border border-[#1A2642] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A2642]">
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">SKU</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Nazwa</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Lokalizacja</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Ilość</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Zarezerw.</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Min. ilość</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Cena</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Status</th>
                <th className="text-left px-6 py-4 text-[#94A3B8] text-sm">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => {
                const statusBadge = getStatusBadge(part.status);
                return (
                  <tr
                    key={part.id}
                    id={`inventory-part-${part.id}`}
                    className={`border-b border-[#1A2642] hover:bg-[#121B2D] transition-colors scroll-mt-28 ${
                      flashPartId === part.id ? 'bg-[#0b5cff]/15 outline outline-2 outline-[#0b5cff]/40 outline-offset-[-2px]' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{part.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#94A3B8]">{part.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm whitespace-pre-wrap break-words max-w-[10rem]">
                        {part.warehouseLocation ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className={`w-4 h-4 ${part.status === 'ok' ? 'text-[#00FF88]' : 'text-[#FF6B35]'}`} />
                        <span className="text-white">{part.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{part.reserved}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#64748B] text-sm">{part.minQuantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#00FF88]">{part.price.toFixed(2)} zł</span>
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
              <h3 className="text-white">Dodaj część</h3>
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
                <label className="block text-[#94A3B8] text-sm mb-2">Nazwa części</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="iPhone 14 Pro Screen"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Lokalizacja magazynowa</label>
                <input
                  type="text"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="np. Regał A-3 · Półka 2"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Ilość</label>
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
                <label className="block text-[#94A3B8] text-sm mb-2">Min ilość</label>
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
                <label className="block text-[#94A3B8] text-sm mb-2">Cena</label>
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
                  {isSubmitting ? 'Dodawanie...' : 'Dodaj część'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

      {/* Edit Modal */}
      {showEditModal && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Edytuj część - {selectedPart.name}</h3>
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
                  <label className="block text-[#94A3B8] text-sm mb-2">Nazwa części</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Lokalizacja magazynowa</label>
                <input
                  type="text"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="np. Regał A-3 · Półka 2"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Ilość</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Min ilość</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-sm mb-2">Cena</label>
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
                  {isSubmitting ? 'Aktualizuję...' : 'Zapisz'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedPart(null); }}
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

      {/* Reserve Modal */}
      {showReserveModal && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0C1222] rounded-2xl p-6 border border-[#1A2642] max-w-xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Zarezerwuj część - {selectedPart.name}</h3>
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
                <label className="block text-[#94A3B8] text-sm mb-2">Ilość do rezerwacji</label>
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
                  {isSubmitting ? 'Rezerwuję...' : 'Zarezerwuj'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReserveModal(false); setSelectedPart(null); }}
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
                <label className="block text-[#94A3B8] text-sm mb-2">Ilość do zużycia</label>
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
                  {isSubmitting ? 'Przetwarzam...' : 'Zużyj'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowConsumeModal(false); setSelectedPart(null); }}
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
