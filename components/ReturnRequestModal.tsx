
import React, { useState } from 'react';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        orderNumber: '',
        email: '',
        type: 'return', // 'return' or 'replace'
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Construct email body
        const subject = `Return Request: Order #${formData.orderNumber}`;
        const body = `Order Number: ${formData.orderNumber}%0D%0AEmail: ${formData.email}%0D%0AType: ${formData.type.toUpperCase()}%0D%0AReason: ${formData.reason}`;

        // Open default mail client
        window.location.href = `mailto:support@klyoraofficial.com?subject=${subject}&body=${body}`;

        setSubmitted(true);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white p-10 shadow-2xl animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {submitted ? (
                    <div className="text-center space-y-6 py-10">
                        <div className="w-16 h-16 bg-[#8ca67a]/20 text-[#8ca67a] rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-xl font-serif italic">Request Received</h3>
                        <p className="text-sm text-zinc-600 font-light">
                            Our Concierge team will review your request for Order #{formData.orderNumber}. You will receive a shipping label via email shortly.
                        </p>
                        <button onClick={onClose} className="bg-black text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold mt-4 hover:bg-zinc-800 transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-2">Concierge Services</h3>
                            <h2 className="text-2xl font-serif italic">Initiate Return or Replace</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Order Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="#KLY-..."
                                    className="w-full bg-zinc-50 border-b border-zinc-200 p-3 text-sm outline-none focus:border-black transition-colors"
                                    value={formData.orderNumber}
                                    onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="client@example.com"
                                    className="w-full bg-zinc-50 border-b border-zinc-200 p-3 text-sm outline-none focus:border-black transition-colors"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Request Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'return' })}
                                        className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-colors ${formData.type === 'return' ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'}`}
                                    >
                                        Return
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'replace' })}
                                        className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-colors ${formData.type === 'replace' ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'}`}
                                    >
                                        Replace
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Reason</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Please describe why..."
                                    className="w-full bg-zinc-50 border-b border-zinc-200 p-3 text-sm outline-none focus:border-black transition-colors resize-none"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50 mt-4"
                        >
                            {isSubmitting ? 'Processing...' : 'Submit Request'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
