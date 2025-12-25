
import React, { useState, useEffect, useRef } from 'react';
import { Product, SavedLook, ProductVariant } from '../types';
import { geminiService } from '../services/geminiService';
import { ProductReviews } from './ProductReviews';
import { ThreeSixtyViewer } from './ThreeSixtyViewer';
import { StyleRecommendations } from './StyleRecommendations';
import { FitAssistant } from './FitAssistant';

interface TryOnModalProps {
  product: Product;
  initialStep?: 'upload' | 'camera' | '360';
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onClose: () => void;
  onAddToCart: (p: Product, variant: ProductVariant) => void;
  onSaveLook: (look: Omit<SavedLook, 'id' | 'date'>) => void;
  onEnhanced?: (url: string) => void;
  isAlreadyEnhanced?: boolean;
  enhancedUrl?: string | null;
}

export const TryOnModal: React.FC<TryOnModalProps> = ({ 
  product, 
  initialStep = 'upload', 
  wishlist, 
  onToggleWishlist, 
  onClose, 
  onAddToCart,
  onSaveLook,
  onEnhanced,
  isAlreadyEnhanced = false,
  enhancedUrl = null
}) => {
  const [step, setStep] = useState<'upload' | 'camera' | 'processing' | 'result' | '360' | 'camera-error'>(initialStep as any);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentProductImage, setCurrentProductImage] = useState(enhancedUrl || product.image);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isProcessingTryOn, setIsProcessingTryOn] = useState(false);
  const [isFitAssistantOpen, setIsFitAssistantOpen] = useState(false);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isWishlisted = wishlist.includes(product.id);

  const initCamera = async () => {
    setStep('camera');
    setCameraErrorMsg(null);
    try {
      // Clear any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 1080 }, 
          height: { ideal: 1440 } 
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays
        await videoRef.current.play().catch(e => console.error("Video play failed:", e));
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      let msg = "Camera access denied or dismissed.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Please enable camera permissions in your browser settings to use the AR Atelier.";
      }
      setCameraErrorMsg(msg);
      setStep('camera-error');
    }
  };

  useEffect(() => {
    if (initialStep === 'camera') {
      initCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle image enhancement on mount
  useEffect(() => {
    if (!isAlreadyEnhanced) {
      handleImageEnhancement();
    }
  }, [product, isAlreadyEnhanced]);

  const handleImageEnhancement = async () => {
    setIsEnhancing(true);
    const result = await geminiService.enhanceImage(product.image, product.name);
    if (result) {
      setCurrentProductImage(result);
      onEnhanced?.(result);
    }
    setIsEnhancing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setUserPhoto(photoData);
        processVirtualTryOn(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Stop stream immediately after capture
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      setUserPhoto(dataUrl);
      processVirtualTryOn(dataUrl);
    }
  };

  const processVirtualTryOn = async (photoBase64: string) => {
    setStep('processing');
    setIsProcessingTryOn(true);
    try {
      const result = await geminiService.virtualTryOn(photoBase64, currentProductImage, product.name);
      if (result) {
        setTryOnResult(result);
        setStep('result');
      } else {
        alert("Atelier Synthesis failed. Please try a different photo with clear lighting.");
        setStep('upload');
      }
    } catch (e) {
      setStep('upload');
    } finally {
      setIsProcessingTryOn(false);
    }
  };

  const handleApplySize = (sizeTitle: string) => {
    const variant = product.variants?.find(v => v.title === sizeTitle);
    if (variant) setSelectedVariant(variant);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col animate-slide-right overflow-y-auto no-scrollbar">
      <div className="p-8 flex justify-between items-center sticky top-0 bg-white z-10 border-b border-black/5">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-[#8ca67a] rounded-full animate-pulse"></div>
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold">Klyora Atelier Studio</h2>
        </div>
        <button onClick={onClose} className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50 transition-opacity flex items-center gap-4">
          Exit Studio <span className="w-6 h-[1px] bg-black"></span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-8 gap-12 md:gap-24 max-w-[1800px] mx-auto w-full">
        <div className="flex-1">
          <div className="relative overflow-hidden shadow-2xl bg-zinc-50 aspect-[3/4]">
            {step === '360' ? (
              <ThreeSixtyViewer productImage={currentProductImage} productName={product.name} className="w-full h-full" />
            ) : step === 'camera' ? (
              <div className="relative w-full h-full bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={capturePhoto}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center animate-pulse-glimmer active:scale-90 transition-transform z-20"
                >
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
              </div>
            ) : step === 'camera-error' ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-zinc-100">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-[12px] uppercase tracking-[0.4em] font-bold mb-4">Camera Access Required</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-xs mb-10">
                  {cameraErrorMsg || "We need camera permission to provide the AR fitting experience."}
                </p>
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <button 
                    onClick={initCamera}
                    className="w-full py-4 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
                  >
                    Retry Access
                  </button>
                  <button 
                    onClick={() => setStep('upload')}
                    className="w-full py-4 border border-black/10 text-[9px] font-bold uppercase tracking-widest hover:border-black transition-all active:scale-95"
                  >
                    Upload Photo Instead
                  </button>
                </div>
              </div>
            ) : step === 'processing' ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-white">
                <div className="w-12 h-12 border border-black/10 border-t-black rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.5em] font-bold">Synthesizing At Klyora Lab</p>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 mt-2">Draping {product.name} to your silhouette...</p>
                </div>
              </div>
            ) : step === 'result' ? (
              <div className="w-full h-full overflow-hidden">
                <img src={tryOnResult!} className="w-full h-full object-cover animate-fade-in transition-transform duration-[1.5s] ease-out hover:scale-110" alt="Virtual Try On Result" />
              </div>
            ) : (
              <div className="w-full h-full overflow-hidden">
                <img src={currentProductImage} className={`w-full h-full object-cover transition-all duration-[1.5s] ease-out ${isEnhancing ? 'blur-xl' : 'opacity-100 hover:scale-110'}`} alt={product.name} />
              </div>
            )}
            
            {/* Status Indicator */}
            <div className="absolute bottom-8 right-8 bg-black/90 backdrop-blur-xl text-white px-4 py-2 text-[8px] uppercase tracking-widest font-bold shadow-2xl flex items-center gap-3">
               <div className={`w-1.5 h-1.5 rounded-full ${isProcessingTryOn ? 'bg-amber-400 animate-pulse' : 'bg-[#8ca67a]'}`}></div>
               {isProcessingTryOn ? 'Synthesis In Progress' : 'Atelier Environment Ready'}
            </div>
          </div>

          {step === 'result' && (
            <div className="mt-8 flex gap-4">
              <button onClick={() => setStep('upload')} className="flex-1 py-4 border border-black text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95">New Capture</button>
              <button onClick={() => onSaveLook({ imageUrl: tryOnResult!, productName: product.name })} className="flex-1 py-4 bg-black text-white text-[9px] font-bold uppercase tracking-widest active:scale-95">Archive Look</button>
            </div>
          )}

          <div className="mt-20 border-t border-black/5 pt-12 pb-24">
             <ProductReviews productName={product.name} />
          </div>
        </div>

        <div className="w-full md:w-[450px] space-y-16">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold block mb-4">Official Klyora Design</span>
                <h1 className="text-5xl font-serif mb-6 uppercase tracking-tighter leading-[0.9]">{product.name}</h1>
                <p className="text-[16px] font-bold text-black tracking-widest">${product.price} USD</p>
              </div>
              <button onClick={() => onToggleWishlist(product.id)} className="p-2 transition-transform hover:scale-110">
                <svg className={`w-6 h-6 ${isWishlisted ? 'fill-black' : 'fill-none stroke-black stroke-[1.5px]'}`} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-600 font-light italic">"{product.description}"</p>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] border-b border-black/5 pb-4">Atelier Controls</h4>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="py-6 border border-black/10 flex flex-col items-center gap-3 group hover:border-black transition-all ar-scan-effect animate-pulse-glimmer active:scale-95">
                  <svg className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 group-hover:text-black">Upload Profile</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                <button 
                  onClick={initCamera} 
                  className={`py-6 border flex flex-col items-center gap-3 group transition-all ar-scan-effect animate-pulse-glimmer active:scale-95 ${step === 'camera' ? 'bg-black border-black' : 'border-black/10 hover:border-black'}`}
                >
                  <svg className={`w-5 h-5 transition-opacity ${step === 'camera' ? 'text-white' : 'opacity-40 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className={`text-[8px] uppercase tracking-widest font-bold ${step === 'camera' ? 'text-white' : 'text-zinc-400 group-hover:text-black'}`}>Live Capture</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-baseline border-b border-black/5 pb-4">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.2em]">Sartorial Detail</h4>
                <button onClick={() => setIsFitAssistantOpen(true)} className="text-[8px] uppercase tracking-widest font-bold text-[#8ca67a] hover:opacity-50 transition-opacity">Tailoring Consultation</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map(variant => (
                  <button 
                    key={variant.id}
                    onClick={() => variant.available && setSelectedVariant(variant)}
                    className={`px-4 py-2 border text-[9px] font-bold uppercase tracking-widest transition-all rounded-full ${!variant.available ? 'opacity-20 strike-through' : selectedVariant?.id === variant.id ? 'bg-black text-white border-black' : 'border-black/5 hover:border-black'}`}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
            
            <StyleRecommendations product={product} />
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => selectedVariant && onAddToCart(product, selectedVariant)} 
                disabled={!selectedVariant} 
                className="w-full bg-black text-white py-6 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-2xl disabled:opacity-30 active:scale-[0.98]"
              >
                Incorporate into Collection
              </button>
              <button 
                onClick={() => setStep('360')} 
                className="w-full border border-black/10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:border-black transition-all active:scale-[0.98]"
              >
                Inspect Orbital View
              </button>
            </div>
          </div>
        </div>
      </div>
      {isFitAssistantOpen && <FitAssistant product={product} onClose={() => setIsFitAssistantOpen(false)} onApplySize={handleApplySize} />}
    </div>
  );
};
