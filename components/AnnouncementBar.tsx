import React, { useState, useEffect } from 'react';

export const AnnouncementBar: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState('');
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const target = new Date();
            // Set deadline to next midnight
            target.setHours(24, 0, 0, 0);

            const diff = target.getTime() - now.getTime();

            const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();
        return () => clearInterval(timer);
    }, []);

    const messages = [
        `Order within ${timeLeft} for Immediate Dispatch`,
        "Complimentary Worldwide Shipping",
        "Private Access: Use Code WELCOME15"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [messages.length]);

    return (
        <div className="bg-black text-white py-2.5 text-center overflow-hidden relative z-[110] border-b border-white/10">
            {/* Subtle Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            <div className="relative">
                <p key={messageIndex} className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-medium text-zinc-200 animate-fade-in-up">
                    {messages[messageIndex]}
                </p>
            </div>
        </div>
    );
};
