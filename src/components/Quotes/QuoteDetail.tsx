"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  Download,
  Clipboard,
  XCircle,
} from "lucide-react";
import type {
  QuoteDetailData,
  PartOption,
  QuoteItemInput,
  TicketOption,
  CustomerOption,
} from "@/types/quote";
import {
  saveQuote,
  updateQuoteStatus,
  deleteQuote,
} from "@/app/(app)/_actions/quotes";
import type { QuoteStatus } from "@prisma/client";

interface QuoteDetailProps {
  initialQuote: QuoteDetailData;
  parts: PartOption[];
  tickets: TicketOption[];
  customers?: CustomerOption[];
}

export function QuoteDetail({
  initialQuote,
  parts: availableParts,
  tickets,
}: QuoteDetailProps) {
  const router = useRouter();
  const [laborHours, setLaborHours] = useState<string>(
    String(initialQuote.laborHours ?? 0)
  );
  const [laborRate, setLaborRate] = useState<string>(
    String(initialQuote.laborRate ?? 0)
  );
  const [vatRate, setVatRate] = useState(initialQuote.vatRate);
  const [ticketId, setTicketId] = useState(initialQuote.ticketId);
  const [customerId, setCustomerId] = useState(initialQuote.customerId);
  const [publicAccess, setPublicAccess] = useState<'PUBLIC' | 'VIEW_ONLY' | 'HIDDEN'>(
    initialQuote.publicAccess ?? 'HIDDEN'
  );
  const [notes, setNotes] = useState(initialQuote.notes ?? "");
  const [items, setItems] = useState<any[]>(
    initialQuote.items.map((i) => ({
      id: i.id,
      partId: i.partId,
      description: i.description,
      quantity: String(i.quantity ?? 1),
      unitPrice: String(i.unitPrice ?? 0),
    }))
  );
  const isNew = initialQuote.id === "new";
  const [status, setStatus] = useState<QuoteStatus>(initialQuote.status);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [partSearchByRow, setPartSearchByRow] = useState<Record<string, string>>({});
  const [openPartPickerRow, setOpenPartPickerRow] = useState<string | null>(null);
  const selectedTicket = tickets.find((t) => t.id === ticketId);

  const laborCost = useMemo(() => {
    return (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
  }, [laborHours, laborRate]);
  const partsCost = useMemo(() => {
    return items.reduce(
      (acc, part) =>
        acc + (parseFloat(part.quantity) || 0) * (parseFloat(part.unitPrice) || 0),
      0
    );
  }, [items]);
  const netTotal = useMemo(() => laborCost + partsCost, [laborCost, partsCost]);
  const vatAmount = useMemo(
    () => netTotal * (vatRate / 100),
    [netTotal, vatRate]
  );
  const grossTotal = useMemo(() => netTotal + vatAmount, [netTotal, vatAmount]);

  const statusConfig = useMemo(() => {
    switch (status) {
      case "SENT":
        return {
          label: "Zapisany",
          classes: "bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30",
        };
      case "ACCEPTED":
        return {
          label: "Zaakceptowany",
          classes: "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30",
        };
      case "REJECTED":
        return {
          label: "Odrzucony",
          classes: "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30",
        };
      default:
        return {
          label: "Szkic",
          classes: "bg-[#64748B]/10 text-[#94A3B8] border-[#64748B]/30",
        };
    }
  }, [status]);

  const handleAddPart = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        partId: undefined,
        description: "",
        quantity: "1",
        unitPrice: "0",
      },
    ]);
  };

  const handleRemovePart = (id: string) => {
    setItems(items.filter((p) => p.id !== id));
    if (openPartPickerRow === id) {
      setOpenPartPickerRow(null);
    }
    setPartSearchByRow((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const handleSelectPart = (rowId: string, selectedId: string) => {
    const selected = availableParts.find((p) => p.id === selectedId);
    setPartSearchByRow((current) => ({
      ...current,
      [rowId]: selected ? `${selected.sku} ${selected.name}` : "",
    }));
    setOpenPartPickerRow(null);
    setItems(
      items.map((p) =>
        p.id === rowId
          ? {
              ...p,
              partId: selected?.id,
              description: selected?.name ?? "",
              unitPrice:
                selected?.price !== undefined ? String(selected.price) : p.unitPrice,
            }
          : p
      )
    );
  };

  const getFilteredPartOptions = (rowId: string, selectedPartId?: string | null) => {
    const query = (partSearchByRow[rowId] ?? "").trim().toLowerCase();
    const filtered = query
      ? availableParts.filter((part) =>
          `${part.name} ${part.sku}`.toLowerCase().includes(query)
        )
      : availableParts;
    const selected = selectedPartId
      ? availableParts.find((part) => part.id === selectedPartId)
      : undefined;

    if (selected && !filtered.some((part) => part.id === selected.id)) {
      return [selected, ...filtered];
    }

    return filtered;
  };

  const handleSave = async (saveAs: QuoteStatus) => {
    setSaving(true);
    setLastAction(null);
    try {
      const result = await saveQuote({
        id: isNew ? undefined : initialQuote.id,
        ticketId: ticketId || "",
        customerId: customerId || "",
        deviceId: selectedTicket?.deviceId ?? initialQuote.deviceId ?? null,
        laborHours: parseFloat(laborHours) || 0,
        laborRate: parseFloat(laborRate) || 0,
        vatRate,
        notes: notes || "",
        items: items.map((i) => ({
          id: i.id,
          partId: i.partId || null,
          description: i.description || "Pozycja",
          quantity: parseInt(i.quantity) || 0,
          unitPrice: parseFloat(i.unitPrice) || 0,
        })),
        status: saveAs,
        publicAccess,
      });
      setStatus(saveAs);
      setLastAction(
        saveAs === "DRAFT" ? "Zapisano jako szkic." : "Zapisano kosztorys."
      );
      if (isNew && result?.id) {
        router.push(`/quotes/${result.id}`);
      } else {
        router.refresh();
        setSaving(false);
      }
    } catch (err: any) {
      setLastAction(err?.message ?? "Nie udało się zapisać kosztorysu.");
      setSaving(false);
    }
  };

  const handleDecision = async (decision: QuoteStatus) => {
    try {
      await updateQuoteStatus(initialQuote.id, decision);
      setStatus(decision);
      setLastAction(
        decision === "ACCEPTED"
          ? "Kosztorys zaakceptowany online."
          : "Kosztorys został odrzucony."
      );
      router.refresh();
    } catch (err: any) {
      setLastAction(err?.message ?? "Nie udało się zaktualizować statusu.");
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      setLastAction("Kosztorys nie zapisany — brak czego usuwać.");
      return;
    }
    setDeleting(true);
    try {
      await deleteQuote(initialQuote.id);
      setLastAction("Kosztorys usunięty.");
      router.push("/quotes");
    } catch (err: any) {
      setLastAction(err?.message ?? "Nie udało się usunąć kosztorysu.");
      setDeleting(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLastAction("Link do akceptacji skopiowany.");
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/quotes")}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">
              {isNew ? "Nowy Kosztorys" : `Kosztorys ${initialQuote.number}`}
            </h1>
            <p className="text-[#94A3B8]">
              {isNew ? "Utwórz kosztorys naprawy" : "Szczegóły kosztorysu"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ticketId && (
            <button
              type="button"
              onClick={() => router.push(`/tickets/${ticketId}`)}
              className="px-5 py-3 bg-gradient-to-r from-[#00D9FF] to-[#0099CC] text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-[#00D9FF]/10"
            >
              <Clipboard className="w-5 h-5" />
              Przejdź do zlecenia
            </button>
          )}

          {!isNew && (
            <>
              <button className="hidden px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4 " />
                Pobierz PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg space-y-4">
            <h3 className="text-white mb-2">Informacje o kosztorysie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">
                  Zgłoszenie
                </label>
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
                <label className="block text-[#94A3B8] text-sm mb-2">
                  Klient
                </label>
                <div className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white">
                  {selectedTicket?.customerName ||
                    initialQuote.customerName ||
                    "—"}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">
                Widoczność w statusie publicznym
              </label>
              <select
                value={publicAccess}
                onChange={(e) =>
                  setPublicAccess(e.target.value as 'PUBLIC' | 'VIEW_ONLY' | 'HIDDEN')
                }
                className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
              >
                <option value="PUBLIC">
                  Publiczny - klient widzi i może zaakceptować
                </option>
                <option value="VIEW_ONLY">
                  Widoczny - klient może tylko zobaczyć
                </option>
                <option value="HIDDEN">
                  Ukryty - widzi tylko serwisant
                </option>
              </select>
              <p className="mt-2 text-xs text-[#64748B]">
                Dotyczy podglądu na stronie statusu publicznego.
              </p>
            </div>
            {(selectedTicket?.deviceName || initialQuote.deviceName) && (
              <p className="text-sm text-[#94A3B8]">
                Urządzenie: {selectedTicket?.deviceName || initialQuote.deviceName}
              </p>
            )}
          </div>

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Robocizna</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">
                  Godziny
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">
                  Stawka (zł/h)
                </label>
                <input
                  type="number"
                  value={laborRate}
                  onChange={(e) => setLaborRate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">
                  Suma
                </label>
                <div className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88]">
                  {laborCost.toFixed(2)} zł
                </div>
              </div>
            </div>
          </div>

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
                <div
                  key={part.id}
                  className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]"
                >
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4 relative">
                      <label className="block text-[#94A3B8] text-xs mb-2">
                        Magazyn
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenPartPickerRow(
                            openPartPickerRow === part.id ? null : part.id
                          )
                        }
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      >
                        <span className="block truncate text-left">
                          {part.partId
                            ? availableParts.find((p) => p.id === part.partId)
                              ? `${availableParts.find((p) => p.id === part.partId)?.sku} · ${availableParts.find((p) => p.id === part.partId)?.name}`
                              : "Wybrana część"
                            : "Wybierz z magazynu (opcjonalnie)"}
                        </span>
                      </button>

                      {openPartPickerRow === part.id && (
                        <div className="absolute z-30 mt-2 w-[min(42rem,calc(100vw-3rem))] rounded-lg border border-[#1A2642] bg-[#0C1222] shadow-xl">
                          <div className="p-2 border-b border-[#1A2642]">
                            <input
                              type="text"
                              value={partSearchByRow[part.id] ?? ""}
                              onChange={(e) =>
                                setPartSearchByRow((current) => ({
                                  ...current,
                                  [part.id]: e.target.value,
                                }))
                              }
                              placeholder="Szukaj po nazwie lub SKU..."
                              autoFocus
                              className="w-full px-3 py-2 bg-[#121B2D] border border-[#1A2642] rounded text-white text-sm placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                            />
                          </div>

                          <div className="max-h-56 overflow-y-auto p-1">
                            <button
                              type="button"
                              onClick={() => handleSelectPart(part.id, "")}
                              className="w-full px-3 py-2 text-left text-sm text-[#94A3B8] hover:bg-[#121B2D] rounded"
                            >
                              Wybierz z magazynu (opcjonalnie)
                            </button>

                            {getFilteredPartOptions(part.id, part.partId).map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectPart(part.id, p.id)}
                                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#121B2D] rounded"
                              >
                                <span className="block whitespace-normal break-words">
                                  {p.sku} · {p.name}
                                </span>
                                <span className="block text-xs text-[#64748B]">
                                  {p.quantity - p.reserved} szt.
                                </span>
                              </button>
                            ))}

                            {getFilteredPartOptions(part.id, part.partId).length === 0 && (
                              <p className="px-3 py-2 text-sm text-[#64748B]">
                                Brak pasujących części.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[#94A3B8] text-xs mb-2">
                        Nazwa części
                      </label>
                      <input
                        type="text"
                        value={part.description}
                        onChange={(e) => {
                          setItems(
                            items.map((p) =>
                              p.id === part.id
                                ? { ...p, description: e.target.value }
                                : p
                            )
                          );
                        }}
                        placeholder="Wybierz lub wpisz nazwę..."
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[#94A3B8] text-xs mb-2">
                        Ilość
                      </label>
                      <input
                        type="number"
                        value={part.quantity}
                        min={1}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(
                            items.map((p) =>
                              p.id === part.id ? { ...p, quantity: val } : p
                            )
                          );
                        }}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[#94A3B8] text-xs mb-2">
                        Cena
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={part.unitPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(
                            items.map((p) =>
                              p.id === part.id ? { ...p, unitPrice: val } : p
                            )
                          );
                        }}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[#94A3B8] text-xs mb-2">
                        Suma
                      </label>
                      <div className="px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-[#00FF88] text-sm">
                        {(
                          (parseFloat(part.quantity) || 0) *
                          (parseFloat(part.unitPrice) || 0)
                        ).toFixed(2)} zł
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

          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Notatki / Warunki</h3>
            <textarea
              placeholder="Dodaj notatki/warunki dla klienta..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg sticky top-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white">Podsumowanie</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs border ${statusConfig.classes}`}
              >
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
                <span className="text-[#00FF88] text-2xl">
                  {grossTotal.toFixed(2)} zł
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSave("DRAFT")}
                disabled={saving}
                className="w-full py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors disabled:opacity-60"
              >
                {saving ? "Zapisywanie..." : "Zapisz jako szkic"}
              </button>
              <button
                onClick={() => handleSave("SENT")}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {saving ? "Zapisywanie..." : "Zapisz"}
              </button>
              <button
                onClick={() => handleDecision("ACCEPTED")}
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
                {deleting ? "Usuwanie..." : "Usuń"}
              </button>
            </div>

            {lastAction && (
              <div className="rounded-lg border border-[#1A2642] bg-[#121B2D] px-3 py-2 text-xs text-[#94A3B8]">
                {lastAction}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
