
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

interface SizeRecommenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
}

export const SizeRecommenderModal: React.FC<SizeRecommenderModalProps> = ({ isOpen, onClose, productName }) => {
    const [step, setStep] = useState(1);
    const [measurements, setMeasurements] = useState({ height: '', weight: '', preference: 'regular' });
    const [recommendation, setRecommendation] = useState<{ size: string; rationale: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleCalculate = async () => {
        setIsLoading(true);

        const rec = await geminiService.getSizeRecommendation({
            height: parseInt(measurements.height),
            weight: parseInt(measurements.weight),
            chest: 0,
            waist: 0,
            hips: 0,
            preferredFit: measurements.preference === 'tight' ? 'Slim' : measurements.preference === 'loose' ? 'Oversized' : 'Regular'
        }, { name: productName });

        setRecommendation(rec);
        setIsLoading(false);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white p-8 shadow-2xl animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-6">
                    <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-1">Klyora Atelier</h3>
                    <h2 className="text-xl font-serif italic">Find My Fit</h2>
                </div>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[8px] uppercase tracking-widest text-zinc-500 mb-2">Height (cm)</label>
                                <input
                                    type="number"
                                    placeholder="175"
                                    className="w-full bg-zinc-50 border-b border-zinc-200 p-2 text-sm outline-none focus:border-black"
                                    value={measurements.height}
                                    onChange={e => setMeasurements({ ...measurements, height: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] uppercase tracking-widest text-zinc-500 mb-2">Weight (kg)</label>
                                <input
                                    type="number"
                                    placeholder="70"
                                    className="w-full bg-zinc-50 border-b border-zinc-200 p-2 text-sm outline-none focus:border-black"
                                    value={measurements.weight}
                                    onChange={e => setMeasurements({ ...measurements, weight: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[8px] uppercase tracking-widest text-zinc-500 mb-2">Fit Preference</label>
                            <div className="flex gap-2">
                                {['tight', 'regular', 'loose'].map(pref => (
                                    <button
                                        key={pref}
                                        onClick={() => setMeasurements({ ...measurements, preference: pref })}
                                        className={`flex-1 py-3 text-[9px] uppercase tracking-widest border transition-colors ${measurements.preference === pref ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-400 hover:border-black'}`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={!measurements.height || !measurements.weight || isLoading}
                            className="w-full bg-black text-white py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50 mt-2"
                        >
                            {isLoading ? 'Analyzing...' : 'Calculate Size'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center animate-fade-in">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-4">Recommended Size</p>
                        <div className="text-4xl font-serif mb-4 flex justify-center items-center gap-2">
                            <span className="w-12 h-12 rounded-full bg-[#8ca67a] text-white flex items-center justify-center">
                                {recommendation?.size}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed font-light mb-6">
                            "{recommendation?.rationale}"
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full border border-black text-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                        >
                            Add to Bag
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
