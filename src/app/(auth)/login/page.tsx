'use client';

import { useRouter } from 'next/navigation';
import { Login } from '@/components/Auth/Login';
import { setAuthedCookie } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  return (
    <Login
      onLogin={() => {
        setAuthedCookie();
        router.replace('/dashboard');
      }}
    />
  );
}
