import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../types';
import { Camera, X, Scan, Zap, Search } from 'lucide-react';

interface CameraBarcodeScannerProps {
  products: Product[];
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  products,
  onScan,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string>('');

  const barcodedProducts = products.filter((p) => p.barcode);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCameraPermission(true);
        }
      } catch (err) {
        console.warn('Camera access error or restricted:', err);
        setHasCameraPermission(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSimulateScan = (barcode: string) => {
    setScanMessage(`Scanned: ${barcode}`);
    onScan(barcode);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleSimulateScan(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base tracking-tight">Camera Barcode Scanner</h3>
              <p className="text-xs text-slate-400">Position barcode inside camera viewport</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Camera Preview */}
        <div className="relative my-4 border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] aspect-video flex items-center justify-center">
          {hasCameraPermission === false ? (
            <div className="p-6 text-center text-slate-400">
              <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">Camera Feed Unavailable</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Use test triggers or manual barcode search below.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scan Overlay Box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-28 border-2 border-dashed border-emerald-400 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </div>
              </div>
            </>
          )}

          {scanMessage && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-md">
              {scanMessage}
            </div>
          )}
        </div>

        {/* Manual Barcode Search */}
        <form onSubmit={handleManualSubmit} className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Manual Barcode Entry / Physical Scanner Input:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Scan or type barcode (e.g. 8901234567890)..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
            >
              <Scan className="w-3.5 h-3.5" />
              Find
            </button>
          </div>
        </form>

        {/* Quick Test Barcode Buttons */}
        <div className="overflow-y-auto pr-1 max-h-40">
          <span className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Test Barcodes (Instant Trigger):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {barcodedProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSimulateScan(p.barcode!)}
                className="p-2.5 bg-[#111827] hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all group"
              >
                <div className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">{p.name}</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{p.barcode}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
