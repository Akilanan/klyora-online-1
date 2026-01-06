import React, { useState } from 'react';
import { leadService } from '../services/leadService';

interface PressPortalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PressPortalModal: React.FC<PressPortalModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('form'); // form | success
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        handle: '',
        outlet: '',
        type: 'Editorial'
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Save locally
        leadService.saveLead('press', formData);

        // Here we would typically send to an API
        setStep('success');
    };

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/95 p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-12 relative text-center">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white"
                >
                    Close
                </button>

                {step === 'form' ? (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8ca67a] mb-4">Maison Klyora</p>
                            <h2 className="text-3xl font-serif italic text-white mb-2">Press & Creators</h2>
                            <p className="text-xs text-zinc-500 italic">Apply for seeding, showroom access, and editorial loans.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Contact Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Social Handle / Outlet</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="@..."
                                            value={formData.handle}
                                            onChange={e => setFormData({ ...formData, handle: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Inquiry Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white focus:border-white transition-colors appearance-none"
                                        >
                                            <option>Editorial Pull</option>
                                            <option>Seeding / Gifting</option>
                                            <option>Showroom Appointment</option>
                                            <option>Interview Request</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-white text-black py-4 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-200 transition-colors">
                                Submit Application
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="py-12 space-y-6 animate-fade-in">
                        <div className="w-16 h-16 rounded-full border border-[#8ca67a] flex items-center justify-center mx-auto text-[#8ca67a]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-serif italic text-white">Application Received</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                            Thank you, {formData.name}. Our PR team in Paris will review your portfolio. You will receive a response within 48 hours if selected.
                        </p>
                        <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-white hover:text-zinc-400 mt-8">Return to Boutique</button>
                    </div>
                )}
            </div>
        </div>
    );
};
