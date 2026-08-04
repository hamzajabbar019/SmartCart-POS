import { jsPDF } from 'jspdf';
import { Transaction, Store } from '../types';

export function generateReceiptPDF(transaction: Transaction, store: Store): jsPDF {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 180], // 80mm thermal receipt format
  });

  let y = 10;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(store.name, 40, y, { align: 'center' });
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(store.address, 40, y, { align: 'center' });
  
  y += 4;
  doc.text(`Tel: ${store.phone}`, 40, y, { align: 'center' });

  y += 6;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y);

  // Transaction info
  y += 5;
  doc.text(`Receipt #: ${transaction.transaction_number}`, 5, y);
  y += 4;
  doc.text(`Date: ${new Date(transaction.created_at).toLocaleString()}`, 5, y);
  y += 4;
  doc.text(`Pay Method: ${transaction.payment_method.toUpperCase()}`, 5, y);

  y += 5;
  doc.line(5, y, 75, y);

  // Table header
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, y);
  doc.text('Qty', 45, y, { align: 'right' });
  doc.text('Total', 75, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  y += 2;

  // Items
  transaction.items.forEach((item) => {
    y += 5;
    if (y > 165) {
      doc.addPage();
      y = 10;
    }
    const nameStr = item.product_name.length > 20 
      ? item.product_name.substring(0, 18) + '..' 
      : item.product_name;
    
    doc.text(nameStr, 5, y);
    
    const qtyStr = item.unit_type === 'each' 
      ? `${item.quantity}` 
      : `${item.quantity.toFixed(3)}kg`;

    doc.text(qtyStr, 45, y, { align: 'right' });
    doc.text(`${store.currency_symbol}${item.total_price.toFixed(2)}`, 75, y, { align: 'right' });
  });

  y += 5;
  doc.line(5, y, 75, y);

  // Totals
  y += 5;
  doc.text('Subtotal:', 45, y, { align: 'right' });
  doc.text(`${store.currency_symbol}${transaction.subtotal.toFixed(2)}`, 75, y, { align: 'right' });

  y += 4;
  doc.text(`Tax (${(store.tax_rate * 100).toFixed(0)}%):`, 45, y, { align: 'right' });
  doc.text(`${store.currency_symbol}${transaction.tax.toFixed(2)}`, 75, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', 45, y, { align: 'right' });
  doc.text(`${store.currency_symbol}${transaction.total.toFixed(2)}`, 75, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Paid:', 45, y, { align: 'right' });
  doc.text(`${store.currency_symbol}${transaction.amount_paid.toFixed(2)}`, 75, y, { align: 'right' });

  if (transaction.change_given > 0) {
    y += 4;
    doc.text('Change:', 45, y, { align: 'right' });
    doc.text(`${store.currency_symbol}${transaction.change_given.toFixed(2)}`, 75, y, { align: 'right' });
  }

  // Footer
  y += 8;
  doc.line(5, y, 75, y);
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for shopping with us!', 40, y, { align: 'center' });
  y += 4;
  doc.text('SmartCart POS - Offline First', 40, y, { align: 'center' });

  return doc;
}
