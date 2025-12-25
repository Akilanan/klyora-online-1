
import React, { useState, useEffect } from 'react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-10 right-10 z-[150] group flex flex-col items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-zinc-400 group-hover:text-black transition-colors">
        Top
      </span>
      <div className="w-10 h-10 rounded-full border border-black/5 bg-white/80 backdrop-blur-md flex items-center justify-center group-hover:border-black transition-all group-hover:shadow-xl">
        <svg 
          className="w-4 h-4 transition-transform duration-500 group-hover:-translate-y-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.2" 
            d="M5 15l7-7 7 7" 
          />
        </svg>
      </div>
    </button>
  );
};
