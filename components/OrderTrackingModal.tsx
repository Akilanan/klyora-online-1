
import React, { useState } from 'react';

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [trackingResult, setTrackingResult] = useState<{ status: string; location: string; date: string } | null>(null);

    if (!isOpen) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);

        // Simulate API lookup
        setTimeout(() => {
            setIsSearching(false);
            // Mock result
            setTrackingResult({
                status: 'In Transit',
                location: 'International Logistics Center',
                date: new Date().toLocaleDateString()
            });
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white p-10 shadow-2xl animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-8">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-2">Logistics</h3>
                    <h2 className="text-2xl font-serif italic">Track Your Order</h2>
                </div>

                {trackingResult ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-l-2 border-[#8ca67a] pl-6 py-2 space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Current Status</p>
                            <p className="text-xl font-serif text-[#8ca67a]">{trackingResult.status}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="text-xs text-zinc-500">Location</span>
                                <span className="text-xs font-bold">{trackingResult.location}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <span className="text-xs text-zinc-500">Last Update</span>
                                <span className="text-xs font-bold">{trackingResult.date}</span>
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-4 text-center">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Estimated Delivery</p>
                            <p className="text-sm font-bold mt-1">7-15 Business Days</p>
                        </div>

                        <button
                            onClick={() => setTrackingResult(null)}
                            className="w-full border border-black text-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                        >
                            Track Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div>
                            <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Order Number</label>
                            <input
                                type="text"
                                required
                                placeholder="#KLY-1024"
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-3 text-sm outline-none focus:border-black transition-colors"
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="client@example.com"
                                className="w-full bg-zinc-50 border-b border-zinc-200 p-3 text-sm outline-none focus:border-black transition-colors"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50 mt-4"
                        >
                            {isSearching ? 'Locating...' : 'Search'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
