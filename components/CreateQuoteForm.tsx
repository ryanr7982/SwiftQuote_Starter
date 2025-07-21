'use client';

import { useState } from 'react';
import { QuoteItem } from '@/types/quotes';
import { useRouter } from 'next/navigation';

export default function CreateQuoteForm({ userId }: { userId: string }) {
  const [clientName, setClientName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    { item: '', quantity: 1, width_height: '', price: 0 },
  ]);
  const router = useRouter();

  // Update an item
  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updated = [...items];
    if (field === 'quantity' || field === 'price') {
      updated[index][field] = parseFloat(value as string) || 0;
    } else {
      updated[index][field] = value as string;
    }
    setItems(updated);
  };

  // Add a new item row
  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, width_height: '', price: 0 }]);
  };

  // Delete an item row
  const removeItem = (index: number) => {
    if (items.length === 1) return; // Always keep at least one row
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Clear all items (optional)
  const clearAllItems = () => {
    setItems([{ item: '', quantity: 1, width_height: '', price: 0 }]);
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleSubmit = async () => {
    const res = await fetch('/api/saveQuote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        client_name: clientName,
        title,
        content,
        total,
        items,
      }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Failed to save quote');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create New Quote</h2>
      <input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        className="w-full mb-2 border px-3 py-2 rounded"
      />
      <input
        placeholder="Quote Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-2 border px-3 py-2 rounded"
      />
      <textarea
        placeholder="Quote Notes"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full mb-4 border px-3 py-2 rounded"
        rows={2}
      />

      <table className="w-full text-sm border">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="p-2">Item</th>
            <th className="p-2">Qty</th>
            <th className="p-2">W x H</th>
            <th className="p-2">Price</th>
            <th className="p-2">Ext. Price</th>
            <th className="p-2">Edit</th>
            <th className="p-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">
                <input
                  value={item.item}
                  onChange={(e) => updateItem(i, 'item', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  min={1}
                />
              </td>
              <td className="p-2">
                <input
                  value={item.width_height}
                  onChange={(e) => updateItem(i, 'width_height', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  placeholder="e.g. 36x72"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(i, 'price', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  min={0}
                />
              </td>
              <td className="p-2">${(item.quantity * item.price).toFixed(2)}</td>
              <td className="p-2">
                {/* Edit is inline - all fields are editable */}
                <span className="text-green-600 font-bold">✎</span>
              </td>
              <td className="p-2">
                <button onClick={() => removeItem(i)} className="text-red-500">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <div>
          <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">
            ➕ Add Row
          </button>
          {/* <button onClick={clearAllItems} className="ml-2 bg-gray-400 text-white px-3 py-2 rounded">
            Clear All
          </button> */}
        </div>
        <div className="text-lg font-semibold">Total: ${total.toFixed(2)}</div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        💾 Save Quote
      </button>
    </div>
  );
}


