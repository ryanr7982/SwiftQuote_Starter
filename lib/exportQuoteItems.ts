import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export type QuoteItem = {
  item: string;
  quantity: number;
  width_height: string;
  price: number;
};

// Extend jsPDF to include lastAutoTable for typescript safety
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export function exportQuoteItemsAsCSV(items: QuoteItem[]) {
  const headers = ['Item', 'Qty', 'W x H', 'Price', 'Extended Price'];
  const rows = items.map(i => [
    i.item,
    i.quantity,
    i.width_height,
    i.price.toFixed(2),
    (i.quantity * i.price).toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  saveAs(blob, 'quote_items.csv');
}

export function exportQuoteItemsAsPDF(items: QuoteItem[]) {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  const tableData = items.map(i => [
    i.item,
    i.quantity,
    i.width_height,
    `$${i.price.toFixed(2)}`,
    `$${(i.quantity * i.price).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [['Item', 'Qty', 'W x H', 'Price', 'Extended Price']],
    body: tableData,
  });

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const finalY = doc.lastAutoTable?.finalY || 40;
  doc.text(`Total: $${total.toFixed(2)}`, 14, finalY + 10);
  doc.save('quote_items.pdf');
}

