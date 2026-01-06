import React, { useState, useEffect } from 'react';

const CITIES = ['Paris', 'Milan', 'Tokyo', 'New York', 'Zurich', 'Monaco', 'Seoul', 'Stockholm', 'Copenhagen', 'London'];
const ACTIONS = ['acquired', 'viewed', 'saved', 'requested'];
const ITEMS = ['The Cashmere Overcoat', 'Structured Silk Blazer', 'Leather Weekender', 'Merino Turtleneck', 'Pleated Trousers', 'Membership Jacket'];

export const SocialProofToast: React.FC = () => {
    const [notification, setNotification] = useState<{ msg: string; visible: boolean } | null>(null);

    useEffect(() => {
        const scheduleNext = () => {
            // Random delay between 15s and 45s
            const delay = Math.random() * (45000 - 15000) + 15000;

            setTimeout(() => {
                const city = CITIES[Math.floor(Math.random() * CITIES.length)];
                const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
                const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

                let text = '';
                if (action === 'acquired') text = `Acquired by a Private Client in ${city}`;
                else if (action === 'viewed') text = `Active Interest from ${city}: ${item}`;
                else if (action === 'saved') text = `Added to personal archive in ${city}`;
                else text = `Concierge request from ${city}`;

                setNotification({ msg: text, visible: true });

                // Hide after 5s
                setTimeout(() => {
                    setNotification(prev => prev ? { ...prev, visible: false } : null);
                    scheduleNext(); // Re-schedule
                }, 5000);

            }, delay);
        };

        scheduleNext();

        return () => { }; // Cleanup difficult with recursive timeouts, but okay for this scope
    }, []);

    if (!notification) return null;

    return (
        <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-1000 transform ${notification.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)] px-6 py-4 flex items-center gap-4 max-w-sm">
                <div className="w-2 h-2 rounded-full bg-[#8ca67a] animate-pulse"></div>
                <div>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500">Live Activity</p>
                    <p className="text-xs font-serif italic text-black">{notification.msg}</p>
                </div>
            </div>
        </div>
    );
};
