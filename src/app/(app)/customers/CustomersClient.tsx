'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { CustomerList } from '@/components/Customers/CustomerList';
import type { View } from '@/types/view';
import type { CustomerListItem } from '@/types/customer';
import { createCustomer, type CreateCustomerInput } from '../_actions/customers';

export default function CustomersClient({
  initialCustomers,
}: {
  initialCustomers: CustomerListItem[];
}) {
  const router = useRouter();

  const onNavigate = (view: View, id?: string) => {
    router.push(viewToPath(view, id));
  };

  const onCreate = async (payload: CreateCustomerInput) => {
    const created = await createCustomer(payload);
    // Odświeżenie strony pobiera z serwera zaktualizowaną listę
    router.refresh();
    return created;
  };

  return (
    <CustomerList
      onNavigate={onNavigate}
      onCreateCustomer={onCreate}
      customers={initialCustomers}
    />
  );
}

