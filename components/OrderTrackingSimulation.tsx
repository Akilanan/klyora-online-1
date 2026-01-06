import React, { useState } from 'react';

export const OrderTrackingSimulation: React.FC = () => {
    const [step, setStep] = useState(0); // 0: Input, 1: Loading, 2: Result
    const [orderId, setOrderId] = useState('');

    React.useEffect(() => {
        const saved = localStorage.getItem('klyora_tracking_state');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.orderId) {
                setOrderId(data.orderId);
                setStep(2); // Restore to result state
            }
        }
    }, []);

    const handleTrack = () => {
        if (!orderId) return;
        setStep(1);
        setTimeout(() => {
            setStep(2);
            localStorage.setItem('klyora_tracking_state', JSON.stringify({ orderId, timestamp: Date.now() }));
        }, 1500);
    };

    const clearTracking = () => {
        setStep(0);
        setOrderId('');
        localStorage.removeItem('klyora_tracking_state');
    };

    if (step === 0) return (
        <div className="text-center py-8 animate-fade-in">
            <p className="mb-4 font-serif italic text-lg">Locate Your Parcel</p>
            <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORDER # (e.g. KLY-8821)"
                className="bg-transparent border-b border-white/30 text-center w-full py-2 mb-6 outline-none uppercase tracking-widest focus:border-white transition-colors"
            />
            <button onClick={handleTrack} className="px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-colors">
                Track Status
            </button>
        </div>
    );

    if (step === 1) return (
        <div className="text-center py-12 animate-fade-in">
            <div className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Retrieving Logistics Data...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-1">Order Reference</span>
                    <span className="font-mono text-lg">{orderId}</span>
                </div>
                <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-1">Estimated Arrival</span>
                    <span className="font-serif italic text-lg">Tomorrow</span>
                </div>
            </div>

            <div className="relative py-4">
                <div className="absolute left-2 top-4 bottom-4 w-px bg-white/20"></div>
                <div className="space-y-6">
                    <div className="relative pl-8 opacity-50">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border border-white bg-black"></div>
                        <p className="text-[10px] uppercase tracking-widest font-bold">Order Placed</p>
                        <p className="text-[9px] opacity-70">Dec 26, 10:42 AM</p>
                    </div>
                    <div className="relative pl-8 opacity-50">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border border-white bg-black"></div>
                        <p className="text-[10px] uppercase tracking-widest font-bold">Dispatched from Paris</p>
                        <p className="text-[9px] opacity-70">Dec 27, 09:15 AM</p>
                    </div>
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#8ca67a] shadow-[0_0_10px_rgba(140,166,122,0.5)]"></div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#8ca67a]">In Transit</p>
                        <p className="text-[9px] opacity-70">Arriving at Local Depot</p>
                    </div>
                </div>
            </div>
            <button onClick={clearTracking} className="w-full text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100 mt-4">Check Another</button>
        </div>
    );
};
