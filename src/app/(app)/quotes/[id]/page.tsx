'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { QuoteDetail } from '@/components/Quotes/QuoteDetail';

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const onNavigate = (view: any, id?: string) => router.push(viewToPath(view, id));
  return <QuoteDetail quoteId={params.id} onNavigate={onNavigate} />;
}
