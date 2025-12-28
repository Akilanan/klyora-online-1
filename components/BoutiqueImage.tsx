
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

  const [hasError, setHasError] = useState(false);

  return (
    <div
      ref={imgRef}
      className={`relative w-full ${aspectRatio} skeleton-noir overflow-hidden group/image`}
    >
      {isIntersecting && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setHasError(true); setLoaded(true); }}
          className={`w-full h-full object-cover transition-all duration-[1.5s] cubic-bezier(0.16, 1, 0.3, 1) ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
        />
      )}

      {/* Fallback for broken images */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
          <div className="text-center">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-400 mb-2">Image Archivée</span>
            <span className="font-serif italic text-zinc-300 text-lg">K</span>
          </div>
        </div>
      )}

      {/* Subtle overlay for luxury feel */}
      <div className={`absolute inset-0 bg-white/0 group-hover/image:bg-white/5 transition-colors duration-1000 ${isLoaded ? 'block' : 'hidden'}`} />
    </div>
  );
};
