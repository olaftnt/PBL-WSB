import { auth } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function POST() {
    await auth.signOut();

    return NextResponse.json({ ok: true });
}