import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  ShoppingCart,
  Package,
  BarChart3,
  Wifi,
  WifiOff,
  Store,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'pos' | 'inventory' | 'reports' | 'forecast';
  setActiveTab: (tab: 'pos' | 'inventory' | 'reports' | 'forecast') => void;
  onOpenSyncDiagnostics?: () => void;
  onOpenFlutterCode?: () => void;
  onOpenBarcodeScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    store,
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
  } = usePOS();

  return (
    <header className="bg-[#0F172A]/95 backdrop-blur-md text-slate-100 border-b border-slate-800/80 sticky top-0 z-30 shadow-lg shadow-black/20 w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 py-2.5">
          
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-extrabold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-950/40 border border-emerald-400/30 select-none"
              title="SmartCart POS"
            >
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-100 text-base sm:text-lg tracking-tight leading-none">
                  SmartCart POS
                </h1>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none hidden sm:inline-block">
                  v1.0 POS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[140px] sm:max-w-none">{store.name}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#111827] p-1.5 rounded-xl border border-slate-800/90 shadow-inner">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'pos'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Checkout POS
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              Inventory Catalog
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics & Reports
            </button>

            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'forecast'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              AI Sales Forecast
            </button>
          </nav>

          {/* Right Network Status Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulatedOffline}
              title={isSimulatedOffline ? "Click to switch back Online" : "Click to simulate Offline / Network Loss"}
              className={`flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-all shadow-sm ${
                isOnline ? 'hover:bg-slate-800/60' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline Mode</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tab Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1 text-xs py-1.5 px-2.5 font-semibold rounded-lg transition-all ${
              activeTab === 'pos' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            POS
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1 text-xs py-1.5 px-2.5 font-semibold rounded-lg transition-all ${
              activeTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Stock
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1 text-xs py-1.5 px-2 font-semibold rounded-lg transition-all ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-1 text-xs py-1.5 px-2 font-semibold rounded-lg transition-all ${
              activeTab === 'forecast' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            AI Forecast
          </button>
        </div>

      </div>
    </header>
  );
};
