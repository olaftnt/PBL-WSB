import { useState } from 'react';
import { Plus, Search, FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { View } from '@/types/view';

interface QuoteListProps {
  onNavigate: (view: View, id?: string) => void;
}

const mockQuotes = [
  { id: 'QT-2024-1247', ticket: 'TK-2024-1247', customer: 'John Smith', device: 'MacBook Pro 16"', total: 299.00, status: 'draft', created: '2024-12-09' },
  { id: 'QT-2024-1246', ticket: 'TK-2024-1246', customer: 'Sarah Johnson', device: 'iPhone 14 Pro', total: 199.00, status: 'sent', created: '2024-12-09' },
  { id: 'QT-2024-1245', ticket: 'TK-2024-1245', customer: 'Mike Wilson', device: 'Dell XPS 15', total: 449.00, status: 'accepted', created: '2024-12-08' },
  { id: 'QT-2024-1244', ticket: 'TK-2024-1244', customer: 'Emma Davis', device: 'Samsung Galaxy S23', total: 179.00, status: 'accepted', created: '2024-12-08' },
  { id: 'QT-2024-1243', ticket: 'TK-2024-1243', customer: 'Robert Brown', device: 'HP Pavilion', total: 89.00, status: 'rejected', created: '2024-12-08' },
  { id: 'QT-2024-1242', ticket: 'TK-2024-1242', customer: 'Lisa Anderson', device: 'PlayStation 5', total: 149.00, status: 'sent', created: '2024-12-07' },
];

export function QuoteList({ onNavigate }: QuoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { icon: Clock, bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', border: 'border-[#64748B]/20' };
      case 'sent':
        return { icon: Send, bg: 'bg-[#00D9FF]/10', text: 'text-[#00D9FF]', border: 'border-[#00D9FF]/20' };
      case 'accepted':
        return { icon: CheckCircle, bg: 'bg-[#00FF88]/10', text: 'text-[#00FF88]', border: 'border-[#00FF88]/20' };
      case 'rejected':
        return { icon: XCircle, bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]', border: 'border-[#FF6B35]/20' };
      default:
        return { icon: FileText, bg: 'bg-[#64748B]/10', text: 'text-[#64748B]', border: 'border-[#64748B]/20' };
    }
  };

  const filteredQuotes = mockQuotes.filter(quote =>
    (statusFilter === 'all' || quote.status === statusFilter) &&
    (searchQuery === '' ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.ticket.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Quotes & Estimates</h1>
          <p className="text-[#94A3B8]">Manage repair quotes and pricing</p>
        </div>
        <button
          onClick={() => onNavigate('quote-detail', 'new')}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Quote
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Quotes', value: mockQuotes.length, color: 'from-[#00D9FF] to-[#0099CC]' },
          { label: 'Pending', value: mockQuotes.filter(q => q.status === 'sent').length, color: 'from-[#FFB800] to-[#CC9400]' },
          { label: 'Accepted', value: mockQuotes.filter(q => q.status === 'accepted').length, color: 'from-[#00FF88] to-[#00CC6A]' },
          { label: 'Rejected', value: mockQuotes.filter(q => q.status === 'rejected').length, color: 'from-[#FF6B35] to-[#CC5529]' },
        ].map((stat, index) => (
          <div key={index} className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <p className="text-[#94A3B8] text-sm mb-2">{stat.label}</p>
            <p className="text-white text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by quote ID, ticket, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuotes.map((quote) => {
          const statusConfig = getStatusConfig(quote.status);
          const StatusIcon = statusConfig.icon;
          return (
            <button
              key={quote.id}
              onClick={() => onNavigate('quote-detail', quote.id)}
              className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg hover:border-[#00FF88] transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFB800] to-[#CC9400] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white mb-1 group-hover:text-[#00FF88] transition-colors">
                      {quote.id}
                    </h3>
                    <p className="text-[#64748B] text-sm">{quote.ticket}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {quote.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-[#94A3B8] text-sm">{quote.customer}</p>
                <p className="text-[#64748B] text-sm">{quote.device}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#1A2642]">
                <span className="text-[#64748B] text-sm">{quote.created}</span>
                <span className="text-[#00FF88] text-lg">${quote.total.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
