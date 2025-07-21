// pages/api/saveQuote.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { QuoteItem } from '@/types';  // assumes you have types/index.ts exporting QuoteItem

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, user_id, client_name, title, items, total, content } = req.body as {
    id?: string;
    user_id: string;
    client_name: string;
    title: string;
    items: QuoteItem[];
    total: number;
    content: string;
  };

  // Validate required fields
  if (!user_id || !client_name || !title || !items?.length || total == null || content === undefined) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // 1. Upsert client (insert or return existing)
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .upsert(
      [{ name: client_name, user_id }],
      { onConflict: 'name,user_id' }  // <-- comma‑separated string
    )
    .select('*')
    .single();

  if (clientError || !clientData) {
    console.error('Client upsert error:', clientError);
    return res.status(500).json({ message: 'Failed to insert or find client' });
  }

  // 2. Insert or update quote
  let quoteData;
  if (id) {
    // Editing existing quote
    const { data, error } = await supabase
      .from('quotes')
      .update({ user_id, client_id: clientData.id, title, total, content })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) {
      console.error('Quote update error:', error);
      return res.status(500).json({ message: 'Failed to update quote' });
    }
    quoteData = data;
    // Remove old items before re‑inserting new ones
    await supabase.from('quote_items').delete().eq('quote_id', id);
  } else {
    // Creating new quote
    const { data, error } = await supabase
      .from('quotes')
      .insert([{ user_id, client_id: clientData.id, title, total, content }])
      .select('*')
      .single();
    if (error || !data) {
      console.error('Quote insert error:', error);
      return res.status(500).json({ message: 'Failed to insert quote' });
    }
    quoteData = data;
  }

  // 3. Insert quote items
  const quoteItemsPayload = items.map((i: QuoteItem) => ({
    quote_id: quoteData.id,
    item: i.item,
    quantity: i.quantity,
    width_height: i.width_height,
    price: i.price,
  }));

  if (quoteItemsPayload.length) {
    const { error: itemError } = await supabase
      .from('quote_items')
      .insert(quoteItemsPayload);
    if (itemError) {
      console.error('Quote items insert error:', itemError);
      return res.status(500).json({ message: 'Failed to insert quote items' });
    }
  }

  return res.status(200).json({
    message: 'Quote and items saved successfully!',
    quoteId: quoteData.id,
  });
}





