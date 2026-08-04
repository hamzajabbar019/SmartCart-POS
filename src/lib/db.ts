import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, Transaction, SyncQueueItem, SyncConflictLog, Store } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE } from './initialData';

interface SmartCartDBSchema extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-barcode': string; 'by-category': string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-date': string; 'by-synced': number };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
  };
  conflict_logs: {
    key: string;
    value: SyncConflictLog;
  };
  store: {
    key: string;
    value: Store;
  };
}

const DB_NAME = 'smartcart_pos_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SmartCartDBSchema>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SmartCartDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Products store
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-barcode', 'barcode', { unique: false });
        productStore.createIndex('by-category', 'category', { unique: false });

        // Transactions store
        const transStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transStore.createIndex('by-date', 'created_at');
        transStore.createIndex('by-synced', 'synced_to_cloud');

        // Sync Queue store
        db.createObjectStore('sync_queue', { keyPath: 'id' });

        // Conflict Logs store
        db.createObjectStore('conflict_logs', { keyPath: 'id' });

        // Store config
        db.createObjectStore('store', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function initLocalDB() {
  const db = await getDB();
  const existingProducts = await db.getAll('products');
  if (existingProducts.length === 0) {
    const tx = db.transaction('products', 'readwrite');
    for (const p of INITIAL_PRODUCTS) {
      await tx.store.put(p);
    }
    await tx.done;
  }

  const existingStore = await db.get('store', INITIAL_STORE.id);
  if (!existingStore) {
    await db.put('store', INITIAL_STORE);
  }
}

// Local Product CRUD
export async function getLocalProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll('products');
}

export async function saveLocalProduct(product: Product, addToQueue = true): Promise<void> {
  const db = await getDB();
  await db.put('products', product);

  if (addToQueue) {
    await enqueueSyncItem({
      id: `sync-prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      table_name: 'products',
      action: 'UPDATE',
      payload: product,
      created_at: new Date().toISOString(),
      attempts: 0,
    });
  }
}

export async function deleteLocalProduct(productId: string, addToQueue = true): Promise<void> {
  const db = await getDB();
  await db.delete('products', productId);

  if (addToQueue) {
    await enqueueSyncItem({
      id: `sync-del-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      table_name: 'products',
      action: 'DELETE',
      payload: { id: productId },
      created_at: new Date().toISOString(),
      attempts: 0,
    });
  }
}

// Local Transaction Processing
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['transactions', 'products', 'sync_queue'], 'readwrite');

  // 1. Save Transaction locally
  await tx.objectStore('transactions').put(transaction);

  // 2. Deduct inventory locally for each item
  const productStore = tx.objectStore('products');
  for (const item of transaction.items) {
    if (item.product_id) {
      const product = await productStore.get(item.product_id);
      if (product) {
        const newStock = Math.max(0, product.stock_quantity - item.quantity);
        const updatedProduct: Product = {
          ...product,
          stock_quantity: newStock,
          updated_at: new Date().toISOString(),
        };
        await productStore.put(updatedProduct);
      }
    }
  }

  // 3. Enqueue for Cloud Sync
  const syncItem: SyncQueueItem = {
    id: `sync-tx-${transaction.id}`,
    table_name: 'transactions',
    action: 'INSERT',
    payload: transaction,
    created_at: new Date().toISOString(),
    attempts: 0,
  };
  await tx.objectStore('sync_queue').put(syncItem);

  await tx.done;
}

export async function getLocalTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  const list = await db.getAll('transactions');
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Sync Queue Management
export async function enqueueSyncItem(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('sync_queue', item);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll('sync_queue');
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('sync_queue');
}

// Conflict Logs
export async function saveConflictLog(log: SyncConflictLog): Promise<void> {
  const db = await getDB();
  await db.put('conflict_logs', log);
}

export async function getConflictLogs(): Promise<SyncConflictLog[]> {
  const db = await getDB();
  return db.getAll('conflict_logs');
}

// Store Config
export async function getStoreConfig(): Promise<Store> {
  const db = await getDB();
  const store = await db.get('store', INITIAL_STORE.id);
  return store || INITIAL_STORE;
}
