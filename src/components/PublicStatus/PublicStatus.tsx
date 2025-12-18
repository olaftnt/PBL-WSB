'use client';

import { useState } from 'react';
import { Search, CheckCircle, Clock, Package, Truck, Mail, Phone } from 'lucide-react';

export function PublicStatus() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResult(true);
  };

  const mockStatus = {
    ticketId: 'TK-2024-1247',
    device: 'MacBook Pro 16"',
    status: 'repair',
    created: '2024-12-09 09:30',
    estimatedCompletion: '2024-12-09 21:30',
    currentStep: 2,
    steps: [
      { id: 1, label: 'Received', status: 'completed', date: '2024-12-09 09:30' },
      { id: 2, label: 'Diagnosis', status: 'completed', date: '2024-12-09 11:00' },
      { id: 3, label: 'Repair in Progress', status: 'current', date: '2024-12-09 14:30' },
      { id: 4, label: 'Testing', status: 'pending', date: null },
      { id: 5, label: 'Ready for Pickup', status: 'pending', date: null },
    ],
    estimatedCost: '$299.00',
    notes: 'Screen replacement in progress. Parts have been ordered and received.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1B35] to-[#0F1F42] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {!showResult ? (
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-3xl mb-6">
                <Search className="w-10 h-10 text-[#0C1222]" />
              </div>
              <h1 className="text-white text-4xl mb-3">Check Repair Status</h1>
              <p className="text-[#94A3B8] text-lg">Track your device repair in real-time</p>
            </div>

            <div className="bg-[#0C1222] rounded-2xl p-8 border border-[#1A2642] shadow-2xl">
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-[#94A3B8] mb-3">Ticket Number</label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="TK-2024-XXXX"
                    className="w-full px-6 py-4 bg-[#121B2D] border border-[#1A2642] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors text-center text-lg"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1A2642]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[#0C1222] text-[#64748B] text-sm">AND</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-3">Email or Phone Number</label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="your@email.com or +1 234 567 8900"
                    className="w-full px-6 py-4 bg-[#121B2D] border border-[#1A2642] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors text-center text-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 text-lg"
                >
                  <Search className="w-6 h-6" />
                  Check Status
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-[#1A2642]">
                <p className="text-[#64748B] text-sm text-center mb-4">Need Help?</p>
                <div className="flex items-center justify-center gap-6">
                  <a href="mailto:support@itsm.com" className="flex items-center gap-2 text-[#00D9FF] hover:text-[#00B4CC] transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">support@itsm.com</span>
                  </a>
                  <a href="tel:+12345678900" className="flex items-center gap-2 text-[#00FF88] hover:text-[#00CC6A] transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+1 234 567 8900</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowResult(false)}
              className="mb-6 text-[#94A3B8] hover:text-white transition-colors"
            >
              ← Back to Search
            </button>

            <div className="bg-[#0C1222] rounded-2xl p-8 border border-[#1A2642] shadow-2xl">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-white text-2xl mb-2">{mockStatus.ticketId}</h2>
                  <p className="text-[#94A3B8]">{mockStatus.device}</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">
                  In Progress
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <h3 className="text-white mb-6">Repair Progress</h3>
                <div className="relative">
                  {mockStatus.steps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-6 pb-8 last:pb-0">
                      {/* Line */}
                      {index < mockStatus.steps.length - 1 && (
                        <div className={`absolute left-6 top-12 w-0.5 h-full ${
                          step.status === 'completed' ? 'bg-[#00FF88]' : 'bg-[#1A2642]'
                        }`}></div>
                      )}

                      {/* Icon */}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-[#00FF88]' :
                        step.status === 'current' ? 'bg-[#FF6B35]' :
                        'bg-[#121B2D] border-2 border-[#1A2642]'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-[#0C1222]" />
                        ) : step.status === 'current' ? (
                          <Clock className="w-6 h-6 text-white" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-[#64748B]"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <h4 className={`mb-1 ${
                          step.status === 'completed' ? 'text-[#00FF88]' :
                          step.status === 'current' ? 'text-white' :
                          'text-[#64748B]'
                        }`}>
                          {step.label}
                        </h4>
                        {step.date && (
                          <p className="text-[#64748B] text-sm">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#121B2D] rounded-xl p-6 border border-[#1A2642]">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-[#00D9FF]" />
                    <p className="text-[#64748B] text-sm">Estimated Completion</p>
                  </div>
                  <p className="text-white text-lg">{mockStatus.estimatedCompletion}</p>
                </div>
                <div className="bg-[#121B2D] rounded-xl p-6 border border-[#1A2642]">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-[#00FF88]" />
                    <p className="text-[#64748B] text-sm">Estimated Cost</p>
                  </div>
                  <p className="text-white text-lg">{mockStatus.estimatedCost}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#121B2D] rounded-xl p-6 border border-[#1A2642] mb-8">
                <h4 className="text-white mb-3">Latest Update</h4>
                <p className="text-[#94A3B8]">{mockStatus.notes}</p>
              </div>

              {/* Alert */}
              <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#00CC6A]/5 border border-[#00FF88]/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-[#00FF88] mt-1" />
                  <div>
                    <h4 className="text-[#00FF88] mb-2">We will notify you</h4>
                    <p className="text-[#94A3B8] text-sm">
                      You&apos;ll receive an email and SMS when your device is ready for pickup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
