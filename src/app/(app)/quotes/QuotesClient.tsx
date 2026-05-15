'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import type { QuoteListItem } from '@/types/quote';
import { QuoteList } from '@/components/Quotes/QuoteList';

export default function QuotesClient({
  quotes,
  stats,
}: {
  quotes: QuoteListItem[];
  stats: { total: number; sent: number; accepted: number; rejected: number; pendingCustomer: number };
}) {
  const router = useRouter();
  const onNavigate = (view: any, id?: string) => router.push(viewToPath(view, id));
  return <QuoteList onNavigate={onNavigate} quotes={quotes} stats={stats} />;
}

