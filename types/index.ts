// types/index.ts

/** A single line item on a quote */
export type QuoteItem = {
  item: string;
  quantity: number;
  width_height: string;
  price: number;
};

/** Payload shape expected by insertQuoteWithItems */
export interface QuotePayload {
  user_id: string;
  client_id: string;
  title: string;
  total: number;
  items: QuoteItem[];
}
