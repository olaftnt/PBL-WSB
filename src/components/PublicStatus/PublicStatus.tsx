'use client';

import { useState } from 'react';
import { Search, CheckCircle, Clock, ClockFading, Package, Truck, Mail, Phone, CircleX, PackageCheck, Wrench, BaggageClaim } from 'lucide-react';

export function PublicStatus() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/PublicStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketNumber, contactInfo }),
    });

    if (!res.ok) {
      setError('Nie znaleziono zgłoszenia');
      return;
    }

    const data = await res.json();
    setResult(data);
    setShowResult(true);
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
              <h1 className="text-white text-4xl mb-3">Sprawdź status naprawy</h1>
              <p className="text-[#94A3B8] text-lg"></p>
            </div>

            <div className="bg-[#0C1222] rounded-2xl p-8 border border-[#1A2642] shadow-2xl">
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-[#94A3B8] mb-3">Numer zlecenia</label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="Numer zlecenia np. INC000001"
                    className="w-full px-6 py-4 bg-[#121B2D] border border-[#1A2642] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors text-center text-lg"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1A2642]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[#0C1222] text-[#64748B] text-sm">I</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-3">E-Mail albo numer telefonu</label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="adres e-mail lub numer telefonu"
                    className="w-full px-6 py-4 bg-[#121B2D] border border-[#1A2642] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors text-center text-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 text-lg"
                >
                  <Search className="w-6 h-6" />
                  Sprawdź status
                </button>
              </form>

              {error && <p className="text-red-500 text-center mt-4">{error}</p>}

              <div className="mt-8 pt-8 border-t border-[#1A2642]">
                <p className="text-[#64748B] text-sm text-center mb-4">Potrzebujesz pomocy?</p>
                <div className="flex items-center justify-center gap-6">
                  <a href="mailto:wsparcie@serwisit.com" className="flex items-center gap-2 text-[#00D9FF] hover:text-[#00B4CC] transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">wsparcie@serwisit.com</span>
                  </a>
                  <a href="tel:+48111222333" className="flex items-center gap-2 text-[#00FF88] hover:text-[#00CC6A] transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+48 111 222 333</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          result && (
            <div>
              <button
                onClick={() => setShowResult(false)}
                className="mb-6 text-[#94A3B8] hover:text-white transition-colors"
              >
                ← Cofnij do wyszukiwania
              </button>

              <div className="bg-[#0C1222] rounded-2xl p-8 border border-[#1A2642] shadow-2xl">
                
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-white text-2xl mb-2">{result.number}</h2>
                    <p className="text-[#94A3B8]">{result.device}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    result.status === 'IN_PROGRESS' ? 'bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20' :
                    result.status === 'DONE' ? 'bg-[#00FF88]/10 text-[#00CC6A] border border-[#00FF88]/20' :
                    result.status === 'CANCELED' ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' :
                    result.status === 'WAITING' ? 'bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20' :
                    result.status === 'NEW' ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/20' :
                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {result.status === 'IN_PROGRESS' ? 'W trakcie naprawy' :
                     result.status === 'DONE' ? 'Gotowe do odbioru' :
                     result.status === 'CANCELED' ? 'Anulowane' :
                     result.status === 'NEW' ? 'Otrzymano zgłoszenie' :
                     result.status === 'WAITING' ? 'Oczekujące na części' :
                     result.status}
                  </div>
                </div>

                
                <div className="mb-8">
                  <h3 className="text-white mb-6">Historia statusów</h3>
                  <div className="relative">
                    {result.events.map((step: any, index: number) => {
                      let bgColor = '';
                      let textColor = '';
                      switch (step.newStatus) {
                        case 'DONE':
                          bgColor = 'bg-[#00FF88]';
                          textColor = 'text-[#00FF88]';
                          break;
                        case 'IN_PROGRESS':
                          bgColor = 'bg-[#A855F7]';
                          textColor = 'text-[#A855F7]';
                          break;
                        case 'WAITING':
                          bgColor = 'bg-[#FACC15]';
                          textColor = 'text-[#FACC15]';
                          break;
                        case 'CANCELED':
                          bgColor = 'bg-[#EF4444]';
                          textColor = 'text-[#EF4444]';
                          break;
                        case 'NEW':
                          bgColor = 'bg-[#00D9FF]';
                          textColor = 'text-[#00D9FF]';
                          break;
                        default:
                          if (step.type === 'CREATED') {
                            bgColor = 'bg-[#00FF88]';
                            textColor = 'text-[#00FF88]';
                          } else {
                            bgColor = 'bg-[#121B2D] border-2 border-[#1A2642]';
                            textColor = 'text-[#64748B]';
                          }
                      }

                      return (
                        <div key={step.id} className="relative flex gap-6 pb-8 last:pb-0">
                          
                          {index < result.events.length - 1 && (
                            <div
                              className={`absolute left-6 top-12 w-0.5 h-full ${bgColor.includes('bg-[#121B2D]') ? 'bg-[#1A2642]' : bgColor}`}
                            ></div>
                          )}

                          
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
                            {(() => {
                              if (step.newStatus === 'DONE') return <PackageCheck className="w-6 h-6 text-[#0C1222]" />;
                              if (step.newStatus === 'IN_PROGRESS') return <Wrench className="w-6 h-6 text-[#0C1222]" />;
                              if (step.newStatus === 'WAITING') return <ClockFading className="w-6 h-6 text-[#0C1222]" />;
                              if (step.newStatus === 'CANCELED') return <CircleX className="w-6 h-6 text-[#0C1222]" />;
                              if (step.newStatus === 'NEW') return <BaggageClaim className="w-6 h-6 text-[#0C1222]" />;
                              if (step.type === 'CREATED') return <CheckCircle className="w-6 h-6 text-[#0C1222]" />;
                            })()}
                          </div>

                          
                          <div className="flex-1 pt-2">
                            <h4 className={`mb-1 ${textColor}`}>{step.statusMessage}</h4>
                            {step.createdAt && (
                              <p className="text-[#64748B] text-sm">
                                {step.createdAt.slice(0, 16).replace('T', ' ')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#121B2D] rounded-xl p-6 border border-[#1A2642]">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-[#00D9FF]" />
                      <p className="text-[#94A3B8] text-sm">Szacowany czas zakończenia</p>
                    </div>
                    <p className="text-[#94A3B8] text-sm">{result.estimatedCompletion}</p>
                  </div>
                  <div className="bg-[#121B2D] rounded-xl p-6 border border-[#1A2642]">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-[#00FF88]" />
                      <p className="text-[#64748B] text-sm">Szacowany koszt</p>
                    </div>
                    <p className="text-white text-lg">{result.estimatedCost}</p>
                  </div>
                </div>

              

                <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#00CC6A]/5 border border-[#00FF88]/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Truck className="w-6 h-6 text-[#00FF88] mt-1" />
                    <div>
                      <h4 className="text-[#00FF88] mb-2">Powiadomimy Cię</h4>
                      <p className="text-[#94A3B8] text-sm">
                        Otrzymasz e-mail i SMS, gdy sprzęt będzie gotowy do odbioru.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
