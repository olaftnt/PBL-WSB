import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Send, CheckCircle, Download } from 'lucide-react';
import type { View } from '@/types/view';

interface QuoteDetailProps {
  quoteId: string;
  onNavigate: (view: View) => void;
}

export function QuoteDetail({ quoteId, onNavigate }: QuoteDetailProps) {
  const [laborHours, setLaborHours] = useState(2);
  const [laborRate] = useState(50);
  const [parts, setParts] = useState([
    { id: '1', name: 'iPhone 14 Pro Screen', sku: 'SCR-IP14-001', quantity: 1, price: 199.99 },
    { id: '2', name: 'Screen Adhesive', sku: 'ADH-GEN-001', quantity: 1, price: 9.99 },
  ]);

  const isNew = quoteId === 'new';
  const status = isNew ? 'draft' : 'sent';

  const laborCost = laborHours * laborRate;
  const partsCost = parts.reduce((acc, part) => acc + (part.quantity * part.price), 0);
  const subtotal = laborCost + partsCost;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleAddPart = () => {
    setParts([...parts, { 
      id: Date.now().toString(), 
      name: '', 
      sku: '', 
      quantity: 1, 
      price: 0 
    }]);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('quotes')}
            className="p-2 text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl mb-1">
              {isNew ? 'New Quote' : `Quote ${quoteId}`}
            </h1>
            <p className="text-[#94A3B8]">{isNew ? 'Create repair estimate' : 'Quote Details'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <>
              <button className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#00D9FF] to-[#0099CC] text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send to Customer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Ticket Info */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Quote Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Ticket Number</label>
                <input
                  type="text"
                  defaultValue="TK-2024-1247"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Customer</label>
                <input
                  type="text"
                  defaultValue="John Smith"
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Labor */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <h3 className="text-white mb-4">Labor</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Rate ($/hr)</label>
                <input
                  type="number"
                  value={laborRate}
                  disabled
                  className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] text-sm mb-2">Total</label>
                <div className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88]">
                  ${laborCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Parts */}
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Parts</h3>
              <button
                onClick={handleAddPart}
                className="px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Part
              </button>
            </div>
            <div className="space-y-3">
              {parts.map((part) => (
                <div key={part.id} className="bg-[#121B2D] rounded-lg p-4 border border-[#1A2642]">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <label className="block text-[#94A3B8] text-xs mb-2">Part Name</label>
                      <input
                        type="text"
                        value={part.name}
                        onChange={(e) => {
                          setParts(parts.map(p => p.id === part.id ? { ...p, name: e.target.value } : p));
                        }}
                        placeholder="Select or enter part..."
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[#94A3B8] text-xs mb-2">Qty</label>
                      <input
                        type="number"
                        value={part.quantity}
                        onChange={(e) => {
                          setParts(parts.map(p => p.id === part.id ? { ...p, quantity: parseInt(e.target.value) } : p));
                        }}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[#94A3B8] text-xs mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={part.price}
                        onChange={(e) => {
                          setParts(parts.map(p => p.id === part.id ? { ...p, price: parseFloat(e.target.value) } : p));
                        }}
                        className="w-full px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-white text-sm focus:outline-none focus:border-[#00FF88] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[#94A3B8] text-xs mb-2">Total</label>
                      <div className="px-3 py-2 bg-[#0C1222] border border-[#1A2642] rounded text-[#00FF88] text-sm">
                        ${(part.quantity * part.price).toFixed(2)}
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
            <h3 className="text-white mb-4">Notes / Terms</h3>
            <textarea
              placeholder="Add any additional notes or terms for the customer..."
              rows={4}
              className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Quote Summary */}
        <div className="space-y-6">
          <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg sticky top-6">
            <h3 className="text-white mb-6">Quote Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Labor</span>
                <span className="text-white">${laborCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Parts</span>
                <span className="text-white">${partsCost.toFixed(2)}</span>
              </div>
              <div className="h-px bg-[#1A2642]"></div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Tax (8%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-[#1A2642]"></div>
              <div className="flex items-center justify-between">
                <span className="text-white">Total</span>
                <span className="text-[#00FF88] text-2xl">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Save Quote
              </button>
              <button className="w-full py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#94A3B8] hover:text-white hover:border-[#00FF88] transition-colors">
                Save as Draft
              </button>
            </div>
          </div>

          {!isNew && status === 'sent' && (
            <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg">
              <h3 className="text-white mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-lg">
                  <Send className="w-5 h-5 text-[#00D9FF]" />
                  <div>
                    <p className="text-[#00D9FF] text-sm">Sent to Customer</p>
                    <p className="text-[#64748B] text-xs">2024-12-09 14:30</p>
                  </div>
                </div>
                <p className="text-[#94A3B8] text-sm">
                  Awaiting customer response...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
