import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, Category, PaymentMethod, Transaction } from '../types';
import { WeightItemModal } from './WeightItemModal';
import { CameraBarcodeScanner } from './CameraBarcodeScanner';
import { ReceiptModal } from './ReceiptModal';
import {
  Search,
  Camera,
  Scale,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  AlertTriangle,
  ShoppingBag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Staples & Grains',
  'Produce & Vegetables',
  'Dairy & Bakery',
  'Spices & Condiments',
  'Beverages & Tea',
  'Snacks & Sweets',
];

export const CheckoutScreen: React.FC = () => {
  const {
    products,
    cart,
    store,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    completeSale,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Mobile View state
  const [selectedWeightProduct, setSelectedWeightProduct] = useState<Product | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Payment Form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaidText, setAmountPaidText] = useState<string>('');
  const [isProcessingSale, setIsProcessingSale] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * store.tax_rate;
  const grandTotal = subtotal + tax;

  const numericAmountPaid = parseFloat(amountPaidText) || grandTotal;
  const changeGiven = Math.max(0, numericAmountPaid - grandTotal);

  // Add Product handler
  const handleSelectProduct = (product: Product) => {
    if (product.unit_type === 'weight_kg' || product.unit_type === 'weight_g') {
      setSelectedWeightProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    const matched = products.find((p) => p.barcode === barcode);
    if (matched) {
      handleSelectProduct(matched);
      showToast(`Added ${matched.name} to cart`);
    } else {
      showToast(`No product found with barcode: ${barcode}`);
    }
  };

  const handleConfirmWeight = (product: Product, weightInKg: number) => {
    addToCart(product, weightInKg);
    setSelectedWeightProduct(null);
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setAmountPaidText(grandTotal.toFixed(2));
    setShowPaymentModal(true);
  };

  const handleExecuteCheckout = async () => {
    if (isProcessingSale) return;
    setIsProcessingSale(true);

    try {
      const tx = await completeSale(paymentMethod, numericAmountPaid);
      setShowPaymentModal(false);
      setCompletedTransaction(tx);
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Error completing sale. Please try again.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4.5rem)] bg-[#0B0F19] text-slate-100 overflow-hidden relative">
      
      {/* Mobile Switch Header Bar (< lg) */}
      <div className="lg:hidden flex bg-[#111827] border-b border-slate-800 p-2 gap-2">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Product Catalog
        </button>

        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative ${
            mobileTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Cart & Order
          {cart.length > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-mono text-[10px] font-bold rounded-full">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* LEFT: Product Catalog & Search (Main POS Grid) */}
      <div className={`flex-1 flex flex-col p-4 sm:p-6 overflow-hidden border-r border-slate-800/80 ${
        mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Top Search & Camera Barcode Action Row */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search product or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-slate-800/80 focus:border-emerald-500 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none rounded-xl shadow-inner transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 rounded-xl transition-all shadow-sm shrink-0"
            title="Open Camera Barcode Scanner"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-500/50 shadow-md shadow-emerald-950/30 font-semibold'
                  : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 align-content-start pb-16 lg:pb-0">
          {filteredProducts.map((p) => {
            const isLowStock = p.stock_quantity <= p.low_stock_threshold;
            const isWeight = p.unit_type === 'weight_kg' || p.unit_type === 'weight_g';

            return (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className="bg-[#111827] border border-slate-800/80 hover:border-emerald-500/50 p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between text-left transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20 group relative"
              >
                {/* Low Stock Badge */}
                {isLowStock && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Low
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    {isWeight ? (
                      <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                        <Scale className="w-3 h-3" /> Weighted
                      </span>
                    ) : (
                      <span>Unit</span>
                    )}
                    <span>•</span>
                    <span className="truncate">{p.category}</span>
                  </div>

                  <h4 className="font-semibold text-xs sm:text-sm text-slate-100 tracking-tight line-clamp-2">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-end justify-between">
                  <div>
                    <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                      {store.currency_symbol}{p.price.toFixed(2)}
                      <span className="text-[10px] text-slate-400 font-sans ml-0.5">
                        {isWeight ? '/kg' : ''}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Stock: {isWeight ? `${p.stock_quantity.toFixed(1)}kg` : p.stock_quantity}
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Mobile Floating Cart Summary Banner */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20 bg-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/30 animate-fade-in">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <div>
                <span className="text-xs font-bold block">{cart.length} Item{cart.length > 1 ? 's' : ''} in Order</span>
                <span className="text-sm font-mono font-extrabold">{store.currency_symbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setMobileTab('cart')}
              className="px-4 py-2 bg-slate-950/40 hover:bg-slate-950/60 text-white font-bold text-xs rounded-xl flex items-center gap-1 border border-white/20 transition-all"
            >
              Review Order →
            </button>
          </div>
        )}

      </div>

      {/* RIGHT: Cart & Checkout Side Panel */}
      <div className={`w-full lg:w-96 bg-[#0F172A] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800/80 ${
        mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800/80 bg-[#111827]/80 backdrop-blur-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Current Order</h3>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold rounded-full">
              {cart.length}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item) => {
            const isWeight = item.product.unit_type === 'weight_kg' || item.product.unit_type === 'weight_g';

            return (
              <div
                key={item.product.id}
                className="bg-[#111827] border border-slate-800/80 p-3.5 rounded-2xl flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-xs text-slate-100 tracking-tight">{item.product.name}</h5>
                    <div className="text-[11px] font-mono text-slate-400">
                      {store.currency_symbol}{item.unit_price.toFixed(2)} {isWeight ? '/kg' : 'each'}
                    </div>
                  </div>
                  <div className="font-bold text-sm text-emerald-400 font-mono">
                    {store.currency_symbol}{item.total_price.toFixed(2)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1 bg-[#0B0F19] border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          isWeight ? +(item.quantity - 0.25).toFixed(3) : item.quantity - 1
                        )
                      }
                      className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="px-2 text-xs font-mono font-bold text-slate-200">
                      {isWeight ? `${item.quantity.toFixed(3)}kg` : item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          isWeight ? +(item.quantity + 0.25).toFixed(3) : item.quantity + 1
                        )
                      }
                      className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-semibold">Cart is empty</p>
              <p className="text-[11px] text-slate-500 mt-1">Select items to start sale.</p>
            </div>
          )}
        </div>

        {/* Cart Totals & Checkout Button */}
        <div className="p-4 border-t border-slate-800/80 bg-[#111827]/80 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Subtotal:</span>
            <span>{store.currency_symbol}{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Tax ({(store.tax_rate * 100).toFixed(0)}%):</span>
            <span>{store.currency_symbol}{tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800/80">
            <span>TOTAL:</span>
            <span className="text-emerald-400 font-mono text-xl font-extrabold">
              {store.currency_symbol}{grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className="w-full mt-3 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
          >
            <Banknote className="w-5 h-5" />
            Collect Payment
          </button>
        </div>

      </div>

      {/* WEIGHT ITEM MODAL */}
      {selectedWeightProduct && (
        <WeightItemModal
          product={selectedWeightProduct}
          currencySymbol={store.currency_symbol}
          onConfirm={handleConfirmWeight}
          onClose={() => setSelectedWeightProduct(null)}
        />
      )}

      {/* CAMERA BARCODE SCANNER */}
      {showBarcodeScanner && (
        <CameraBarcodeScanner
          products={products}
          onScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-slate-100">Collect Payment</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="my-5 text-center bg-[#0B0F19] p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Amount Due</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono my-1">
                {store.currency_symbol}{grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5" />
                Cash
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Card
              </button>

              <button
                onClick={() => setPaymentMethod('mobile_wallet')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'mobile_wallet'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-5 h-5" />
                Wallet QR
              </button>
            </div>

            {/* Cash Input / Calculator */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 my-4 bg-[#0B0F19] p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cash Tendered:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaidText}
                    onChange={(e) => setAmountPaidText(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xl font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Tender Buttons */}
                <div className="flex gap-1.5">
                  {[5, 10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmountPaidText(amt.toString())}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-lg border border-slate-700"
                    >
                      {store.currency_symbol}{amt}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
                  <span className="font-medium text-slate-400">Change Due:</span>
                  <span className="font-mono font-bold text-emerald-400 text-lg">
                    {store.currency_symbol}{changeGiven.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'mobile_wallet' && (
              <div className="my-4 p-4 bg-[#0B0F19] rounded-xl border border-slate-800/80 text-center">
                <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <p className="text-xs font-medium text-slate-400">
                  Scan QR Code to Pay
                </p>
              </div>
            )}

            <button
              onClick={handleExecuteCheckout}
              disabled={isProcessingSale}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Check className="w-5 h-5" />
              Complete Sale & Print Receipt
            </button>

          </div>
        </div>
      )}

      {/* COMPLETED RECEIPT MODAL */}
      {completedTransaction && (
        <ReceiptModal
          transaction={completedTransaction}
          store={store}
          onClose={() => setCompletedTransaction(null)}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-slate-700 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
