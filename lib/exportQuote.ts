import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportQuoteAsPDF(quote: any) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Quote: ${quote.title}`, 10, 20);
  doc.setFontSize(12);
  doc.text(`Client: ${quote.clients?.name}`, 10, 35);
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, 10, 45);
  doc.text(`Total: $${quote.total.toLocaleString()}`, 10, 55);

  // Flexible content support (plain string or JSON)
  let content = '';
  if (typeof quote.content === 'string') {
    try {
      const maybeJson = JSON.parse(quote.content);
      content = maybeJson?.text || '';
    } catch {
      content = quote.content;
    }
  } else if (typeof quote.content === 'object' && quote.content !== null) {
    content = quote.content.text || '';
  }

  if (content) {
    doc.text('Content:', 10, 70);
    doc.text(doc.splitTextToSize(content, 180), 10, 80);
  }

  // Optional: Add quote items table if you want in PDF
  if (quote.quote_items && quote.quote_items.length > 0) {
    autoTable(doc, {
      head: [['Item', 'Qty', 'W x H', 'Price', 'Extended Price']],
      body: quote.quote_items.map((i: any) => [
        i.item,
        i.quantity,
        i.width_height,
        i.price?.toFixed(2) ?? '',
        ((i.quantity || 0) * (i.price || 0)).toFixed(2),
      ]),
      startY: content ? 90 : 70,
    });
  }

  doc.save(`${quote.title.replace(/\s+/g, '_')}.pdf`);
}

export function exportQuoteAsCSV(quote: any) {
  // define the shape of each quote item for strong typing
  type QuoteItem = {
    item: string;
    quantity: number;
    width_height: string;
    price: number;
  };

  const header = ['Item', 'Qty', 'W x H', 'Price', 'Extended Price'];
  const rows = (quote.quote_items as QuoteItem[] || []).map((i: QuoteItem) => [
    i.item,
    i.quantity.toString(),
    i.width_height,
    i.price.toFixed(2),
    (i.quantity * i.price).toFixed(2),
  ]);

  const csv = [
    header.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quote.title?.replace(/\s+/g, '_') || 'quote'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllQuotesAsCSV(quotes: any[]) {
  const header = ['Title', 'Client', 'Date', 'Total', 'Content'];
  const rows = quotes.map((quote) => {
    let content = '';
    if (typeof quote.content === 'string') {
      try {
        const maybeJson = JSON.parse(quote.content);
        content = maybeJson?.text || quote.content;
      } catch {
        content = quote.content;
      }
    } else if (typeof quote.content === 'object' && quote.content !== null) {
      content = quote.content.text || '';
    }
    return [
      quote.title,
      quote.clients?.name || '',
      new Date(quote.created_at).toLocaleDateString(),
      `$${quote.total}`,
      (content || '').replace(/\n/g, ' ')
    ];
  });

  const csv = [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `All_Quotes_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


