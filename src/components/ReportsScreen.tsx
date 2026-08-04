import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Transaction } from '../types';
import { ReceiptModal } from './ReceiptModal';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Banknote,
  CreditCard,
  QrCode,
  FileText,
  BrainCircuit,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ReportsScreenProps {
  onNavigateToForecast?: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onNavigateToForecast }) => {
  const { transactions, products, store } = usePOS();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Daily Stats Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(
    (t) => t.created_at.split('T')[0] === todayStr
  );

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const avgBasket = todayTransactions.length > 0 ? todayRevenue / todayTransactions.length : 0;

  // Payment Breakdown
  const cashSales = transactions.filter((t) => t.payment_method === 'cash').reduce((sum, t) => sum + t.total, 0);
  const cardSales = transactions.filter((t) => t.payment_method === 'card').reduce((sum, t) => sum + t.total, 0);
  const walletSales = transactions.filter((t) => t.payment_method === 'mobile_wallet').reduce((sum, t) => sum + t.total, 0);

  // Low Stock Items
  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_threshold);

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto space-y-6 text-slate-100">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-100">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Daily Sales & Stock Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily transaction totals, payment breakdowns, and inventory alert warnings.
          </p>
        </div>

        {onNavigateToForecast && (
          <button
            onClick={onNavigateToForecast}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-300" />
            Launch AI Sales Forecast
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's Sales Total</div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {store.currency_symbol}{todayRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {todayTransactions.length} transactions today
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Basket Value</div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {store.currency_symbol}{avgBasket.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Per order ticket</div>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">All-Time Revenue</div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {store.currency_symbol}{totalRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {transactions.length} total orders logged
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold border border-emerald-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Low Stock Alerts</div>
            <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
              {lowStockProducts.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Items needing restock</div>
          </div>
          <div className="w-11 h-11 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Payment Method Distribution */}
      <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-3">Payment Method Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-800 text-emerald-400 rounded-lg flex items-center justify-center border border-slate-700">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Cash Payments</div>
                <div className="text-base font-bold font-mono text-slate-100">
                  {store.currency_symbol}{cashSales.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-800 text-emerald-400 rounded-lg flex items-center justify-center border border-slate-700">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Card Payments</div>
                <div className="text-base font-bold font-mono text-slate-100">
                  {store.currency_symbol}{cardSales.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-800 text-emerald-400 rounded-lg flex items-center justify-center border border-slate-700">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Mobile Wallet QR</div>
                <div className="text-base font-bold font-mono text-slate-100">
                  {store.currency_symbol}{walletSales.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Low Stock Items Warning Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-200">Low Stock Alert List</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#0B0F19] border border-slate-800 p-3.5 rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-400 font-mono">
                    {p.unit_type.startsWith('weight') ? `${p.stock_quantity.toFixed(1)}kg` : p.stock_quantity}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Min: {p.low_stock_threshold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-[#0F172A] font-semibold text-xs tracking-wider text-slate-200 flex items-center justify-between">
          <span>Recent Sales Log</span>
          <span className="text-xs font-mono text-slate-400">{transactions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F172A] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4 text-right">View Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {transactions.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">
                    {tx.transaction_number}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-[11px] text-emerald-400 font-medium">
                    {tx.payment_method.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {tx.items.length} items
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100 text-sm">
                    {store.currency_symbol}{tx.total.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg inline-flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No transactions recorded yet. Complete a checkout sale in POS mode!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          store={store}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

    </div>
  );
};
