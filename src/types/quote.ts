import type { QuoteStatus } from '@prisma/client';

export type QuoteItemInput = {
  id: string;
  partId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type QuoteListItem = {
  id: string;
  number: string;
  status: QuoteStatus;
  customerName: string;
  ticketNumber: string;
  deviceName?: string | null;
  notes?: string | null;
  totalGross: number;
  createdAt: string;
};

export type QuoteDetailData = {
  id: string;
  number: string;
  status: QuoteStatus;
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  deviceId?: string | null;
  deviceName?: string | null;
  laborHours: number;
  laborRate: number;
  vatRate: number;
  notes?: string | null;
  items: Array<{
    id: string;
    partId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  totals: {
    labor: number;
    parts: number;
    net: number;
    vat: number;
    gross: number;
  };
};

export type PartOption = {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  reserved: number;
};

export type TicketOption = {
  id: string;
  number: string;
  customerId?: string | null;
  customerName?: string | null;
};

export type CustomerOption = {
  id: string;
  name: string;
};

