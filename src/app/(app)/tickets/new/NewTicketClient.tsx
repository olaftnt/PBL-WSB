'use client';

import { useRouter } from 'next/navigation';

import { NewTicket } from '@/components/TicketManagement/NewTicket';

import { createTicket } from '../../_actions/tickets';
import { createCustomer, type CreateCustomerInput } from '../../_actions/customers';
import { createDevice } from '../../_actions/devices';

type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Device = {
  id: string;
  customerId: string;
  name: string;
  serial?: string | null;
  model?: string | null;
  notes?: string | null;
};

type CreateDevicePayload = {
  customerId: string;
  name: string;
  model?: string | null;
  serial?: string | null;
  notes?: string | null;
};

export default function NewTicketClient({
  customers,
  devices,
}: {
  customers: Customer[];
  devices: Device[];
}) {
  const router = useRouter();

  return (
    <NewTicket
      customers={customers}
      devices={devices}
      onCancel={() => router.push('/tickets')}
      onCreated={(ticketId: string) => router.push(`/tickets/${ticketId}`)}
      onCreate={async (payload) => {
        // payload ma już priorytet/sla/status itd. mapowane w komponencie
        return await createTicket(payload);
      }}
      onCreateCustomer={async (payload: CreateCustomerInput) => {
        // phone jest wymagany (string) – zgodnie z Twoją akcją
        return await createCustomer(payload);
      }}
      onCreateDevice={async (payload: CreateDevicePayload) => {
        return await createDevice(payload);
      }}
    />
  );
}
