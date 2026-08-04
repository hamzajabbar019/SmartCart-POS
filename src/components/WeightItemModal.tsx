import React, { useState } from 'react';
import { Product } from '../types';
import { Scale, X, Check, RefreshCw } from 'lucide-react';

interface WeightItemModalProps {
  product: Product;
  currencySymbol: string;
  onConfirm: (product: Product, weightInKg: number) => void;
  onClose: () => void;
}

export const WeightItemModal: React.FC<WeightItemModalProps> = ({
  product,
  currencySymbol,
  onConfirm,
  onClose,
}) => {
  const [weight, setWeight] = useState<number>(1.0);
  const [isLiveScale, setIsLiveScale] = useState<boolean>(true);

  const totalPrice = weight * product.price;

  const handlePreset = (kg: number) => {
    setWeight(kg);
  };

  const handleSimulateScaleReading = () => {
    // Generates a realistic scale reading, e.g. 0.845 kg
    const randomWeight = +(0.2 + Math.random() * 2.5).toFixed(3);
    setWeight(randomWeight);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 tracking-tight">{product.name}</h3>
              <p className="text-xs font-mono text-slate-400">
                Rate: {currencySymbol}{product.price.toFixed(2)} / kg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Scale Indicator Banner */}
        <div className="my-4 p-3 bg-[#111827] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Scale Status: Connected
          </div>
          <button
            onClick={handleSimulateScaleReading}
            className="flex items-center gap-1.5 text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-emerald-400" />
            Read Scale
          </button>
        </div>

        {/* Display Box */}
        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 text-center my-4">
          <div className="text-xs font-semibold text-slate-400 mb-1">
            Measured Weight
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-extrabold text-emerald-400 tracking-tight font-mono">
              {weight.toFixed(3)}
            </span>
            <span className="text-lg font-bold text-slate-300">kg</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center px-2">
            <span className="text-xs font-medium text-slate-400">Item Total:</span>
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {currencySymbol}{totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Manual Weight Adjustment Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Manual Weight (kg):
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={weight}
            onChange={(e) => setWeight(Math.max(0.001, parseFloat(e.target.value) || 0))}
            className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Quick Weight Presets */}
        <div className="mb-6">
          <span className="block text-xs font-medium text-slate-400 mb-2">
            Quick Presets:
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {[0.25, 0.5, 1.0, 2.5, 5.0].map((preset) => (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={`py-2 text-xs font-mono font-semibold rounded-lg border transition-all ${
                  weight === preset
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#111827] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {preset}kg
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (weight > 0) {
                onConfirm(product, weight);
              }
            }}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
};
