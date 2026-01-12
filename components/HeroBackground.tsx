import React, { useEffect, useState } from 'react';

const SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2600&auto=format&fit=crop', // Coat/Texture equivalent
        title: "Timeless Silhouettes,",
        subtitle: "Everyday.",
        description: "Premium materials and finish. Refined, logo-free silhouettes designed for the modern connoisseur.",
        cta: "Shop Outerwear",
        align: 'items-center justify-start text-left pl-10 md:pl-24'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2600&auto=format&fit=crop', // Evening Dress equivalent
        title: "Command The Room,",
        subtitle: "Quietly.",
        description: "Meticulous embroidery and tailoring. Timeless silhouettes for statement evenings.",
        cta: "Shop Evening Gowns",
        align: 'items-center justify-center text-center'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed05e53335?q=80&w=2600&auto=format&fit=crop', // Silk/Accessory equivalent
        title: "Timekeeping,",
        subtitle: "Quietly Refined.",
        description: "Citizen Quartz precision movement. Stainless steel classic silver-tone finish.",
        cta: "Discover The Watch",
        align: 'items-end justify-start text-left pl-10 md:pl-24 pb-32'
    }
];

export const HeroBackground: React.FC<{ t: any, onConciergeClick: () => void, onStyleQuizClick: () => void }> = ({ onConciergeClick }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[100vh] w-full overflow-hidden bg-black">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Image with Zoom Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={slide.image}
                            alt="Hero"
                            className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                        />
                    </div>

                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content Container */}
                    <div className={`absolute inset-0 flex flex-col ${slide.align}`}>
                        <div className="max-w-2xl animate-fade-in-up">
                            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-tight mb-6 drop-shadow-lg">
                                {slide.title} <br />
                                <span className="italic font-light opacity-90">{slide.subtitle}</span>
                            </h1>

                            <p className="text-white/80 text-sm md:text-lg font-light tracking-wide mb-10 max-w-md leading-relaxed hidden md:block border-l-2 border-white/20 pl-4">
                                {slide.description}
                            </p>

                            <button
                                onClick={onConciergeClick}
                                className="group relative bg-white text-black px-12 py-4 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-neutral-200 transition-all duration-500 overflow-hidden"
                            >
                                <span className="relative z-10">{slide.cta}</span>
                                <span className="absolute inset-0 bg-neutral-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-4">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-500 rounded-full ${currentSlide === idx ? 'w-12 h-1 bg-white' : 'w-2 h-1 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </section>
    );
};
