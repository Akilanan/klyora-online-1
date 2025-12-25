
import React, { useState } from 'react';
import { Product, UserMeasurements } from '../types';
import { geminiService } from '../services/geminiService';

interface FitAssistantProps {
  product: Product;
  onClose: () => void;
  onApplySize: (size: string) => void;
}

export const FitAssistant: React.FC<FitAssistantProps> = ({ product, onClose, onApplySize }) => {
  const [measurements, setMeasurements] = useState<UserMeasurements>({
    height: 175,
    weight: 70,
    chest: 95,
    waist: 80,
    hips: 95,
    preferredFit: 'Regular'
  });

  const [result, setResult] = useState<{ size: string; rationale: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateFit = async () => {
    setIsCalculating(true);
    const advice = await geminiService.getSizeRecommendation(measurements, product);
    setResult(advice);
    setIsCalculating(false);
  };

  const InputField = ({ label, value, min, max, unit, field }: { label: string, value: number, min: number, max: number, unit: string, field: keyof UserMeasurements }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <label className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-30">{label}</label>
        <span className="text-[11px] font-bold">{value} {unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => setMeasurements(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
        className="w-full h-[1px] bg-black/10 appearance-none cursor-pointer accent-black"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white shadow-2xl animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold">Fit Assistant</h2>
            <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-400 mt-1">Maison Klyora Tailoring Engine</p>
          </div>
          <button onClick={onClose} className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50">Cancel</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {!result ? (
            <div className="space-y-12">
              <div className="space-y-8">
                <InputField label="Stature" field="height" value={measurements.height} min={140} max={210} unit="cm" />
                <InputField label="Mass" field="weight" value={measurements.weight} min={40} max={150} unit="kg" />
                <InputField label="Chest / Bust" field="chest" value={measurements.chest} min={70} max={140} unit="cm" />
                <InputField label="Waist" field="waist" value={measurements.waist} min={60} max={130} unit="cm" />
                <InputField label="Hips" field="hips" value={measurements.hips} min={70} max={140} unit="cm" />
              </div>

              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-30">Desired Silhouette</p>
                <div className="flex gap-2">
                  {['Slim', 'Regular', 'Oversized'].map((fit) => (
                    <button 
                      key={fit}
                      onClick={() => setMeasurements(prev => ({ ...prev, preferredFit: fit as any }))}
                      className={`flex-1 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all ${measurements.preferredFit === fit ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black'}`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={calculateFit}
                disabled={isCalculating}
                className="w-full py-6 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-80 transition-all flex items-center justify-center gap-4"
              >
                {isCalculating ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent animate-spin"></div>
                    Analyzing Dimensions...
                  </>
                ) : (
                  'Generate Recommendation'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center py-8">
                <span className="text-[10px] uppercase tracking-[0.6em] text-zinc-400 block mb-6">Expert Recommendation</span>
                <div className="inline-block px-12 py-8 border border-black relative mb-8">
                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[9px] uppercase tracking-[0.3em] font-bold">Klyora Size</span>
                   <span className="text-7xl font-serif">{result.size}</span>
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] leading-[2.2] text-zinc-600 max-w-sm mx-auto italic">
                  "{result.rationale}"
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-8 border-t border-black/5">
                <button 
                  onClick={() => { onApplySize(result.size); onClose(); }}
                  className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-80 transition-all"
                >
                  Apply Size {result.size}
                </button>
                <button 
                  onClick={() => setResult(null)}
                  className="w-full py-5 border border-black/10 text-[10px] font-bold uppercase tracking-[0.4em] hover:border-black transition-all"
                >
                  Adjust Measurements
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 border-t border-black/5">
          <p className="text-[8px] uppercase tracking-[0.3em] text-center text-zinc-400 leading-relaxed">
            Personalized advice is generated by Klyora's proprietary Fit-AI. <br/>
            Accuracy may vary based on measurement precision.
          </p>
        </div>
      </div>
    </div>
  );
};
