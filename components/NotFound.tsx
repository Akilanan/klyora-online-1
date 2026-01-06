import React from 'react';

export const NotFound: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[2000] bg-black text-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <p className="text-[10px] uppercase tracking-[0.5em] text-[#8ca67a] mb-6 animate-pulse">404 Error</p>

            <h1 className="text-4xl md:text-6xl font-serif italic mb-6">You have wandered off the path.</h1>

            <p className="max-w-md text-zinc-500 text-sm leading-relaxed mb-12">
                The Klyora Atelier is vast, but this wing is currently closed for a private viewing.
                Please return to the lobby.
            </p>

            <a href="/" className="px-12 py-4 border border-white/20 text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                Return to Collection
            </a>
        </div>
    );
};
