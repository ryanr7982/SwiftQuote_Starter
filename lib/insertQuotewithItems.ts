// lib/insertQuoteWithItems.ts
import { supabase } from './supabaseClient';
import { QuotePayload } from '@/types';

export async function insertQuoteWithItems(quoteData: QuotePayload) {
  const { user_id, client_id, title, total, items } = quoteData;

  const quoteInsertRes = await supabase
    .from('quotes')
    .insert([{ user_id, client_id, title, total }])
    .select('id')
    .single();

  if (quoteInsertRes.error) {
    console.error('Error inserting quote:', quoteInsertRes.error.message);
    return { error: quoteInsertRes.error };
  }

  const quoteId = quoteInsertRes.data.id;

  const itemInserts = items.map(item => ({
    quote_id: quoteId,
    item: item.item,
    quantity: item.quantity,
    width_height: item.width_height,
    price: item.price,
  }));

  const itemInsertRes = await supabase
    .from('quote_items')
    .insert(itemInserts);

  if (itemInsertRes.error) {
    console.error('Error inserting quote items:', itemInsertRes.error.message);
    return { error: itemInsertRes.error };
  }

  return { success: true, quoteId };
}
