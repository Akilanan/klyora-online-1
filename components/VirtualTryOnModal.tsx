
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';
import { BoutiqueImage } from './BoutiqueImage';

interface VirtualTryOnModalProps {
    product: Product;
    onClose: () => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ product, onClose }) => {
    const [userImage, setUserImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserImage(reader.result as string);
                setGeneratedImage(null); // Reset previous result
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!userImage) return;
        setIsProcessing(true);
        const result = await geminiService.virtualTryOn(userImage, product.image, product.name);
        setGeneratedImage(result);
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-zinc-900 text-white shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[70vh]">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Left: Input / Visualization */}
                <div className="w-full md:w-2/3 bg-black relative flex items-center justify-center overflow-hidden">
                    {!userImage ? (
                        <div className="text-center space-y-6 p-12">
                            <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h2 className="text-2xl font-serif italic">Virtual Fitting Room</h2>
                            <p className="text-xs uppercase tracking-widest text-zinc-500 max-w-xs mx-auto">Upload a photo to drape the {product.name} onto your silhouette.</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-4 bg-white text-black text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-200 transition-colors"
                            >
                                Upload Photo
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                            <img
                                src={generatedImage || userImage}
                                alt="Fitting Result"
                                className="w-full h-full object-cover opacity-90"
                            />
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <div className="w-10 h-10 border border-white border-t-transparent animate-spin rounded-full mb-4"></div>
                                    <span className="text-xs uppercase tracking-[0.3em] font-bold animate-pulse">Atelier AI Processing...</span>
                                </div>
                            )}
                            {generatedImage && (
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="px-4 py-2 bg-black/50 backdrop-blur text-[9px] uppercase tracking-widest font-bold border border-white/20">Maison Klyora Virtual Fit</span>
                                </div>
                            )}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                {/* Right: Controls & Product */}
                <div className="w-full md:w-1/3 border-l border-white/10 flex flex-col">
                    <div className="flex-1 p-8 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Try On Item</h3>
                            <div className="flex gap-4 items-center">
                                <div className="w-16 aspect-[3/4] bg-zinc-800">
                                    <BoutiqueImage src={product.image} alt={product.name} className="object-cover w-full h-full" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-serif italic">{product.name}</h4>
                                    <p className="text-[10px] uppercase text-zinc-500 mt-1">Virtual Sample</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/10">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Instructions</h3>
                            <ul className="text-xs text-zinc-400 space-y-3 font-light leading-relaxed list-disc list-inside">
                                <li>Upload a clear, full-body or portrait photo.</li>
                                <li>Ensure good lighting for best textile rendering.</li>
                                <li>The AI will interpret the drape and fit.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/10 bg-zinc-900 z-10 space-y-3">
                        {userImage && !generatedImage && (
                            <button
                                onClick={handleGenerate}
                                className="w-full py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-200"
                            >
                                Visualize Fit
                            </button>
                        )}
                        {generatedImage && (
                            <button
                                onClick={() => { setUserImage(null); setGeneratedImage(null); }}
                                className="w-full py-4 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors"
                            >
                                Try Another Photo
                            </button>
                        )}
                        {userImage && !generatedImage && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-4 border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white"
                            >
                                Change Photo
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
