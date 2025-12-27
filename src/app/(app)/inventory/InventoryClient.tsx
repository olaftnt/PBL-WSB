'use client';

import { useRouter } from 'next/navigation';
import { InventoryList } from '@/components/Inventory/InventoryList';
import type { PartListItem, TicketOption } from '@/types/inventory';
import { createPart, updatePart, reservePart, consumePart } from '../_actions/inventory';

export default function InventoryClient({
  parts,
  tickets,
}: {
  parts: PartListItem[];
  tickets: TicketOption[];
}) {
  const router = useRouter();

  const onCreate = async (payload: {
    sku: string;
    name: string;
    quantity: number;
    minQuantity: number;
    price: number;
  }) => {
    const created = await createPart(payload);
    router.refresh();
    return created;
  };

  const onUpdate = async (id: string, payload: Partial<{
    sku: string;
    name: string;
    quantity: number;
    minQuantity: number;
    price: number;
  }>) => {
    const updated = await updatePart(id, payload);
    router.refresh();
    return updated;
  };

  const onReserve = async (partId: string, ticketId: string, quantity: number) => {
    const res = await reservePart(partId, ticketId, quantity);
    router.refresh();
    return res;
  };

  const onConsume = async (partId: string, quantity: number) => {
    const res = await consumePart(partId, quantity);
    router.refresh();
    return res;
  };

  return (
    <InventoryList
      parts={parts}
      tickets={tickets}
      onCreatePart={onCreate}
      onUpdatePart={onUpdate}
      onReserve={onReserve}
      onConsume={onConsume}
    />
  );
}

