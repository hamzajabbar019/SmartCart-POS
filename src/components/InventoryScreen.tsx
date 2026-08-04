import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, Category, UnitType } from '../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Scale,
  X,
  Check,
  Tag,
  DollarSign,
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Staples & Grains',
  'Produce & Vegetables',
  'Dairy & Bakery',
  'Spices & Condiments',
  'Beverages & Tea',
  'Snacks & Sweets',
  'Personal & Household',
];

export const InventoryScreen: React.FC = () => {
  const { products, store, addProduct, updateProduct, deleteProduct } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);

  // Add / Edit Modal state
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation Modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Quick Restock Modal state
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [addStockAmount, setAddStockAmount] = useState<string>('10');
  const [isRestocking, setIsRestocking] = useState<boolean>(false);

  // Form fields
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<Category>('Staples & Grains');
  const [unitType, setUnitType] = useState<UnitType>('each');
  const [price, setPrice] = useState<string>('1.00');
  const [cost, setCost] = useState<string>('0.70');
  const [stockQuantity, setStockQuantity] = useState<string>('10');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLowStock = !filterLowStockOnly || p.stock_quantity <= p.low_stock_threshold;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBarcode('');
    setCategory('Staples & Grains');
    setUnitType('each');
    setPrice('1.50');
    setCost('1.00');
    setStockQuantity('20');
    setLowStockThreshold('5');
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode || '');
    setCategory(p.category);
    setUnitType(p.unit_type);
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setStockQuantity(p.stock_quantity.toString());
    setLowStockThreshold(p.low_stock_threshold.toString());
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numericPrice = parseFloat(price) || 0;
    const numericCost = parseFloat(cost) || 0;
    const numericStock = parseFloat(stockQuantity) || 0;
    const numericThreshold = parseFloat(lowStockThreshold) || 5;

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        name: name.trim(),
        barcode: barcode.trim() || null,
        category,
        unit_type: unitType,
        price: numericPrice,
        cost: numericCost,
        stock_quantity: numericStock,
        low_stock_threshold: numericThreshold,
      });
    } else {
      await addProduct({
        store_id: store.id,
        name: name.trim(),
        barcode: barcode.trim() || null,
        category,
        unit_type: unitType,
        price: numericPrice,
        cost: numericCost,
        stock_quantity: numericStock,
        low_stock_threshold: numericThreshold,
      });
    }

    setShowProductModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenRestock = (p: Product) => {
    setRestockingProduct(p);
    setAddStockAmount('10');
  };

  const handleConfirmRestock = async () => {
    if (!restockingProduct || isRestocking) return;
    const added = parseFloat(addStockAmount) || 0;
    if (added <= 0) return;

    setIsRestocking(true);
    try {
      await updateProduct({
        ...restockingProduct,
        stock_quantity: restockingProduct.stock_quantity + added,
      });
      setRestockingProduct(null);
    } catch (err) {
      console.error('Failed to restock:', err);
    } finally {
      setIsRestocking(false);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_threshold);

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto space-y-6 text-slate-100">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-100">
            <Package className="w-6 h-6 text-emerald-400" />
            Product & Inventory Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage unit prices, stock levels, barcoded goods, and loose produce weight items.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 rounded-xl shadow-md shadow-emerald-950/40 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* LOW STOCK WARNING BANNER */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-[#111827] to-amber-950/80 border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm">Low Stock Alert Triggered</h3>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-full">
                  {lowStockProducts.length} Item{lowStockProducts.length > 1 ? 's' : ''} Need Restocking
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stock levels for <span className="text-slate-200 font-medium">{lowStockProducts.slice(0, 3).map((p) => p.name).join(', ')}</span>{lowStockProducts.length > 3 ? ` and ${lowStockProducts.length - 3} more` : ''} have fallen below their restocking thresholds.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterLowStockOnly((prev) => !prev)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0 flex items-center gap-2 ${
              filterLowStockOnly
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {filterLowStockOnly ? 'Show All Products' : 'Filter Low Stock Alert Items'}
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#111827] p-4 rounded-2xl border border-slate-800/80 shadow-lg">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-800/80 focus:border-emerald-500 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 rounded-xl focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0B0F19] border border-slate-800/80 px-3 py-2 text-xs text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Low Stock Toggle */}
        <button
          onClick={() => setFilterLowStockOnly((prev) => !prev)}
          className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center justify-center gap-2 transition-all ${
            filterLowStockOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
              : 'bg-[#0B0F19] text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${filterLowStockOnly ? 'text-rose-400' : 'text-amber-400'}`} />
          {filterLowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock Alert Items'}
        </button>
      </div>

      {/* Table List */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F172A] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Price / Cost</th>
                <th className="py-3.5 px-4">Stock Level & Status</th>
                <th className="py-3.5 px-4">Barcode</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock_quantity <= p.low_stock_threshold;
                const isWeight = p.unit_type === 'weight_kg' || p.unit_type === 'weight_g';

                // Calculate stock level progress percentage relative to threshold benchmark
                const benchmarkStock = Math.max(p.low_stock_threshold * 2.5, 10);
                const stockPercentage = Math.min(100, Math.max(4, (p.stock_quantity / benchmarkStock) * 100));

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isLowStock
                        ? 'bg-rose-950/25 hover:bg-rose-900/35 border-l-4 border-l-rose-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {isLowStock && (
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">{p.category}</td>

                    <td className="py-3.5 px-4">
                      {isWeight ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <Scale className="w-3 h-3" /> Weight (kg)
                        </span>
                      ) : (
                        <span className="text-slate-400">Unit (each)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {store.currency_symbol}{p.price.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        (Cost: {store.currency_symbol}{p.cost.toFixed(2)})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-baseline justify-between gap-2 max-w-[150px]">
                        <span className={`text-xs ${isLowStock ? 'text-rose-400 font-extrabold' : 'text-slate-200 font-bold'}`}>
                          {isWeight ? `${p.stock_quantity.toFixed(1)} kg` : p.stock_quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Min: {isWeight ? `${p.low_stock_threshold}kg` : p.low_stock_threshold}
                        </span>
                      </div>

                      {/* Stock Level Bar Indicator */}
                      <div className="w-full max-w-[150px] bg-slate-900/80 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isLowStock
                              ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${stockPercentage}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.barcode ? (
                        <span className="bg-slate-900 px-2 py-0.5 border border-slate-800 rounded text-[11px]">
                          {p.barcode}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No Barcode</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenRestock(p)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1"
                          title="Quick Restock Item"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Restock
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching products found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-slate-100">
                {editingProduct ? 'Edit Product' : 'Add New Grocery Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 my-4">
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super Basmati Rice or Red Onions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Pricing Unit Type
                  </label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value as UnitType)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="each">Unit / Each (Packaged)</option>
                    <option value="weight_kg">Weight-based (Per Kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Barcode (Optional for produce/bulk)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8901234567890"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Selling Price ({store.currency_symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Cost Price ({store.currency_symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-950/40 transition-all"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-100">Delete Product</h3>
              </div>
              <button onClick={() => setDeletingProduct(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-xs text-slate-300">
                Are you sure you want to remove <span className="font-bold text-white">{deletingProduct.name}</span> from the product catalog?
              </p>
              <p className="text-[11px] text-slate-400">
                This action will delete the item from your local catalog and queue the deletion for offline sync.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-950/40 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK MODAL */}
      {restockingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Quick Restock Item</h3>
                  <p className="text-xs text-slate-400">{restockingProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setRestockingProduct(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Current Stock</span>
                  <span className="text-base font-bold font-mono text-slate-200">
                    {restockingProduct.unit_type === 'weight_kg' || restockingProduct.unit_type === 'weight_g'
                      ? `${restockingProduct.stock_quantity.toFixed(1)} kg`
                      : restockingProduct.stock_quantity}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Alert Limit</span>
                  <span className="text-base font-bold font-mono text-rose-400">
                    {restockingProduct.low_stock_threshold}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Quantity to Add:
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={addStockAmount}
                  onChange={(e) => setAddStockAmount(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="block text-xs text-slate-400 mb-1.5 font-medium">Quick Presets:</span>
                <div className="flex gap-2">
                  {['5', '10', '25', '50'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddStockAmount(amt)}
                      className="flex-1 py-1.5 bg-[#111827] hover:bg-slate-800 border border-slate-800 text-xs font-mono font-semibold text-slate-300 rounded-xl transition-colors"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => setRestockingProduct(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                disabled={isRestocking}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {isRestocking ? 'Restocking...' : 'Confirm Restock'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
