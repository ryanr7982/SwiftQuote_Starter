// pages/dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CreateQuoteForm from '@/components/CreateQuoteForm';
import {
  exportQuoteAsPDF,
  exportQuoteAsCSV,
  exportAllQuotesAsCSV
} from '@/lib/exportQuote';

type Quote = {
  id: string;
  user_id?: string;
  title: string;
  total: number;
  created_at: string;
  content?: string;
  clients: { name: string };
  quote_items: {
    item: string;
    quantity: number;
    width_height: string;
    price: number;
  }[];
};

function EditQuoteModal({
  quote,
  onSave,
  onClose
}: {
  quote: Quote | null;
  onSave: (updated: Quote) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(quote?.title || '');
  const [content, setContent] = useState(quote?.content || '');
  const [items, setItems] = useState(quote?.quote_items || []);

  useEffect(() => {
    if (quote) {
      setTitle(quote.title);
      setContent(quote.content || '');
      setItems(quote.quote_items || []);
    }
  }, [quote]);

  const updateItem = (i: number, field: string, value: string | number) => {
    setItems(items =>
      items.map((it, idx) =>
        idx === i
          ? {
              ...it,
              [field]: field === 'quantity' || field === 'price' ? parseFloat(value as string) || 0 : value
            }
          : it
      )
    );
  };

  const addItem = () => setItems([...items, { item: '', quantity: 1, width_height: '', price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const total = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);

  const handleSave = async () => {
    const res = await fetch('/api/saveQuote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: quote?.id,
        user_id: quote?.user_id,
        client_name: quote?.clients?.name,
        title,
        total,
        content,
        items,
      }),
    });
    if (res.ok) {
      onSave({
        ...quote!,
        title,
        total,
        content,
        quote_items: items,
      });
      onClose();
    } else {
      alert('Failed to update quote');
    }
  };

  if (!quote) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-8 max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4">Edit Quote</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border mb-4 p-2 rounded" placeholder="Quote Title" />
        <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border mb-4 p-2 rounded" placeholder="Quote Notes" rows={2} />
        <table className="w-full text-sm border mb-2">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-2">Item</th>
              <th className="p-2">Qty</th>
              <th className="p-2">W x H</th>
              <th className="p-2">Price</th>
              <th className="p-2">Ext. Price</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="p-2"><input value={item.item} onChange={e => updateItem(i, 'item', e.target.value)} className="border rounded px-1 py-1 w-full" /></td>
                <td className="p-2"><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="border rounded px-1 py-1 w-full" /></td>
                <td className="p-2"><input value={item.width_height} onChange={e => updateItem(i, 'width_height', e.target.value)} className="border rounded px-1 py-1 w-full" /></td>
                <td className="p-2"><input type="number" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} className="border rounded px-1 py-1 w-full" /></td>
                <td className="p-2">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                <td className="p-2 text-center">
                  <button onClick={() => removeItem(i)} className="text-red-600">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mb-4">
          <button type="button" onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded">➕ Add Row</button>
          <span className="font-semibold text-lg">Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-green-600 text-white">💾 Save</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filtered, setFiltered] = useState<Quote[]>([]);
  const [clientFilter, setClientFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [user, setUser] = useState<any>(null);
  const [editQuote, setEditQuote] = useState<Quote | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, []);

  const fetchQuotes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        id, 
        user_id,
        title, 
        total, 
        created_at, 
        content,
        clients(name), 
        quote_items(item, quantity, width_height, price)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuotes(data);
      setFiltered(data);
    }
  };

  useEffect(() => {
    if (user) fetchQuotes();
  }, [user]);

  const applyFilters = () => {
    const filteredData = quotes.filter((q) => {
      const clientMatch =
        clientFilter === '' ||
        q.clients?.name.toLowerCase().includes(clientFilter.toLowerCase());
      const date = new Date(q.created_at);
      const afterStart = !startDate || date >= new Date(startDate);
      const beforeEnd = !endDate || date <= new Date(endDate);
      return clientMatch && afterStart && beforeEnd;
    });
    setFiltered(filteredData);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
    if (!error) {
      setQuotes(quotes => quotes.filter(q => q.id !== quoteId));
      setFiltered(filtered => filtered.filter(q => q.id !== quoteId));
    } else {
      alert('Failed to delete quote');
    }
  };

  // After editing a quote and saving
  const handleSaveEditedQuote = (updatedQuote: Quote) => {
    setQuotes(prev =>
      prev.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
    setFiltered(prev =>
      prev.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
    fetchQuotes(); // To fully sync
  };

  return (
    <main className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">
        📊 Your Quotes Dashboard
      </h1>

      {/* FILTERS */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Filter by client name"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-4 py-2 rounded border w-full"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 rounded border w-full"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 rounded border w-full"
        />
        <button
          onClick={applyFilters}
          className="md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          Apply Filters
        </button>
      </div>

      {/* CSV Export */}
      {filtered.length > 0 && (
        <div className="mb-4 text-right">
          <button
            onClick={() => exportAllQuotesAsCSV(filtered)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
          >
            📥 Download All as CSV
          </button>
        </div>
      )}

      {/* QUOTE LIST */}
      <div className="grid gap-4">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500">No quotes found.</p>
        )}
        {filtered.map((quote) => (
          <div
            key={quote.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{quote.title}</h2>
              <span className="text-sm text-gray-500">
                {new Date(quote.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Client: <strong>{quote.clients?.name}</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total: <strong>${quote.total.toLocaleString()}</strong>
            </p>
            {quote.content && (
              <div className="my-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-400 rounded shadow-sm text-blue-900 dark:text-blue-100 text-sm whitespace-pre-line">
                <strong>Notes:</strong><br />
                {typeof quote.content === 'string'
                  ? quote.content
                  : quote.content.text || ''}
              </div>
            )}
            {/* QUOTE ITEMS TABLE */}
            {quote.quote_items?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Items</h3>
                <table className="w-full text-sm border rounded overflow-hidden">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">W x H</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Ext. Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.quote_items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{item.item}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{item.width_height}</td>
                        <td className="p-2">${item.price.toFixed(2)}</td>
                        <td className="p-2">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* EXPORT, EDIT, DELETE BUTTONS */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => exportQuoteAsPDF(quote)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
              >
                🧾 PDF
              </button>
              <button
                onClick={() => exportQuoteAsCSV(quote)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded"
              >
                📄 CSV
              </button>
              <button
                onClick={() => setEditQuote(quote)}
                className="bg-blue-500 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDeleteQuote(quote.id)}
                className="bg-red-600 hover:bg-red-800 text-white text-sm px-3 py-1 rounded"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT QUOTE MODAL */}
      {editQuote && (
        <EditQuoteModal
          quote={editQuote}
          onSave={handleSaveEditedQuote}
          onClose={() => setEditQuote(null)}
        />
      )}

      {/* CREATE QUOTE FORM */}
      {user && (
        <div className="max-w-2xl mx-auto mt-12">
          <CreateQuoteForm
            userId={user.id}
            onSaved={fetchQuotes}
          />
        </div>
      )}
    </main>
  );
}




