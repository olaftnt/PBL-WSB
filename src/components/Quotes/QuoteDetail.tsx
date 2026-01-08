'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, CheckCircle, Download, Clipboard, XCircle } from 'lucide-react';
import type { QuoteDetailData, PartOption, QuoteItemInput, TicketOption, CustomerOption } from '@/types/quote';
import { saveQuote, updateQuoteStatus, deleteQuote } from '@/app/(app)/_actions/quotes';
import type { QuoteStatus } from '@prisma/client';

interface QuoteDetailProps {
  initialQuote: QuoteDetailData;
  parts: PartOption[];
  tickets: TicketOption[];
}

export function QuoteDetail({ initialQuote, parts: availableParts, tickets }: QuoteDetailProps) {
  const router = useRouter();
  const [laborHours, setLaborHours] = useState(initialQuote.laborHours);
  const [laborRate, setLaborRate] = useState(initialQuote.laborRate);
  const [vatRate, setVatRate] = useState(initialQuote.vatRate);
  const [ticketId, setTicketId] = useState(initialQuote.ticketId);
  const [customerId, setCustomerId] = useState(initialQuote.customerId);
  const [items, setItems] = useState<QuoteItemInput[]>(
    initialQuote.items.map((i) => ({
      id: i.id,
      partId: i.partId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  );
  const isNew = initialQuote.id === 'new';
  const [status, setStatus] = useState<QuoteStatus>(initialQuote.status);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const laborCost = useMemo(() => laborHours * laborRate, [laborHours, laborRate]);
  const partsCost = useMemo(() => items.reduce((acc, part) => acc + part.quantity * part.unitPrice, 0), [items]);
  const netTotal = useMemo(() => laborCost + partsCost, [laborCost, partsCost]);
  const vatAmount = useMemo(() => netTotal * (vatRate / 100), [netTotal, vatRate]);
  const grossTotal = useMemo(() => netTotal + vatAmount, [netTotal, vatAmount]);

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'SENT':
        return { label: 'Wysłany', classes: 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30' };
      case 'ACCEPTED':
        return { label: 'Zaakceptowany', classes: 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30' };
      case 'REJECTED':
        return { label: 'Odrzucony', classes: 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30' };
      default:
        return { label: 'Szkic', classes: 'bg-[#64748B]/10 text-[#94A3B8] border-[#64748B]/30' };
    }
  }, [status]);

  const handleAddPart = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        partId: undefined,
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemovePart = (id: string) => {
    setItems(items.filter((p) => p.id !== id));
  };

  const handleSelectPart = (rowId: string, selectedId: string) => {
    const selected = availableParts.find((p) => p.id === selectedId);
    setItems(
      items.map((p) =>
        p.id === rowId
          ? {
              ...p,
              partId: selected?.id,
              description: selected?.name ?? '',
              unitPrice: selected?.price ?? p.unitPrice,
            }
          : p,
      ),
    );
  };

  const handleSave = async (saveAs: QuoteStatus) => {
    setSaving(true);
    setLastAction(null);
    try {
      await saveQuote({
        id: isNew ? undefined : initialQuote.id,
        ticketId: ticketId || '',
        customerId: customerId || '',
        deviceId: initialQuote.deviceId || null,
        laborHours,
        laborRate,
        vatRate,
        notes: initialQuote.notes ?? '',
        items: items.map((i) => ({
          id: i.id,
          partId: i.partId || null,
          description: i.description || 'Pozycja',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        status: saveAs,
      });
      setStatus(saveAs);
      setLastAction(saveAs === 'DRAFT' ? 'Zapisano jako szkic.' : 'Zapisano kosztorys.');
      if (isNew && typeof window !== 'undefined') {
        router.push('/quotes'); // odśwież listę; unikamy wielokrotnego tworzenia na "new"
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setLastAction(err?.message ?? 'Nie udało się zapisać kosztorysu.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToCustomer = async () => {
    // removed "send to customer" action per request
  };

  const handleDecision = async (decision: QuoteStatus) => {
    try {
      await updateQuoteStatus(initialQuote.id, decision);
      setStatus(decision);
      setLastAction(
        decision === 'ACCEPTED'
          ? 'Kosztorys zaakceptowany online.'
          : 'Kosztorys został odrzucony.',
      );
    } catch (err: any) {
      setLastAction(err?.message ?? 'Nie udało się zaktualizować statusu.');
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      setLastAction('Kosztorys nie zapisany — brak czego usuwać.');
      return;
    }
    setDeleting(true);
    try {
      await deleteQuote(initialQuote.id);
      setLastAction('Kosztorys usunięty.');
      // opcjonalnie nawigacja wstecz
      if (typeof window !== 'undefined') {
        router.push('/quotes');
      }
    } catch (err: any) {
      setLastAction(err?.message ?? 'Nie udało się usunąć kosztorysu.');
    } finally {
      setDeleting(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLastAction('Link do akceptacji skopiowany.');
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => history.back()}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">
              {isNew ? 'New Quote' : `Wycena ${initialQuote.number}`}
            </h1>
            <p className="text-[#94A3B8]">{isNew ? 'Create repair estimate' : 'Szczegóły kosztorysu'}</p>
          </div>
        </div>
            <div className="flex items-center gap-3">
          {!isNew && (
            <>
              <button className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Pobierz PDF (niezaimplementowane)
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg space-y-4">
            <h3 className="text-white mb-2">Informacje o kosztorysie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Zgłoszenie</label>
                <select
                  value={ticketId}
                  onChange={(e) => {
                    const newTicketId = e.target.value;
                    setTicketId(newTicketId);
                    const found = tickets.find((t) => t.id === newTicketId);
                    if (found?.customerId) {
                      setCustomerId(found.customerId);
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                >
                  <option value="">Wybierz zgłoszenie</option>
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Klient</label>
                <div className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white">
                  {tickets.find((t) => t.id === ticketId)?.customerName || initialQuote.customerName || '—'}
                </div>
              </div>
            </div>
            {initialQuote.deviceName && (
              <p className="text-sm text-[#94A3B8]">Urządzenie: {initialQuote.deviceName}</p>
            )}
          </div>

          {/* Labor */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Robocizna</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Godziny</label>
                <input
                  type="number"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Stawka (zł/h)</label>
                <input
                  type="number"
                  value={laborRate}
                  onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Suma</label>
                <div className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88]">
                  {laborCost.toFixed(2)} zł
                </div>
              </div>
            </div>
          </div>

          {/* Parts */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Części</h3>
              <button
                onClick={handleAddPart}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Dodaj część
              </button>
            </div>
            <div className="space-y-3">
              {items.map((part) => (
                <div key={part.id} className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4">
                      <label className="block text-[#94A3B8] text-xs mb-2">Magazyn</label>
                      <select
                        value={part.partId ?? ''}
                        onChange={(e) => handleSelectPart(part.id, e.target.value)}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      >
                        <option value="">Wybierz z magazynu (opcjonalnie)</option>
                        {availableParts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} · {p.name} ({p.quantity - p.reserved} szt.)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[#94A3B8] text-xs mb-2">Nazwa części</label>
                      <input
                        type="text"
                        value={part.description}
                        onChange={(e) => {
                          setItems(items.map((p) => (p.id === part.id ? { ...p, description: e.target.value } : p)));
                        }}
                        placeholder="Wybierz lub wpisz nazwę..."
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[#94A3B8] text-xs mb-2">Ilość</label>
                      <input
                        type="number"
                        value={part.quantity}
                        min={1}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0;
                          setItems(items.map((p) => (p.id === part.id ? { ...p, quantity: qty } : p)));
                        }}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[#94A3B8] text-xs mb-2">Cena</label>
                      <input
                        type="number"
                        step="0.01"
                        value={part.unitPrice}
                        onChange={(e) => {
                          setItems(items.map((p) => (p.id === part.id ? { ...p, unitPrice: parseFloat(e.target.value) || 0 } : p)));
                        }}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[#94A3B8] text-xs mb-2">Suma</label>
                      <div className="px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-[#00FF88] text-sm">
                        {(part.quantity * part.unitPrice).toFixed(2)} zł
                      </div>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => handleRemovePart(part.id)}
                        className="w-full p-2 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Notatki / Warunki</h3>
            <textarea
              placeholder="Dodaj notatki/warunki dla klienta..."
              rows={4}
              defaultValue={initialQuote.notes ?? ''}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg sticky top-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white">Podsumowanie</h3>
              <span className={`px-3 py-1 rounded-full text-xs border ${statusConfig.classes}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Robocizna</span>
                <span className="text-white">{laborCost.toFixed(2)} zł</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Części</span>
                <span className="text-white">{partsCost.toFixed(2)} zł</span>
              </div>
              <div className="h-px bg-[#1A2642]"></div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Netto</span>
                <span className="text-white">{netTotal.toFixed(2)} zł</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#94A3B8]">VAT (%)</span>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">VAT kwota</span>
                <span className="text-white">{vatAmount.toFixed(2)} zł</span>
              </div>
              <div className="h-px bg-[#1A2642]"></div>
              <div className="flex items-center justify-between">
                <span className="text-white">Brutto</span>
                <span className="text-[#00FF88] text-2xl">{grossTotal.toFixed(2)} zł</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="w-full py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Zapisz jako szkic'}
              </button>
              <button
                onClick={() => handleSave('SENT')}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {saving ? 'Saving...' : 'Zapisz'}
              </button>
              <button
                onClick={() => handleDecision('ACCEPTED')}
                disabled={isNew || saving}
                className="w-full py-3 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] rounded-lg hover:bg-[#00FF88]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                Oznacz jako zaakceptowany
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-3 bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Usuwanie...' : 'Usuń'}
              </button>
            </div>

            {lastAction && (
              <div className="rounded-lg border border-[#1A2642] bg-[#121B2D] px-3 py-2 text-xs text-[#94A3B8]">
                {lastAction}
              </div>
            )}
          </div>

          {/* Status/wysłka sekcja usunięta zgodnie z wymaganiem */}
        </div>
      </div>
    </div>
  );
}
