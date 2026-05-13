'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signUpWithEmail(
    _prevState: { error: string } | null,
    formData: FormData
) {
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    if (!name || !email || !password) {
        return {
            error: 'Podaj imię, e-mail i hasło.',
        };
    }

    if (password.length < 8) {
        return {
            error: 'Hasło powinno mieć minimum 8 znaków.',
        };
    }

    const { error } = await auth.signUp.email({
        name,
        email,
        password,
    });

    if (error) {
        return {
            error: error.message || 'Nie udało się utworzyć konta.',
        };
    }

    redirect('/dashboard');
}