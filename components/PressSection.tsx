
import React from 'react';

const LOGOS = [
    {
        name: "VOGUE",
        svg: (
            <svg viewBox="0 0 100 30" fill="currentColor" className="h-full w-auto">
                <path d="M9.1 0h1.8L18 21.6 25.1 0h1.8L18.8 24.5h-1.6L9.1 0zM34.8 12.3c0 7.2-4.1 12.7-10.7 12.7-6.6 0-10.7-5.5-10.7-12.7S17.5 0 24.1 0c6.6 0 10.7 5.6 10.7 12.3zm-1.8 0c0-6.1-3.6-11-8.9-11s-8.9 4.9-8.9 11 3.6 11 8.9 11 8.9-4.8 8.9-11zM52.3 23.3c-1.3.8-3.7 1.7-6.5 1.7-6.1 0-10.3-4.8-10.3-12.5S39.9 0 46.5 0c2.7 0 4.8.7 6.1 1.5l-.6 1.4c-1.3-.8-3.3-1.4-5.5-1.4-5.2 0-8.6 4.1-8.6 11s3.3 11 8.2 11c2.1 0 4.4-.7 5.6-1.5l.6 1.3zM67.9 0v16.1c0 5-2.5 7.6-6.4 7.6-4.1 0-6.6-2.8-6.6-7.6V0h-1.8v16.3c0 5.8 3.3 9.2 8.4 9.2 5 0 8.2-3.3 8.2-9.2V0h-1.8zM87.6 1.6v22.9h6.8v1.6H77v-1.6h6.7V1.6H77V0h17.3v1.6h-6.7z" />
            </svg>
        )
    },
    {
        name: "HARPER'S BAZAAR",
        svg: (
            <svg viewBox="0 0 200 30" fill="currentColor" className="h-full w-auto">
                <path d="M12.5 1.8h-4v10.6H4V1.8H0v26.4h4V14h4.5v14.2h4V1.8zm21 0h-4.3l-6.8 26.4h4.3l1.1-4.9h6.9l1.1 4.9H40l-6.5-26.4zm-4.7 18.2l2.5-11 2.5 11h-5zm20.8-6.7h-3.4v14.9h-4V1.8h7.9c4.4 0 7.4 2.6 7.4 6.3 0 2.8-1.7 4.7-3.9 5.6l5.2 12.7h-4.6l-4.6-11.4v-.1zm-.4-3.3v-6.7h3.3c2.3 0 3.8 1.1 3.8 3.2s-1.5 3.5-3.8 3.5h-3.3zm21.5 0h-3.4v14.9h-4V1.8h7.9c4.4 0 7.4 2.6 7.4 6.3 0 2.8-1.7 4.7-3.9 5.6l5.2 12.7h-4.6l-4.6-11.4v-.1zm-.4-3.3v-6.7h3.3c2.3 0 3.8 1.1 3.8 3.2s-1.5 3.5-3.8 3.5h-3.3zm22.4 18.2h8.3v-3.3h-4.3v-8h4v-3.4h-4v-7h4.3V1.8h-8.3v26.4zm23.2 0l-3.3-10.4h-2.5v10.4h-4V1.8h8.3c4.2 0 7.2 2.7 7.2 6.5 0 3.3-2.1 5.3-4.5 6l5.1 13.9H116l-3.7-10zm-.8-13.6c2.1 0 3.5 1.2 3.5 3.3 0 2.2-1.4 3.4-3.5 3.4h-2.9V4.6h2.9z" />
            </svg>
        )
    },
    {
        name: "ELLE",
        svg: (
            <svg viewBox="0 0 100 30" fill="currentColor" className="h-full w-auto">
                <path d="M15 1.5v27h14.5v-4.5H19.5v-7h8v-4.5h-8v-6.5h10v-4.5H15zm17 0v27h14.5v-4.5h-10v-22.5h-4.5zm17 0v27h14.5v-4.5h-10v-22.5H49zm17 0v27h14.5v-4.5h-10v-7h8v-4.5h-8v-6.5h10v-4.5H66z" />
            </svg>
        )
    },
    {
        name: "VANITY FAIR",
        svg: (
            <svg viewBox="0 0 150 30" fill="currentColor" className="h-full w-auto">
                <path d="M7.4 1.8L0 23.5h3.6l1.6-4.9h9.1l1.7 4.9H20L12.7 1.8H7.4zm-1 14.2l3.2-9.6 3.3 9.6H6.4zm24.9-14.2h-3.4v13.5L20.8 1.8h-4v21.7h3.4V10l7.1 13.5h4V1.8zm6.5 21.7h3.4V1.8h-3.4v21.7zm13.1-18.3h-5.6V1.8H60v3.4h-5.6v18.3h-3.4V5.2zm12 18.3h3.5v-9L72 1.8h-3.8l4 9.5-4 12.2zm11.4 0h3.4v-9h6v-3.4h-6V5.2h6.5V1.8h-9.9v21.7zm18.4 0l-1.3-4.4h-6.2l-1.3 4.4h-3.5l5.8-21.7h4.3l5.8 21.7h-3.6zm-2.3-7.8l-2.1-7.2-2.1 7.2h4.2zm9.1 7.8h3.4V1.8h-3.4v21.7zm12.3 0l-3.3-10.4h-2.5v10.4h-4V1.8h8.3c4.2 0 7.2 2.7 7.2 6.5 0 3.3-2.1 5.3-4.5 6l5.1 13.9h-4.6l-3.7-10zm-.8-13.6c2.1 0 3.5 1.2 3.5 3.3 0 2.2-1.4 3.4-3.5 3.4h-2.9V4.6h2.9z" />
            </svg>
        )
    }
];

export const PressSection: React.FC = () => {
    return (
        <section className="w-full bg-black border-t border-white/10 py-12 md:py-16">
            <div className="max-w-[1400px] mx-auto px-6 text-center">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 mb-8 font-light">
                    FEATURED IN
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
                    {LOGOS.map((logo) => (
                        <div key={logo.name} className="h-6 md:h-8 text-white w-auto object-contain">
                            {logo.svg}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
