import React from 'react';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // TODO: User should replace this with their actual Shiprocket Return Page URL
    const SHIPROCKET_RETURN_URL = "https://klyora-2.myshopify.com/apps/return_prime";

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/95 p-4 animate-fade-in backdrop-blur-sm">
            <div className="w-full max-w-lg bg-zinc-900/90 border border-white/10 p-12 relative text-center">
                <button onClick={onClose} className="absolute top-6 right-6 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white">Close</button>

                <div className="space-y-8 animate-fade-in">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#8ca67a] mb-4">Maison Klyora</p>
                        <h2 className="text-3xl font-serif italic text-white mb-2">Concierge Returns</h2>
                        <p className="text-xs text-zinc-500 italic max-w-xs mx-auto">
                            To ensure a seamless experience, our returns are handled through our dedicated logistics partner portal.
                        </p>
                    </div>

                    <div className="py-8 border-y border-white/5">
                        <div className="flex flex-col gap-4 items-center">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Step 1: Locate Order</p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Step 2: Select Items</p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Step 3: Schedule Pickup</p>
                        </div>
                    </div>


                    <a
                        href="mailto:concierge@klyora.com?subject=Return%20Request%20-%20Order%20%23"
                        className="block w-full bg-white text-black py-4 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-200 transition-colors"
                    >
                        Email Concierge to Return
                    </a>

                    <p className="text-[9px] text-zinc-600 mt-4">
                        Powered by Shiprocket Automated Logistics
                    </p>
                </div>
            </div>
        </div>
    );
};
