
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';

interface ThreeSixtyViewerProps {
  productImage: string;
  productName: string;
  className?: string;
}

export const ThreeSixtyViewer: React.FC<ThreeSixtyViewerProps> = ({ productImage, productName, className = "" }) => {
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  const startXRef = useRef(0);
  const frameOnStartRef = useRef(0);
  const autoRotateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const loadFrames = async () => {
      setIsLoading(true);
      // We explicitly request more frames for a smoother rotation
      const generated = await geminiService.generateSpinFrames(productImage, productName);
      if (generated.length > 0) {
        setFrames(generated);
      } else {
        setFrames([productImage]);
      }
      setIsLoading(false);
    };
    loadFrames();
  }, [productImage, productName]);

  // Auto-Orbit Logic
  useEffect(() => {
    if (isAutoRotating && frames.length > 1 && !isDragging) {
      autoRotateTimerRef.current = window.setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, 3000); // Slower, more majestic rotation
    }
    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  }, [isAutoRotating, frames.length, isDragging]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    frameOnStartRef.current = currentFrame;
    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || frames.length < 2) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = clientX - startXRef.current;
    
    // Improved Sensitivity: 60px per frame change for smoother precision
    const sensitivity = 60;
    const frameOffset = Math.floor(deltaX / sensitivity);
    
    let nextFrame = (frameOnStartRef.current - frameOffset) % frames.length;
    if (nextFrame < 0) nextFrame = frames.length + nextFrame;
    
    setCurrentFrame(nextFrame);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, frames]);

  return (
    <div 
      className={`relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#fcfcfc] select-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div className="w-10 h-10 border border-black/5 border-t-black rounded-full animate-spin mb-6"></div>
          <p className="text-[9px] uppercase tracking-[0.6em] font-bold text-zinc-400">Rendering Atelier 360°</p>
        </div>
      ) : (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in">
          <div className="bg-black/90 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
            <svg className={`w-3.5 h-3.5 text-[#8ca67a] ${isDragging ? 'animate-none' : 'animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[8px] uppercase tracking-[0.4em] text-white font-bold">
              {isDragging ? 'Adjusting Angle' : 'Interactive Silhouette'}
            </span>
          </div>
        </div>
      )}

      <div className="w-full h-full relative">
        {frames.map((src, idx) => (
          <img 
            key={idx}
            src={src} 
            alt={`${productName} Angle ${idx}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${idx === currentFrame ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>

      <div className="absolute bottom-10 left-10 flex items-center gap-6 z-10">
        <div className="flex gap-1.5">
          {frames.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-[1.5px] transition-all duration-700 ${idx === currentFrame ? 'bg-black w-12' : 'bg-black/5 w-4'}`} 
            />
          ))}
        </div>
        <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-300">
          Frame 0{currentFrame + 1}
        </span>
      </div>
    </div>
  );
};
