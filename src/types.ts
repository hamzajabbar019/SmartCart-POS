export type UnitType = 'each' | 'weight_kg' | 'weight_g';

export type Category = 
  | 'Staples & Grains'
  | 'Produce & Vegetables'
  | 'Dairy & Bakery'
  | 'Spices & Condiments'
  | 'Beverages & Tea'
  | 'Snacks & Sweets'
  | 'Personal & Household';

export interface Product {
  id: string;
  store_id: string;
  name: string;
  barcode: string | null;
  category: Category;
  unit_type: UnitType;
  price: number; // price per 'each' or per 'kg'
  cost: number;  // cost per 'each' or per 'kg'
  stock_quantity: number; // in units or kg
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number; // count for 'each', or weight in kg/g for 'weight'
  unit_price: number;
  total_price: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_wallet';

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_type: UnitType;
}

export interface Transaction {
  id: string;
  store_id: string;
  transaction_number: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_given: number;
  items: TransactionItem[];
  created_at: string;
  synced_to_cloud: boolean;
  notes?: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  credit_balance: number; // Khata balance
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  tax_rate: number; // e.g. 0.05 for 5%
  currency_symbol: string;
}

export interface SyncQueueItem {
  id: string;
  table_name: 'products' | 'transactions' | 'transaction_items' | 'customers' | 'inventory';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  created_at: string;
  attempts: number;
  last_error?: string;
}

export interface SyncConflictLog {
  id: string;
  entity_type: string;
  entity_id: string;
  local_data: any;
  cloud_data: any;
  resolution: 'local_wins' | 'cloud_wins' | 'merged';
  resolved_at: string;
}

export interface PeakSalesPeriod {
  period: string;
  expectedVolume: string;
  peakHours: string;
  reason: string;
}

export interface InventoryReorderRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDailyVelocity: number;
  daysRemaining: number;
  recommendedReorderQty: number;
  urgency: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface CategorySalesTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentageChange: string;
  insight: string;
}

export interface AIForecastResult {
  forecastPeriod: string;
  overallForecastSummary: string;
  predictedPeakPeriods: PeakSalesPeriod[];
  inventoryReorders: InventoryReorderRecommendation[];
  categoryTrends: CategorySalesTrend[];
  generatedAt?: string;
}
