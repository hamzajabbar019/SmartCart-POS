import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Product,
  CartItem,
  Transaction,
  Store,
  SyncQueueItem,
  SyncConflictLog,
  PaymentMethod,
} from '../types';
import {
  initLocalDB,
  getLocalProducts,
  saveLocalProduct,
  deleteLocalProduct,
  saveTransaction,
  getLocalTransactions,
  getSyncQueue,
  removeSyncQueueItem,
  getConflictLogs,
  saveConflictLog,
  getStoreConfig,
} from '../lib/db';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  store: Store;
  transactions: Transaction[];
  syncQueue: SyncQueueItem[];
  conflictLogs: SyncConflictLog[];
  isOnline: boolean;
  isSimulatedOffline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: Date | null;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Sale Checkout
  completeSale: (paymentMethod: PaymentMethod, amountPaid: number) => Promise<Transaction>;
  
  // Network & Sync Controls
  toggleSimulatedOffline: () => void;
  syncNow: () => Promise<void>;
  
  // Refreshers
  refreshProducts: () => Promise<void>;
}

const POSContext = createContext<POSContextType | null>(null);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [store, setStore] = useState<Store>({
    id: 'store-001',
    name: 'Corner Kirana & Mini-Mart',
    address: 'Shop #12, Market Square',
    phone: '+1 555-019-2834',
    tax_rate: 0.05,
    currency_symbol: '$',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [conflictLogs, setConflictLogs] = useState<SyncConflictLog[]>([]);
  
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  const effectiveOnline = isBrowserOnline && !isSimulatedOffline;

  // Initialize DB and load data
  useEffect(() => {
    async function setup() {
      await initLocalDB();
      const loadedStore = await getStoreConfig();
      setStore(loadedStore);
      
      const prods = await getLocalProducts();
      setProducts(prods);
      
      const txs = await getLocalTransactions();
      setTransactions(txs);
      
      const queue = await getSyncQueue();
      setSyncQueue(queue);
      
      const logs = await getConflictLogs();
      setConflictLogs(logs);

      if (queue.length > 0) {
        setSyncStatus('offline');
      }
    }
    setup();
  }, []);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update sync status indicator based on queue and connectivity
  useEffect(() => {
    if (!effectiveOnline) {
      setSyncStatus('offline');
    } else if (syncQueue.length === 0) {
      setSyncStatus('synced');
    } else {
      setSyncStatus('offline'); // Has pending queue items while online -> needs sync trigger
    }
  }, [effectiveOnline, syncQueue.length]);

  const refreshProducts = useCallback(async () => {
    const prods = await getLocalProducts();
    setProducts(prods);
  }, []);

  const refreshTransactions = useCallback(async () => {
    const txs = await getLocalTransactions();
    setTransactions(txs);
  }, []);

  const refreshQueueAndLogs = useCallback(async () => {
    const queue = await getSyncQueue();
    setSyncQueue(queue);
    const logs = await getConflictLogs();
    setConflictLogs(logs);
  }, []);

  // Sync Logic Execution
  const syncNow = useCallback(async () => {
    if (!effectiveOnline) return;

    setSyncStatus('syncing');
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return;
    }

    try {
      // Call mock or real sync endpoint
      if (isSupabaseConfigured) {
        for (const item of queue) {
          if (item.table_name === 'products') {
            await supabase.from('products').upsert(item.payload);
          } else if (item.table_name === 'transactions') {
            const { items, ...txData } = item.payload;
            await supabase.from('transactions').upsert(txData);
            if (items && items.length > 0) {
              await supabase.from('transaction_items').upsert(items);
            }
          }
          await removeSyncQueueItem(item.id);
        }
      } else {
        // Fallback sync simulator with local server endpoint
        await fetch('/api/sync/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemsCount: queue.length, items: queue }),
        });

        // Clear queue items cleanly
        for (const item of queue) {
          await removeSyncQueueItem(item.id);
        }
      }

      setLastSyncTime(new Date());
      setSyncStatus('synced');
      await refreshQueueAndLogs();
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncStatus('error');
    }
  }, [effectiveOnline, refreshQueueAndLogs]);

  // Automatic sync trigger when coming back online
  useEffect(() => {
    if (effectiveOnline && syncQueue.length > 0) {
      syncNow();
    }
  }, [effectiveOnline, syncQueue.length, syncNow]);

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total_price: newQty * product.price,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            unit_price: product.price,
            total_price: quantity * product.price,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity,
            total_price: quantity * item.unit_price,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // Product CRUD Operations
  const addProduct = async (prodData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveLocalProduct(newProduct, true);
    await refreshProducts();
    await refreshQueueAndLogs();
  };

  const updateProduct = async (product: Product) => {
    const updated = {
      ...product,
      updated_at: new Date().toISOString(),
    };
    await saveLocalProduct(updated, true);
    await refreshProducts();
    await refreshQueueAndLogs();
  };

  const deleteProduct = async (productId: string) => {
    await deleteLocalProduct(productId, true);
    await refreshProducts();
    await refreshQueueAndLogs();
  };

  // Complete Checkout Sale
  const completeSale = async (paymentMethod: PaymentMethod, amountPaid: number): Promise<Transaction> => {
    const subtotal = cart.reduce((sum, i) => sum + i.total_price, 0);
    const tax = subtotal * store.tax_rate;
    const total = subtotal + tax;
    const changeGiven = Math.max(0, amountPaid - total);

    const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const txNum = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const transactionItems = cart.map((i) => ({
      id: `txi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      transaction_id: txId,
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
      unit_type: i.product.unit_type,
    }));

    const transaction: Transaction = {
      id: txId,
      store_id: store.id,
      transaction_number: txNum,
      subtotal,
      tax,
      total,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_given: changeGiven,
      items: transactionItems,
      created_at: new Date().toISOString(),
      synced_to_cloud: false,
    };

    // Save locally & queue sync
    await saveTransaction(transaction);
    await refreshProducts();
    await refreshTransactions();
    await refreshQueueAndLogs();

    // Clear cart after checkout
    setCart([]);

    // Attempt automatic sync if online
    if (effectiveOnline) {
      setTimeout(() => syncNow(), 500);
    }

    return transaction;
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        store,
        transactions,
        syncQueue,
        conflictLogs,
        isOnline: effectiveOnline,
        isSimulatedOffline,
        syncStatus,
        lastSyncTime,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        addProduct,
        updateProduct,
        deleteProduct,

        completeSale,

        toggleSimulatedOffline,
        syncNow,

        refreshProducts,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
