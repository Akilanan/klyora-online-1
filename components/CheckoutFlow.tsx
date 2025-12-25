
import React, { useState } from 'react';

interface CheckoutFlowProps {
  onComplete: () => void;
  onBack: () => void;
  total?: number;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onComplete, onBack, total = 0 }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate high-security bank verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 4000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6 animate-fade-in text-white">
        <div className="relative mb-16">
          <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.1)] relative z-10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="absolute inset-0 bg-[#8ca67a] rounded-full animate-ping opacity-20 scale-150"></div>
        </div>
        <h2 className="editorial-heading text-6xl mb-8 font-serif">Awaiting Delivery</h2>
        <p className="text-zinc-400 text-[10px] uppercase tracking-[0.6em] mb-16 max-w-sm leading-relaxed font-bold">
          Your Klyora collection is being curated for white-glove delivery. A tracking dossier has been dispatched to your email.
        </p>
        <button 
          onClick={onComplete}
          className="px-24 py-7 bg-white text-black font-bold uppercase tracking-[0.5em] text-[10px] hover:bg-zinc-200 transition-all shadow-2xl"
        >
          Return to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden animate-fade-in">
      <div className="lg:w-[450px] bg-zinc-900 text-white p-16 lg:p-24 flex flex-col justify-between border-r border-white/5">
        <div>
          <button onClick={onBack} className="group text-[10px] uppercase font-bold tracking-[0.5em] mb-32 flex items-center gap-6 hover:opacity-50 transition-all">
            <span className="w-12 h-[1px] bg-white transition-all group-hover:w-16"></span> Exit Checkout
          </button>
          <span className="text-[10px] uppercase tracking-[0.8em] text-zinc-500 font-bold block mb-10">Klyora Protocol</span>
          <h2 className="font-serif text-6xl tracking-tighter mb-20 leading-tight">Order <br/> Summary</h2>
          
          <div className="space-y-10">
            <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest pb-8 border-b border-white/10">
              <span className="font-serif italic text-zinc-400">Inventory Value</span>
              <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
              <span>Bespoke Logistics</span>
              <span className="text-[#8ca67a]">Complimentary</span>
            </div>
            <div className="pt-8 flex justify-between items-end border-t border-white/10">
               <span className="text-[11px] uppercase tracking-[0.4em] font-bold">Total Payable</span>
               <span className="text-2xl font-serif font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8ca67a]"></div>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400">Secure SSL Terminal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-16 lg:p-32 flex flex-col items-center bg-white overflow-y-auto no-scrollbar">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between mb-32 border-b border-black/5 pb-16">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-6">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${step >= s ? 'bg-black scale-125' : 'bg-zinc-100'}`}></div>
                <span className={`text-[10px] uppercase tracking-[0.5em] font-bold transition-colors duration-700 ${step >= s ? 'text-black' : 'text-zinc-200'}`}>
                  {s === 1 ? 'Destination' : s === 2 ? 'Payment' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <div className="animate-fade-in-up">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
                <div className="md:col-span-2"><h3 className="text-[11px] uppercase tracking-[0.6em] font-bold mb-8 text-zinc-300">Shipping Details</h3></div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">First Name</label>
                  <input type="text" className="checkout-input font-bold border-black/10 text-black" placeholder="REQUIRED" />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Surname</label>
                  <input type="text" className="checkout-input font-bold border-black/10 text-black" placeholder="REQUIRED" />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Electronic Mail</label>
                  <input type="email" className="checkout-input font-bold border-black/10 text-black" placeholder="EMAIL@EXAMPLE.COM" />
                </div>
                <div className="md:col-span-2 pt-12">
                  <input type="text" placeholder="STREET ADDRESS" className="checkout-input font-bold border-black/10 text-black" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-20">
                <div className="p-12 bg-zinc-50 border border-black/5 flex items-center gap-10">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-[11px] uppercase tracking-[0.4em] font-bold">Encrypted Authorization</span>
                     <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Maison Klyora Secure Gateway</span>
                   </div>
                </div>
                <div className="space-y-16">
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="checkout-input font-mono text-lg tracking-[0.5em] font-bold border-black/10 text-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-16">
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Expiry</label>
                      <input type="text" placeholder="MM / YY" className="checkout-input font-bold border-black/10 text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">CVC</label>
                      <input type="text" placeholder="000" className="checkout-input font-bold border-black/10 text-black" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-20 text-center animate-fade-in-up">
                <div className="space-y-6">
                  <h3 className="text-[14px] uppercase tracking-[1em] font-bold text-zinc-200">Validation</h3>
                  <div className="p-20 border border-black/10 bg-zinc-50/30 max-w-sm mx-auto shadow-sm">
                     <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold block mb-8">Amount to Authorize</span>
                     <span className="text-6xl font-serif font-bold tracking-tighter text-black">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-40 flex gap-8">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  className="flex-1 py-7 border border-black/10 text-[10px] font-bold uppercase tracking-[0.5em] hover:border-black transition-all text-black"
                >
                  Return
                </button>
              )}
              <button 
                onClick={() => step < 3 ? setStep(step + 1) : handlePayment()}
                disabled={isProcessing}
                className="flex-[2] py-7 bg-black text-white text-[10px] font-bold uppercase tracking-[0.6em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-6 shadow-2xl disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                    Securing...
                  </>
                ) : (
                  step === 3 ? 'Authorize Acquisition' : 'Proceed'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
