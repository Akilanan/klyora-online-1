import React, { useState } from 'react';

interface LoginModalProps {
    onClose: () => void;
    isOpen: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, isOpen }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate slight delay for effect before "submission"
        // Since we are using a form action, the browser will handle navigation
        const form = e.target as HTMLFormElement;
        form.submit();
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[400px] bg-white shadow-2xl animate-fade-scale p-10 md:p-14">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-2xl font-serif italic text-black mb-2">Welcome Back</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Access your private collection</p>
                </div>

                <form
                    method="post"
                    action="/account/login"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <input type="hidden" name="form_type" value="customer_login" />
                    <input type="hidden" name="utf8" value="✓" />

                    <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-black block ml-1">Email Address</label>
                        <input
                            type="email"
                            name="customer[email]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 p-4 text-sm outline-none focus:border-black transition-colors"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline ml-1">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-black">Password</label>
                            <a href="/account/login#recover" className="text-[8px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            name="customer[password]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 p-4 text-sm outline-none focus:border-black transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all mt-4 disabled:opacity-50"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">New to Klyora?</p>
                    <a
                        href="/account/register"
                        className="text-[10px] uppercase tracking-widest font-bold border border-black px-8 py-3 hover:bg-black hover:text-white transition-all inline-block"
                    >
                        Create Account
                    </a>
                </div>
            </div>
        </div>
    );
};
