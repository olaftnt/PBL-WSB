"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import type { View } from "@/types/view";
import type { QuoteListItem } from "@/types/quote";

interface QuoteListProps {
  onNavigate: (view: View, id?: string) => void;
  quotes: QuoteListItem[];
  stats: { total: number; sent: number; accepted: number; rejected: number; pendingCustomer: number };
}

export function QuoteList({ onNavigate, quotes, stats }: QuoteListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusConfig = (status: string) => {
    const s = String(status ?? "").toUpperCase();
    switch (s) {
      case "DRAFT":
        return {
          icon: Clock,
          bg: "bg-[#64748B]/10",
          text: "text-[#64748B]",
          border: "border-[#64748B]/20",
          label: "Szkic",
        };
      case "SENT":
        return {
          icon: Send,
          bg: "bg-[#00D9FF]/10",
          text: "text-[#00D9FF]",
          border: "border-[#00D9FF]/20",
          label: "Zapisany",
        };
      case "ACCEPTED":
        return {
          icon: CheckCircle,
          bg: "bg-[#00FF88]/10",
          text: "text-[#00FF88]",
          border: "border-[#00FF88]/20",
          label: "Zaakceptowany",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          bg: "bg-[#FF6B35]/10",
          text: "text-[#FF6B35]",
          border: "border-[#FF6B35]/20",
          label: "Odrzucony",
        };
      default:
        return {
          icon: FileText,
          bg: "bg-[#64748B]/10",
          text: "text-[#64748B]",
          border: "border-[#64748B]/20",
          label: "Nieznany",
        };
    }
  };

  const filteredQuotes = quotes.filter(
    (quote) =>
      (statusFilter === "all" ||
        (statusFilter === "pending_customer"
          ? quote.publicAccess === "PUBLIC" &&
            quote.status !== "ACCEPTED" &&
            quote.status !== "REJECTED"
          : String(quote.status).toLowerCase() === statusFilter)) &&
      (searchQuery === "" ||
        quote.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Kosztorysy</h1>
          <p className="text-[#94A3B8]">Zarządzaj wycenami napraw</p>
        </div>
        <button
          onClick={() => onNavigate("quote-detail", "new")}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nowy kosztorys
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Wszystkie",
            value: stats.total,
            color: "from-[#00D9FF] to-[#0099CC]",
          },
          {
            label: "Zapisane",
            value: stats.sent,
            color: "from-[#FFB800] to-[#CC9400]",
          },
          {
            label: "Zaakceptowane",
            value: stats.accepted,
            color: "from-[#00FF88] to-[#00CC6A]",
          },
          {
            label: "Czeka na klienta",
            value: stats.pendingCustomer,
            color: "from-[#00D9FF] to-[#0099CC]",
          },
          
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg"
          >
            <p className="text-[#94A3B8] text-sm mb-2">{stat.label}</p>
            <p className="text-white text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Szukaj po numerze kosztorysu, zgłoszeniu lub kliencie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: "all", label: "Wszystkie" },
            { id: "pending_customer", label: "Czeka na akceptację klienta" },
            { id: "draft", label: "Szkice" },
            { id: "sent", label: "Zapisane" },
            { id: "accepted", label: "Zaakceptowane" },
            { id: "rejected", label: "Odrzucone" },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                statusFilter === filter.id
                  ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]"
                  : "border-[#1A2642] bg-[#121B2D] text-[#94A3B8] hover:text-white hover:border-[#00FF88]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuotes.map((quote) => {
          const statusConfig = getStatusConfig(quote.status);
          const StatusIcon = statusConfig.icon;
          const formattedCreatedAt = new Date(quote.createdAt).toLocaleString('pl-PL', {
            dateStyle: 'short',
            timeStyle: 'short',
          });
          return (
            <button
              key={quote.id}
              onClick={() => onNavigate("quote-detail", quote.id)}
              className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg hover:border-[#00FF88] transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFB800] to-[#CC9400] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-sm">
                      {quote.ticketNumber}
                    </p>
                    <h3 className="text-white mb-1 group-hover:text-[#00FF88] transition-colors">
                      {quote.customerName}
                    </h3>
                    <p className="text-[#64748B] text-xs">{quote.number}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  <StatusIcon className={`w-3 h-3 ${statusConfig.text}`} />
                  {statusConfig.label}
                </span>
              </div>
              {quote.publicAccess === "PUBLIC" && quote.status !== "ACCEPTED" && quote.status !== "REJECTED" && (
                <div className="mb-4 rounded-lg border border-[#00D9FF]/30 bg-[#00D9FF]/10 px-3 py-2 text-[#00D9FF] text-sm">
                  Czeka na akceptację klienta
                </div>
              )}
              <div className="space-y-2 mb-4">
                <p className="text-[#64748B] text-sm">{quote.deviceName}</p>
                {quote.notes && (
                  <p className="text-[#94A3B8] text-sm truncate">
                    {quote.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
                <span className="text-[#64748B] text-sm">
                  {formattedCreatedAt}
                </span>
                <span className="text-[#00FF88] text-lg">
                  {quote.totalGross.toFixed(2)} zł
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
