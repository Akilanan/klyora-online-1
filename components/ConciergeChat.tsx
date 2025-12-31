
import React, { useState } from 'react';

export const ConciergeChat: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="fixed bottom-6 right-6 z-[999] flex items-center gap-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`bg-white shadow-xl px-4 py-3 rounded-lg border border-zinc-100 transition-all duration-300 origin-right ${isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0 invisible ml-12'}`}>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Klyora Concierge</p>
                <p className="text-xs font-serif italic text-black">Chat with a Stylist</p>
            </div>

            <a href="mailto:support@klyora.com?subject=Concierge%20Inquiry" className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </a>
        </div>
    );
};
