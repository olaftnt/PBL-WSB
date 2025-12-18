import type { View } from '@/types/view';

export function viewToPath(view: View, id?: string): string {
  switch (view) {
    case 'dashboard':
      return '/dashboard';
    case 'tickets':
      return '/tickets';
    case 'ticket-detail':
      return `/tickets/${id ?? '1'}`;
    case 'new-ticket':
      return '/tickets/new';
    case 'customers':
      return '/customers';
    case 'customer-detail':
      return `/customers/${id ?? '1'}`;
    case 'devices':
      return '/devices';
    case 'device-detail':
      return `/devices/${id ?? '1'}`;
    case 'public-status':
      return '/public-status';
    case 'sla':
      return '/sla';
    case 'inventory':
      return '/inventory';
    case 'quotes':
      return '/quotes';
    case 'quote-detail':
      return `/quotes/${id ?? '1'}`;
    case 'admin':
      return '/admin';
    default:
      return '/dashboard';
  }
}
