import React, { useEffect, useRef } from 'react';

// Elegant, minimal UI sounds
// Using placeholder URLs that are likely to work or need replacement. 
// Ideally, these would be local assets.
const SOUNDS = {
    hover: 'https://ucarecdn.com/13aa3eb3-2287-4348-9366-0744fb837c44/hover_tick.mp3', // Placeholder for a soft tick
    click: 'https://ucarecdn.com/74a05537-567a-4c2f-981f-47240c242045/click_snap.mp3', // Placeholder for a sharp click
    notification: 'https://ucarecdn.com/2c7c569f-8561-4696-98df-8032771d9990/notification.mp3' // Soft chime
};

// Note: If these URLs expire or fail, the controller handles errors gracefully by just not playing.

export const SoundController: React.FC = () => {
    const hoverAudio = useRef<HTMLAudioElement | null>(null);
    const clickAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        hoverAudio.current = new Audio(SOUNDS.hover);
        hoverAudio.current.volume = 0.1; // Very subtle

        clickAudio.current = new Audio(SOUNDS.click);
        clickAudio.current.volume = 0.2;

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.className.includes('cursor-pointer')) {
                if (hoverAudio.current) {
                    hoverAudio.current.currentTime = 0;
                    hoverAudio.current.play().catch(() => { });
                }
            }
        };

        const handleClick = (e: MouseEvent) => {
            if (clickAudio.current) {
                clickAudio.current.currentTime = 0;
                clickAudio.current.play().catch(() => { });
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
