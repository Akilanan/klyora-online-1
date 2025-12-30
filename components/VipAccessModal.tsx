
import React, { useState } from 'react';

interface VipAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccessGranted: () => void;
}

export const VipAccessModal: React.FC<VipAccessModalProps> = ({ isOpen, onClose, onAccessGranted }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.toUpperCase() === 'KLYORA2025') {
            onAccessGranted();
            onClose();
        } else {
            setError('Incorrect credentials. Access denied.');
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 p-12 text-center animate-fade-scale">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-8">
                    <span className="block text-[9px] uppercase tracking-[0.4em] text-[#8ca67a] mb-4">Members Only</span>
                    <h2 className="font-serif text-3xl italic text-white mb-2">Klyora Privé</h2>
                    <p className="text-zinc-500 text-xs tracking-wide leading-relaxed">
                        Enter your private key to access the Atelier Exclusive collection.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="ENTER KEY"
                            className="w-full bg-black/50 border-b border-white/20 py-3 text-center text-white text-sm tracking-[0.3em] outline-none focus:border-white transition-colors placeholder:text-zinc-700"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-[9px] uppercase tracking-widest mt-3 animate-pulse">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
                    >
                        Unlock Access
                    </button>

                    <p className="text-[9px] text-zinc-600 mt-4">
                        Don't have a key? <a href="#" className="underline underline-offset-4 hover:text-white transition-colors">Apply for Membership</a>
                    </p>
                </form>
            </div>
        </div>
    );
};
