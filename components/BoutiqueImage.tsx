
import React, { useState, useEffect, useRef } from 'react';

interface BoutiqueImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export const BoutiqueImage: React.FC<BoutiqueImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  aspectRatio = "aspect-[3/4.5]" 
}) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' } // Load slightly before it enters the viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={`relative w-full ${aspectRatio} skeleton-noir overflow-hidden group/image`}
    >
      {isIntersecting && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[1.5s] cubic-bezier(0.16, 1, 0.3, 1) ${className} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {/* Subtle overlay for luxury feel */}
      <div className={`absolute inset-0 bg-white/0 group-hover/image:bg-white/5 transition-colors duration-1000 ${isLoaded ? 'block' : 'hidden'}`} />
    </div>
  );
};
