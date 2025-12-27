'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { DeviceList } from '@/components/Devices/DeviceList';
import type { View } from '@/types/view';
import type { DeviceListItem } from '@/types/device';
import type { CustomerListItem } from '@/types/customer';
import { createDevice } from '../_actions/devices';

export default function DevicesClient({
  devices,
  customers,
}: {
  devices: DeviceListItem[];
  customers: Pick<CustomerListItem, 'id' | 'name' | 'phone'>[];
}) {
  const router = useRouter();

  const onNavigate = (view: View, id?: string) => {
    router.push(viewToPath(view, id));
  };

  const onCreate = async (payload: {
    customerId: string;
    name: string;
    model?: string | null;
    serial?: string | null;
    notes?: string | null;
  }) => {
    const created = await createDevice(payload);
    router.refresh();
    return created;
  };

  return (
    <DeviceList
      onNavigate={onNavigate}
      devices={devices}
      customers={customers}
      onCreateDevice={onCreate}
    />
  );
}

