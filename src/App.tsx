import React, { useState } from 'react';
import { POSProvider } from './context/POSContext';
import { Header } from './components/Header';
import { CheckoutScreen } from './components/CheckoutScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { AIForecastScreen } from './components/AIForecastScreen';
import { SyncDiagnosticsModal } from './components/SyncDiagnosticsModal';
import { FlutterCodeViewerModal } from './components/FlutterCodeViewerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'reports' | 'forecast'>('pos');
  const [showSyncDiagnostics, setShowSyncDiagnostics] = useState<boolean>(false);
  const [showFlutterCode, setShowFlutterCode] = useState<boolean>(false);

  return (
    <POSProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#0B0F19] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
        
        {/* Main Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSyncDiagnostics={() => setShowSyncDiagnostics(true)}
          onOpenFlutterCode={() => setShowFlutterCode(true)}
          onOpenBarcodeScanner={() => {
            setActiveTab('pos');
          }}
        />

        {/* Tab Views */}
        <main className="flex-1">
          {activeTab === 'pos' && <CheckoutScreen />}
          {activeTab === 'inventory' && <InventoryScreen />}
          {activeTab === 'reports' && <ReportsScreen onNavigateToForecast={() => setActiveTab('forecast')} />}
          {activeTab === 'forecast' && <AIForecastScreen />}
        </main>

        {/* Sync Diagnostics Modal */}
        {showSyncDiagnostics && (
          <SyncDiagnosticsModal onClose={() => setShowSyncDiagnostics(false)} />
        )}

        {/* Flutter Source Code Modal */}
        {showFlutterCode && (
          <FlutterCodeViewerModal onClose={() => setShowFlutterCode(false)} />
        )}

      </div>
    </POSProvider>
  );
}

