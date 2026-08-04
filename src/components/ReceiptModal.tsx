import React from 'react';
import { Transaction, Store } from '../types';
import { generateReceiptPDF } from '../lib/pdf';
import { CheckCircle2, Download, Printer, X, ShoppingBag } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  store: Store;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  store,
  onClose,
}) => {
  const handleDownloadPDF = () => {
    const doc = generateReceiptPDF(transaction, store);
    doc.save(`Receipt_${transaction.transaction_number}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 flex flex-col my-8">
        
        {/* Success Banner */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Sale Completed!</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transaction #{transaction.transaction_number} saved locally
          </p>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="my-4 bg-slate-100 text-slate-900 p-5 font-mono text-xs printable-receipt rounded-xl shadow-inner">
          <div className="text-center font-bold text-sm tracking-tight uppercase">{store.name}</div>
          <div className="text-center text-[10px] text-slate-600 leading-tight mt-0.5 uppercase">{store.address}</div>
          <div className="text-center text-[10px] text-slate-600 uppercase">Tel: {store.phone}</div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          <div className="flex justify-between text-[11px]">
            <span>Receipt #:</span>
            <span className="font-bold">{transaction.transaction_number}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Date:</span>
            <span>{new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Payment:</span>
            <span className="uppercase font-bold">{transaction.payment_method.replace('_', ' ')}</span>
          </div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          {/* Line items */}
          <div className="space-y-1 my-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div className="flex-1 pr-2">
                  <div className="font-bold uppercase">{item.product_name}</div>
                  <div className="text-[10px] text-slate-600">
                    {item.unit_type === 'each'
                      ? `${item.quantity} x ${store.currency_symbol}${item.unit_price.toFixed(2)}`
                      : `${item.quantity.toFixed(3)}kg @ ${store.currency_symbol}${item.unit_price.toFixed(2)}/kg`}
                  </div>
                </div>
                <div className="font-bold">
                  {store.currency_symbol}{item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          {/* Subtotal & Tax */}
          <div className="flex justify-between text-[11px]">
            <span>Subtotal:</span>
            <span>{store.currency_symbol}{transaction.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Tax ({(store.tax_rate * 100).toFixed(0)}%):</span>
            <span>{store.currency_symbol}{transaction.tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm font-bold my-1 pt-1 border-t border-slate-900">
            <span>TOTAL:</span>
            <span>{store.currency_symbol}{transaction.total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-700">
            <span>Amount Paid:</span>
            <span>{store.currency_symbol}{transaction.amount_paid.toFixed(2)}</span>
          </div>
          {transaction.change_given > 0 && (
            <div className="flex justify-between text-[11px] text-slate-700">
              <span>Change Returned:</span>
              <span>{store.currency_symbol}{transaction.change_given.toFixed(2)}</span>
            </div>
          )}

          <div className="border-b border-dashed border-slate-400 my-2" />
          <div className="text-center text-[10px] text-slate-600 uppercase tracking-wider mt-2">
            Thank you for shopping with us!
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Print Receipt
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-950/40 transition-all mt-1"
          >
            Start New Sale
          </button>
        </div>

      </div>
    </div>
  );
};
