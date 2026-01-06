import React, { useState } from 'react';
import { OrderTrackingSimulation } from './OrderTrackingSimulation';

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-zinc-950 border border-white/10 p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                    Close
                </button>

                <div className="text-center mb-8">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#8ca67a] mb-2">Maison Klyora</p>
                    <h2 className="text-2xl font-serif italic text-white">Logistics</h2>
                </div>

                <OrderTrackingSimulation />
            </div>
        </div>
    );
};
