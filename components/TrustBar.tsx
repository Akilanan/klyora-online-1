import React from 'react';

export const TrustBar: React.FC = () => {
    const brands = [
        "Vogue", "Harper's Bazaar", "Elle", "Vanity Fair", "L'Officiel"
    ];

    return (
        <div className="border-y border-white/5 bg-zinc-950 py-8 overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-10 flex flex-col items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-bold">As Seen In</span>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
                    {brands.map((brand, idx) => (
                        <span key={idx} className="font-serif italic text-xl md:text-2xl text-white cursor-default">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
