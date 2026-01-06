import React, { useState } from 'react';

interface StyleQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (persona: string) => void;
}

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState<string[]>([]);

    if (!isOpen) return null;

    const questions = [
        {
            id: 1,
            title: "Select your Morning View",
            options: [
                { label: "Parisian Balcony", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop", value: "Modernist" },
                { label: "Kyoto Garden", image: "https://images.unsplash.com/photo-1528359556158-b3917a9524be?q=80&w=1922&auto=format&fit=crop", value: "Minimalist" },
                { label: "New York Loft", image: "https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?q=80&w=2070&auto=format&fit=crop", value: "Avant-Garde" }
            ]
        },
        {
            id: 2,
            title: "Choose your material",
            options: [
                { label: "Structured Silk", image: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1963&auto=format&fit=crop", value: "Structured" },
                { label: "Flowing Linen", image: "https://images.unsplash.com/photo-1579762593175-202260549695?q=80&w=1770&auto=format&fit=crop", value: "Flowing" },
                { label: "Heavy Wool", image: "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?q=80&w=1789&auto=format&fit=crop", value: "Textured" }
            ]
        }
    ];

    const handleSelect = (value: string) => {
        const newSelections = [...selections, value];
        setSelections(newSelections);
        if (step < questions.length - 1) {
            setStep(prev => prev + 1);
        } else {
            // Calculate Persona (Mock)
            const persona = newSelections[0] === 'Modernist' ? 'The Modern Mystic'
                : newSelections[0] === 'Minimalist' ? 'The Zen Architect'
                    : 'The City Muse';
            onComplete(persona);
        }
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/95 text-white p-4 animate-fade-in">
            <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white uppercase tracking-widest text-xs z-50">Close</button>

            <div className="w-full max-w-4xl text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#8ca67a] mb-6 animate-fade-in-up">Bureau de Style</p>
                <h2 className="text-3xl md:text-5xl font-serif italic mb-12 animate-fade-scale">{questions[step].title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {questions[step].options.map((option, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSelect(option.value)}
                            className="group cursor-pointer space-y-4 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 ease-out border border-white/5 group-hover:border-white/20">
                                <img src={option.image} alt={option.label} className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">{option.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mt-16">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-0.5 w-12 transition-colors ${i === step ? 'bg-white' : 'bg-white/10'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
