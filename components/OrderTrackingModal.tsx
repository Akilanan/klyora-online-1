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

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-4">Official Courier Partner</p>
                    <a
                        href="https://klyora-2.myshopify.com/apps/shiprocket"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-white hover:text-[#8ca67a] transition-colors"
                    >
                        Track via Shiprocket Service
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
            </div>
        </div>
    );
};
