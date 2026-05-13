'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUpWithEmail } from './actions';

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

    return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#0F172A] border border-[#1A2642] rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-white mb-6">
            Utwórz konto
    </h1>

    <form action={formAction} className="space-y-5">
    <div>
        <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
        Imię i nazwisko
    </label>
    <input
    name="name"
    required
    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white"
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
        E-mail
        </label>
        <input
    name="email"
    type="email"
    required
    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white"
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">
        Hasło
        </label>
        <input
    name="password"
    type="password"
    required
    minLength={8}
    className="w-full px-4 py-3 bg-[#121B2D] border border-[#1A2642] rounded-lg text-white"
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
    className="w-full px-4 py-3 bg-[#00FF88] text-[#0B1220] rounded-lg font-semibold disabled:opacity-60"
        >
        {isPending ? 'Tworzenie konta...' : 'Zarejestruj'}
        </button>
        </form>

        <p className="mt-6 text-sm text-[#94A3B8]">
        Masz już konto?{' '}
        <Link href="/login" className="text-[#00FF88]">
        Zaloguj się
    </Link>
    </p>
    </div>
    </div>
);
}