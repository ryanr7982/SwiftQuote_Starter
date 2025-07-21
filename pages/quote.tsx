'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function QuotePage() {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [content, setContent] = useState('');
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage('You must be logged in.');
      setIsError(true);
      return;
    }

    // 🔍 Step 1: Try to find existing client
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', client)
      .single();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // 🆕 Step 2: Insert new client if not found
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert([{ name: client, user_id: user.id }])
        .select()
        .single();

     if (insertError) {
  console.error('Insert client error:', insertError);
  setMessage(`Error creating client: ${insertError.message}`);
  setIsError(true);
  return;
}


      clientId = newClient.id;
    }

    // 🧾 Step 3: Insert quote with valid clientId
    const { error: quoteError } = await supabase.from('quotes').insert([{
  user_id: user.id,
  client_id: clientId,
  title,
  content: JSON.stringify({ text: content }),
  total,
}]);

    if (quoteError) {
  console.error('Quote insert error:', quoteError);
  setMessage(`Error saving quote: ${quoteError.message}`);
  setIsError(true);
  return;
} else {
      setMessage('✅ Quote saved successfully!');
      setIsError(false);
      setTitle('');
      setClient('');
      setContent('');
      setTotal(0);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">📝 Create a New Quote</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Quote Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Motorized Blinds for Office"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Client Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Stark Industries"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Quote Content</label>
            <textarea
              rows={5}
              className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add quote details, installation notes, etc."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Total ($)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 50000"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
          >
            💾 Save Quote
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center font-medium ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}



