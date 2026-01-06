import React, { useState } from 'react';
import { leadService } from '../services/leadService';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('form');
    const [formData, setFormData] = useState({
        orderNumber: '',
        reason: 'Fit Issue',
        comments: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        leadService.saveLead('return', formData);
        setStep('success');
    };

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/95 p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-12 relative text-center">
                <button onClick={onClose} className="absolute top-6 right-6 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white">Close</button>

                {step === 'form' ? (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8ca67a] mb-4">Maison Klyora</p>
                            <h2 className="text-3xl font-serif italic text-white mb-2">Concierge Returns</h2>
                            <p className="text-xs text-zinc-500 italic">We regret that the piece did not meet your expectations.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Order Reference</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="KLY-..."
                                    value={formData.orderNumber}
                                    onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Reason</label>
                                <select
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors appearance-none"
                                >
                                    <option>Fit Issue (Too Small/Large)</option>
                                    <option>Material Quality</option>
                                    <option>Change of Mind</option>
                                    <option>Damaged in Transit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Concierge Notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors resize-none"
                                    placeholder="Optional details..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-white text-black py-4 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-200 transition-colors">
                                Request Pickup
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="py-12 space-y-6 animate-fade-in">
                        <div className="w-16 h-16 rounded-full border border-[#8ca67a] flex items-center justify-center mx-auto text-[#8ca67a]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-serif italic text-white">Request Confirmed</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                            A courier will be dispatched to your location to collect the parcel. Please ensure it is sealed in the original packaging.
                        </p>
                        <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-white hover:text-zinc-400 mt-8">Return to Boutique</button>
                    </div>
                )}
            </div>
        </div>
    );
};
