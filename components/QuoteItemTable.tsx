'use client';

import { useState } from 'react';
import { QuoteItem } from '@/lib/exportQuoteItems';
import { exportQuoteItemsAsCSV, exportQuoteItemsAsPDF } from '@/lib/exportQuoteItems';



export default function QuoteItemTable() {
  const [items, setItems] = useState<QuoteItem[]>([
    { item: '', quantity: 1, width_height: '', price: 0 },
  ]);

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updated = [...items];
    // Convert to number if field is quantity or price
    if (field === 'quantity' || field === 'price') {
      updated[index][field] = parseFloat(value as string) || 0;
    } else {
      updated[index][field] = value as string;
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, width_height: '', price: 0 }]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🧾 Quote Items</h2>
      <table className="w-full text-sm text-left border">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="p-2">Item</th>
            <th className="p-2">Qty</th>
            <th className="p-2">W x H</th>
            <th className="p-2">Price</th>
            <th className="p-2">Ext. Price</th>
            <th className="p-2">❌</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">
                <input
                  type="text"
                  value={row.item}
                  onChange={(e) => updateItem(idx, 'item', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </td>
              <td className="p-2">
                <input
                  type="text"
                  placeholder="e.g. 36x72"
                  value={row.width_height}
                  onChange={(e) => updateItem(idx, 'width_height', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={row.price}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </td>
              <td className="p-2">${(row.quantity * row.price).toFixed(2)}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => removeItem(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          onClick={addItem}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ Add Row
        </button>

        <div className="text-lg font-semibold">
          Total: ${getTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="mt-4 flex gap-3 justify-end">
        <button
          onClick={() => exportQuoteItemsAsPDF(items)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
        <button
          onClick={() => exportQuoteItemsAsCSV(items)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
