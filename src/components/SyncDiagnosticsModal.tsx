import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { SUPABASE_PHASE1_SQL_SCHEMA } from '../lib/supabase';
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle2,
  Copy,
  AlertTriangle,
  History,
  Layers,
  Code2,
} from 'lucide-react';

interface SyncDiagnosticsModalProps {
  onClose: () => void;
}

export const SyncDiagnosticsModal: React.FC<SyncDiagnosticsModalProps> = ({ onClose }) => {
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    syncQueue,
    syncStatus,
    syncNow,
    conflictLogs,
    lastSyncTime,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'queue' | 'conflicts' | 'supabase_sql'>('queue');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);

  const handleManualSync = async () => {
    setIsSyncingLocal(true);
    await syncNow();
    setIsSyncingLocal(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_PHASE1_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Offline-First Sync Inspector</h3>
              <p className="text-xs text-slate-400">
                Queue status, conflict logging, and Supabase cloud synchronization
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="my-4 p-4 bg-[#111827] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-inner">
          
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-200">
                Network: {isOnline ? 'ONLINE' : 'OFFLINE (Simulated/Disconnected)'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Sync Engine: <span className="font-semibold text-slate-200">{syncStatus}</span>
                {lastSyncTime && ` • Last synced: ${lastSyncTime.toLocaleTimeString()}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulatedOffline}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                isSimulatedOffline
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isSimulatedOffline ? 'Disable Offline Sim' : 'Simulate Offline'}
            </button>

            <button
              onClick={handleManualSync}
              disabled={!isOnline || syncQueue.length === 0 || isSyncingLocal}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLocal ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
          </div>

        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 mb-4">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'queue'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Pending Queue ({syncQueue.length})
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'conflicts'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Conflict Log ({conflictLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('supabase_sql')}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'supabase_sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-sky-400" />
            Supabase SQL Schema
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          
          {activeTab === 'queue' && (
            <div className="space-y-2">
              {syncQueue.map((item) => (
                <div key={item.id} className="bg-[#111827] p-3 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 uppercase">{item.action}</span>
                      <span className="px-2 py-0.5 border border-slate-700 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                        {item.table_name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      Payload ID: {item.payload.id || item.payload.transaction_number || 'Record'}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div>{new Date(item.created_at).toLocaleTimeString()}</div>
                    <span className="text-amber-400 font-semibold uppercase">Queued</span>
                  </div>
                </div>
              ))}

              {syncQueue.length === 0 && (
                <div className="py-12 text-center text-slate-500 font-mono">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-200 uppercase">All Changes Synced!</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Local SQLite/IndexedDB matches cloud Supabase state.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'conflicts' && (
            <div className="space-y-2">
              {conflictLogs.map((log) => (
                <div key={log.id} className="bg-[#111827] p-3 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Entity: {log.entity_type} ({log.entity_id})</span>
                    <span className="text-emerald-400">{log.resolution}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Resolved at: {new Date(log.resolved_at).toLocaleString()}
                  </div>
                </div>
              ))}

              {conflictLogs.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-mono font-medium">
                  No sync conflicts logged. Last-write-wins rule operating cleanly.
                </div>
              )}
            </div>
          )}

          {activeTab === 'supabase_sql' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#111827] p-2 px-3 border border-slate-800 rounded-xl">
                <span className="text-xs font-mono text-slate-400">
                  Copy and paste into your Supabase SQL Editor:
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedSql ? 'Copied!' : 'Copy SQL Script'}
                </button>
              </div>

              <pre className="bg-[#0B0F19] p-4 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80">
                {SUPABASE_PHASE1_SQL_SCHEMA}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
