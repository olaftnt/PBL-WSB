export type CustomerListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  joined: string;
  tickets: number;
  activeTickets: number;
};

