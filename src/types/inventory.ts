export type PartListItem = {
  id: string;
  sku: string;
  name: string;
  warehouseLocation: string | null;
  quantity: number;
  minQuantity: number;
  price: number;
  reserved: number;
  status: 'ok' | 'low' | 'critical';
  createdAt: string;
};

export type TicketOption = {
  id: string;
  number: string;
  title?: string | null;
};

