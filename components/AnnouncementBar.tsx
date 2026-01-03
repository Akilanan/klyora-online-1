
import React, { useState, useEffect } from 'react';

const MESSAGES = [
    "Complimentary Worldwide Shipping",
    "The Winter Collection | Available Now",
    "Welcome to Maison Klyora"
];

export const AnnouncementBar: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black text-white py-2.5 text-center border-b border-white/10 relative z-[110]">
            <div className="max-w-[1600px] mx-auto px-4 relative h-4 overflow-hidden">
                {MESSAGES.map((msg, idx) => (
                    <div
                        key={msg}
                        className={`absolute inset-0 w-full transition-all duration-700 ease-in-out flex items-center justify-center transform ${idx === index
                                ? 'opacity-100 translate-y-0'
                                : idx < index
                                    ? 'opacity-0 -translate-y-4'
                                    : 'opacity-0 translate-y-4'
                            }`}
                    >
                        <span className="text-[9px] uppercase tracking-[0.25em] font-medium text-zinc-300">
                            {msg}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
