import { useState } from 'react';
import { LogIn, Ticket } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1B35] to-[#0F1F42] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-2xl mb-4">
            <Ticket className="w-8 h-8 text-[#0C1222]" />
          </div>
          <h1 className="text-white text-3xl mb-2">PBL Pro</h1>
          <p className="text-[#94A3B8]">System zarządzania serwisem IT</p>
          <p className="text-[#64748B] text-sm mt-1">Smart, Fast, Automated.</p>
        </div>

        <div className="bg-[#0C1222] rounded-2xl p-8 border border-[#1A2642] shadow-2xl">
          <h2 className="text-white mb-6">Logowanie</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">Adres e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pblpro.com"
                className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] text-sm mb-2">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[#94A3B8] text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#1A2642] bg-[#121B2D]" />
                Pamiętaj mnie
              </label>
              <button type="button" className="text-[#00FF88] hover:text-[#00CC6A] text-sm transition-colors">
                Zapomniałeś hasła?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#00FF88] to-[#00CC6A] text-[#0C1222] rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Zaloguj się
            </button>
          </form>

          
        </div>

        <p className="text-center text-[#64748B] text-sm mt-6">
          &copy; 2025-2026 PBL Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
