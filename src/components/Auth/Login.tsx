'use client';

import { useActionState } from 'react';
import { LogIn, Ticket } from 'lucide-react';
import { signInWithEmail } from '@/app/(auth)/login/actions';

export function Login() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF88]/10 rounded-2xl mb-4">
              <Ticket className="w-8 h-8 text-[#00FF88]" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">PBL Pro</h1>
            <p className="text-[#94A3B8]">System zarządzania serwisem IT</p>
            <p className="text-[#64748B] text-sm mt-2">Smart, Fast, Automated.</p>
          </div>

          <div className="bg-[#0F172A] border border-[#1A2642] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6">Logowanie</h2>

            <form action={formAction} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
                  Adres e-mail
                </label>
                <input
                    name="email"
                    type="email"
                    placeholder="admin@pblpro.com"
                    required
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
                  Hasło
                </label>
                <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
                />
              </div>

              {state?.error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {state.error}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00FF88] text-[#0B1220] rounded-lg font-semibold hover:bg-[#00E67A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <LogIn className="w-5 h-5" />
                {isPending ? 'Logowanie...' : 'Zaloguj się'}
              </button>
            </form>
          </div>

          <p className="text-center text-[#64748B] text-sm mt-8">
            © 2025-2026 PBL Pro. All rights reserved.
          </p>
        </div>
      </div>
  );
}