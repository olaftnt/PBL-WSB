'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface SLAWidgetProps {
  onNavigate?: (view: any, id?: string) => void;
}

export default function SLAWidget({ onNavigate }: SLAWidgetProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTickets(data);
        } else {
          setTickets([]); 
        }
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg h-full animate-pulse flex flex-col justify-center">
       <div className="h-4 bg-[#1A2642] rounded w-1/2 mb-4"></div>
       <div className="h-12 bg-[#1A2642] rounded w-full"></div>
    </div>
  );

  if (error) return (
    <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg h-full flex items-center justify-center text-red-400 text-sm">
       Błąd ładowania danych SLA
    </div>
  );

  return (
    <div className="bg-[#0C1222] rounded-xl p-6 border border-[#1A2642] shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white flex items-center gap-2 font-medium">
           Terminy SLA <Clock className="w-4 h-4 text-[#FFB800]" />
        </h3>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
        {tickets.length === 0 ? (
           <div className="text-[#94A3B8] text-sm text-center py-8 flex flex-col items-center">
              <span className="text-2xl mb-2">🌴</span>
              Wszystko na czas
           </div>
        ) : (
          tickets.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onNavigate && onNavigate('ticket-detail', item.id)}
              className="bg-[#121B2D] rounded-lg p-3 border border-[#1A2642] hover:border-[#00D9FF]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#00D9FF] text-xs font-mono bg-[#00D9FF]/10 px-1.5 py-0.5 rounded border border-[#00D9FF]/20">
                  {item.number}
                </span>
                
                {item.status === 'BREACHED' && (
                  <div className="flex items-center gap-1 text-[#FF6B35] text-[10px] font-bold uppercase">
                    <AlertTriangle className="w-3 h-3" /> Po czasie
                  </div>
                )}
                {item.status === 'RISK' && (
                  <div className="flex items-center gap-1 text-[#FFB800] text-[10px] font-bold uppercase">
                    <AlertCircle className="w-3 h-3" /> Ryzyko
                  </div>
                )}
                {item.status === 'OK' && (
                   <div className="flex items-center gap-1 text-[#00FF88] text-[10px] font-bold uppercase">
                    W toku
                  </div>
                )}
              </div>
              <div className="flex justify-between items-end mt-2">
                 <p className="text-[#94A3B8] text-xs truncate max-w-[120px]">{item.customerName}</p>
                 <p className={`text-xs font-bold ${
                    item.status === 'BREACHED' ? 'text-[#FF6B35]' : 
                    item.status === 'RISK' ? 'text-[#FFB800]' : 'text-[#00FF88]'
                 }`}>
                   {formatDistanceToNow(new Date(item.deadline), { addSuffix: true, locale: pl })}
                 </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#1A2642]">
        <Link 
          href="/sla"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#121B2D] border border-[#1A2642] rounded-lg text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors text-sm font-medium group"
        >
          Pełny Panel SLA
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}