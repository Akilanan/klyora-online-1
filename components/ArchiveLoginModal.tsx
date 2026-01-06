import React, { useState } from 'react';

interface ArchiveLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: () => void;
}

export const ArchiveLoginModal: React.FC<ArchiveLoginModalProps> = ({ isOpen, onClose, onUnlock }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.toUpperCase() === 'SILENCE' || password.toUpperCase() === 'KLYORA') {
            onUnlock();
            setPassword('');
            setError(false);
            onClose();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/98 animate-fade-in">
            <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white uppercase tracking-widest text-xs">Close</button>

            <div className="w-full max-w-md p-8 text-center">
                <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4">Maison Klyora</p>
                    <h2 className="text-3xl font-serif italic text-white">The Archive</h2>
                    <p className="text-zinc-600 text-xs mt-4 italic">Private access for members only.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Access Code"
                        className="w-full bg-transparent border-b border-white/20 py-3 text-center text-xl text-white font-serif tracking-widest focus:outline-none focus:border-white transition-colors placeholder:text-zinc-800"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-[10px] uppercase tracking-widest animate-shake">Incorrect Access Code</p>}

                    <button type="submit" className="bg-white text-black px-12 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-300 transition-colors">
                        Enter
                    </button>
                </form>

                <p className="mt-12 text-[9px] text-zinc-700 uppercase tracking-widest">Hint: The sound of luxury is _____</p>
            </div>
        </div>
    );
};
