import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_PHASE1_SQL_SCHEMA = `-- ========================================================
-- SmartCart POS: Phase 1 Supabase PostgreSQL Schema
-- Generated for Independent Grocery & Mini-Mart POS
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    tax_rate NUMERIC(5, 4) DEFAULT 0.0000, -- e.g. 0.0500 for 5%
    currency_symbol TEXT DEFAULT '$',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS / STORE OWNERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner', -- 'owner' or 'cashier'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    barcode TEXT UNIQUE, -- Nullable for non-barcoded produce/bulk items
    category TEXT NOT NULL DEFAULT 'Staples & Grains',
    unit_type TEXT NOT NULL DEFAULT 'each', -- 'each', 'weight_kg', 'weight_g'
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
    low_stock_threshold NUMERIC(10, 3) NOT NULL DEFAULT 5.000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    credit_balance NUMERIC(10, 2) DEFAULT 0.00, -- Khata balance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    transaction_number TEXT UNIQUE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'cash', 'card', 'mobile_wallet'
    amount_paid NUMERIC(10, 2) NOT NULL,
    change_given NUMERIC(10, 2) DEFAULT 0.00,
    synced_to_cloud BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_store_date ON public.transactions(store_id, created_at);

-- 6. TRANSACTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    unit_type TEXT NOT NULL DEFAULT 'each'
);

-- 7. SYNC CONFLICT LOGS (For Offline Sync Auditing)
CREATE TABLE IF NOT EXISTS public.sync_conflict_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    local_data JSONB,
    cloud_data JSONB,
    resolution TEXT NOT NULL DEFAULT 'local_wins',
    resolved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Default Permissive RLS Policies for Single Store
CREATE POLICY "Allow all store products access" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all transactions access" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow all transaction items access" ON public.transaction_items FOR ALL USING (true);
CREATE POLICY "Allow all stores access" ON public.stores FOR ALL USING (true);
CREATE POLICY "Allow all customers access" ON public.customers FOR ALL USING (true);
`;
