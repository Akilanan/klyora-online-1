import React, { useEffect, useRef } from 'react';

// Elegant, minimal UI sounds
// Assets located in public/sounds
const SOUNDS = {
    hover: '/sounds/hover_tick.mp3',
    click: '/sounds/click_snap.mp3',
    notification: '/sounds/notification.mp3'
};

// Note: If these URLs expire or fail, the controller handles errors gracefully by just not playing.

export const SoundController: React.FC = () => {
    const hoverAudio = useRef<HTMLAudioElement | null>(null);
    const clickAudio = useRef<HTMLAudioElement | null>(null);
    const lastPlayedRef = useRef<number>(0);

    useEffect(() => {
        hoverAudio.current = new Audio(SOUNDS.hover);
        hoverAudio.current.volume = 0.1; // Very subtle

        clickAudio.current = new Audio(SOUNDS.click);
        clickAudio.current.volume = 0.2;

        const handleMouseOver = (e: MouseEvent) => {
            const now = Date.now();
            // Throttle: Max 1 sound every 50ms to prevent glitches/spam
            if (now - lastPlayedRef.current < 50) return;

            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.className.includes('cursor-pointer')) {
                if (hoverAudio.current) {
                    hoverAudio.current.currentTime = 0;
                    const playPromise = hoverAudio.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { });
                    }
                    lastPlayedRef.current = now;
                }
            }
        };

        const handleClick = (e: MouseEvent) => {
            if (clickAudio.current) {
                clickAudio.current.currentTime = 0;
                const playPromise = clickAudio.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => { });
                }
            }
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return null; // Headless
};
