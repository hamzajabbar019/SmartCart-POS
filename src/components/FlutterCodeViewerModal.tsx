import React, { useState } from 'react';
import { X, Copy, Code2, Download, Check } from 'lucide-react';

interface CodeSnippet {
  filename: string;
  language: string;
  code: string;
}

const FLUTTER_CODE_FILES: CodeSnippet[] = [
  {
    filename: 'pubspec.yaml',
    language: 'yaml',
    code: `name: smartcart_pos
description: SmartCart POS - Cloud-based AI-augmented Point of Sale
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.3.0
  sqflite: ^2.3.0
  path: ^1.8.3
  mobile_scanner: ^5.0.0
  pdf: ^3.10.8
  printing: ^5.11.1
  provider: ^6.0.5
  intl: ^0.18.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    filename: 'lib/database/sqlite_helper.dart',
    language: 'dart',
    code: `import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class SQLiteHelper {
  static Database? _database;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  static Future<Database> _initDB() async {
    String path = join(await getDatabasesPath(), 'smartcart_pos.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        // Products Table
        await db.execute('''
          CREATE TABLE products (
            id TEXT PRIMARY KEY,
            store_id TEXT NOT NULL,
            name TEXT NOT NULL,
            barcode TEXT,
            category TEXT NOT NULL,
            unit_type TEXT NOT NULL,
            price REAL NOT NULL,
            cost REAL NOT NULL,
            stock_quantity REAL NOT NULL,
            low_stock_threshold REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        ''');

        // Transactions Table
        await db.execute('''
          CREATE TABLE transactions (
            id TEXT PRIMARY KEY,
            store_id TEXT NOT NULL,
            transaction_number TEXT NOT NULL,
            subtotal REAL NOT NULL,
            tax REAL NOT NULL,
            total REAL NOT NULL,
            payment_method TEXT NOT NULL,
            amount_paid REAL NOT NULL,
            change_given REAL NOT NULL,
            created_at TEXT NOT NULL,
            synced INTEGER DEFAULT 0
          )
        ''');

        // Sync Queue Table
        await db.execute('''
          CREATE TABLE sync_queue (
            id TEXT PRIMARY KEY,
            table_name TEXT NOT NULL,
            action TEXT NOT NULL,
            payload TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        ''');
      },
    );
  }
}
`,
  },
  {
    filename: 'lib/services/sync_service.dart',
    language: 'dart',
    code: `import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../database/sqlite_helper.dart';

class SyncService {
  final SupabaseClient supabase = Supabase.instance.client;

  Future<void> syncOfflineQueue() async {
    final db = await SQLiteHelper.database;
    final List<Map<String, dynamic>> queue = await db.query('sync_queue');

    for (var item in queue) {
      final String tableName = item['table_name'];
      final String action = item['action'];
      final Map<String, dynamic> payload = jsonDecode(item['payload']);

      try {
        if (action == 'INSERT' || action == 'UPDATE') {
          await supabase.from(tableName).upsert(payload);
        } else if (action == 'DELETE') {
          await supabase.from(tableName).delete().eq('id', payload['id']);
        }

        // Remove from local queue on successful push
        await db.delete('sync_queue', where: 'id = ?', whereArgs: [item['id']]);
      } catch (e) {
        print('Sync error for item \${item['id']}: $e');
      }
    }
  }
}
`,
  },
  {
    filename: 'lib/screens/pos_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';

class POSScreen extends StatefulWidget {
  const POSScreen({Key? key}) : super(key: key);

  @override
  State<POSScreen> createState() => _POSScreenState();
}

class _POSScreenState extends State<POSScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SmartCart POS - Checkout'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {
              // Trigger offline sync
            },
          ),
        ],
      ),
      body: Row(
        children: [
          // Left: Product Catalog Grid
          Expanded(
            flex: 2,
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 1.1,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: 12,
              itemBuilder: (context, index) {
                return Card(
                  child: Center(child: Text('Product $index')),
                );
              },
            ),
          ),
          // Right: Cart Summary Panel
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.grey[100],
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Current Order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const Expanded(child: SizedBox()),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Complete Checkout'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`,
  },
];

interface FlutterCodeViewerModalProps {
  onClose: () => void;
}

export const FlutterCodeViewerModal: React.FC<FlutterCodeViewerModalProps> = ({ onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = FLUTTER_CODE_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Phase 1 Flutter & Dart Source Files</h3>
              <p className="text-xs text-slate-400">
                Native Flutter code structure for Android tablet & web deployment
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex gap-2 overflow-x-auto my-4 pb-2 scrollbar-none">
          {FLUTTER_CODE_FILES.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setSelectedFileIndex(idx)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl border whitespace-nowrap transition-all ${
                selectedFileIndex === idx
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950/30'
                  : 'bg-[#111827] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>

        {/* Code Box */}
        <div className="relative flex-1 border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-[#0B0F19]">
          <div className="flex justify-between items-center bg-[#111827] px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-300">
            <span>{currentFile.filename}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 text-[11px] font-mono font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>

          <pre className="flex-1 p-4 bg-[#0B0F19] overflow-auto text-xs font-mono text-emerald-400 leading-relaxed">
            {currentFile.code}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-right mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
