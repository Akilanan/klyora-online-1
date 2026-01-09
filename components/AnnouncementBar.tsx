
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
            <div className="max-w-none w-full overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee pl-full">
                    {[...MESSAGES, ...MESSAGES, ...MESSAGES].map((msg, idx) => (
                        <span key={idx} className="text-[9px] uppercase tracking-[0.25em] font-medium text-zinc-300 mx-8">
                            {msg} <span className="text-[#8ca67a] mx-4">•</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
