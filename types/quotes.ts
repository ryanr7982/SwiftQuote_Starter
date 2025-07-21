// types/quotes.ts

export type QuoteItem = {
  item: string;
  quantity: number;
   width_height: string;
  price: number;
};

export type QuotePayload = {
  user_id: string;
  client_name: string;
  title: string;
  content: string;
  total: number;
  items: QuoteItem[];
};

export type Quote = {
  id: string;
  title: string;
  total: number;
  created_at: string;
  clients: { name: string };
  quote_items: {
    item: string;
    quantity: number;
    width_height: string;
    price: number;
  }[];
};

