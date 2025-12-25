
import React, { useState, useRef, useEffect } from 'react';
import { geminiService, ChatMessage } from '../services/geminiService';

interface StylistChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONCIERGE_PRESETS = [
  "Style an evening drape for a winter gala.",
  "2025 seasonal palette recommendations.",
  "Tailoring advice for silk materials.",
  "Minimalist aesthetic gift curation."
];

export const StylistChat: React.FC<StylistChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to the Maison Klyora Atelier. I am your concierge stylist. How may I refine your ensemble today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (isTyping) return;
    const userMsg: ChatMessage = { role: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const modelMsg: ChatMessage = { role: 'model', text: '' };
    setMessages(prev => [...prev, modelMsg]);

    try {
      const stream = geminiService.getStylistResponseStream(messages, text);
      let fullText = '';

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText };
          return newMsgs;
        });
      }
    } catch (e) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'model', text: "I apologize, our boutique server is momentarily offline. Please inquire again shortly." };
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white h-full flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.15)] animate-slide-right overflow-hidden">
        {/* Header */}
        <div className="p-10 md:p-14 border-b border-black/5 bg-white flex justify-between items-center sticky top-0 z-20">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.6em] font-bold text-black mb-2">Concierge Stylist</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8ca67a] animate-pulse"></div>
              <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-bold">Atelier Service Online</span>
            </div>
          </div>
          <button onClick={onClose} className="group flex items-center gap-4 text-[9px] uppercase font-bold tracking-[0.4em] hover:opacity-50 transition-all">
            EXIT <div className="w-8 h-[1px] bg-black group-hover:w-12 transition-all"></div>
          </button>
        </div>

        {/* Chat Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12 no-scrollbar bg-[#fcfcfc]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[90%] relative ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.role === 'model' && (
                  <span className="text-[7px] uppercase tracking-[0.5em] text-[#8ca67a] font-bold block mb-3">Maison Klyora Stylist</span>
                )}
                <div className={`p-8 ${msg.role === 'user' ? 'bg-black text-white shadow-xl' : 'bg-white border border-black/5 text-zinc-800 shadow-sm'}`}>
                  <p className="text-[13px] leading-relaxed tracking-wide uppercase font-light font-serif italic">
                    {msg.text || (isTyping && idx === messages.length - 1 ? '...' : '')}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <span className="text-[7px] uppercase tracking-[0.5em] text-zinc-300 font-bold block mt-3">Verified Client</span>
                )}
              </div>
            </div>
          ))}

          {isTyping && messages[messages.length - 1].text === '' && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-black/5 p-8 flex gap-2">
                <div className="w-1 h-1 bg-black rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Area */}
        <div className="p-10 md:p-14 border-t border-black/5 bg-white space-y-10">
          <div className="flex flex-wrap gap-3">
            {CONCIERGE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="px-5 py-3 border border-black/5 text-[8px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all text-zinc-400"
              >
                {preset}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSend(input); }} className="flex gap-6 items-end">
            <div className="flex-1 relative">
              <label className="text-[7px] uppercase tracking-[0.5em] text-zinc-300 font-bold block mb-3">Inquire At Atelier</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="WHAT SILHOUETTE ARE YOU SEEKING?"
                className="w-full text-[11px] uppercase tracking-[0.3em] border-b border-black/10 outline-none focus:border-black py-4 transition-all bg-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-10 py-5 bg-black text-white text-[9px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all disabled:opacity-20 shadow-xl"
            >
              SEND
            </button>
          </form>

          <p className="text-[7px] uppercase tracking-[0.3em] text-zinc-400 text-center font-medium opacity-50">
            Klyora Digital Boutique Concierge | ID: AT-2025
          </p>
        </div>
      </div>
    </div>
  );
};
