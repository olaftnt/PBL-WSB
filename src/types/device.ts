export type DeviceListItem = {
  id: string;
  name: string;
  model: string | null;
  serial: string | null;
  customerId: string;
  customerName: string;
  tickets: number;
  isDeleted?: boolean;
  createdAt: string;
};

