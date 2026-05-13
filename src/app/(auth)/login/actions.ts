'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signInWithEmail(
    _prevState: { error: string } | null,
    formData: FormData
) {
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    if (!email || !password) {
        return {
            error: 'Podaj adres e-mail i hasło.',
        };
    }

    const { error } = await auth.signIn.email({
        email,
        password,
    });

    if (error) {
        return {
            error: error.message || 'Nie udało się zalogować.',
        };
    }

    redirect('/dashboard');
}