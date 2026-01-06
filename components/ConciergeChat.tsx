import React, { useState, useRef, useEffect } from 'react';
import { geminiService, ChatMessage } from '../services/geminiService';
import { Product } from '../types';

interface ConciergeChatProps {
    products?: Product[];
}

export const ConciergeChat: React.FC<ConciergeChatProps> = ({ products = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Bonjour. I am Elianne. How may I assist in curating your silhouette today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Stream response
            let fullResponse = "";
            const stream = geminiService.chatWithCatalog([...messages, userMsg], input, products);

            // Add placeholder for streaming
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { role: 'model', text: fullResponse };
                    return newArr;
                });
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Apologies. The atelier is currently busy. Please try again momentarily." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            {!isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 animate-fade-in"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className={`bg-white shadow-xl px-4 py-3 rounded-lg border border-zinc-100 transition-all duration-300 origin-right ${isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0 invisible ml-12'}`}>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Klyora Concierge</p>
                        <p className="text-xs font-serif italic text-black">Chat with a Stylist</p>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[999] w-[350px] md:w-[400px] h-[600px] max-h-[80vh] bg-white text-black shadow-2xl rounded-xl overflow-hidden flex flex-col animate-slide-up border border-zinc-100">
                    {/* Header */}
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Concierge</p>
                            <p className="font-serif italic text-lg">Elianne</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <button onClick={() => window.open('https://calendly.com', '_blank')} className="text-[9px] uppercase tracking-widest border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors rounded">
                                Book Live
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-black text-white rounded-l-xl rounded-tr-xl'
                                    : 'bg-white border border-zinc-100 text-black rounded-r-xl rounded-tl-xl shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-zinc-100 p-3 rounded-r-xl rounded-tl-xl shadow-sm flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-zinc-100">
                        {/* WhatsApp Trigger */}
                        <a
                            href="https://wa.me/1555019988?text=I%20am%20inquiring%20about%20Maison%20Klyora%20access."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] text-white text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 py-2 mb-3 rounded-md hover:opacity-90 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.68-2.03-.967-.272-.297-.471-.421-.909-.421-.446 0-.966.173-1.47.723-.496.545-1.89 1.77-1.89 4.318 0 2.548 1.845 4.974 2.103 5.321.258.348 3.597 5.755 8.847 7.822 3.545 1.739 4.706 1.341 5.448 1.217.742-.124 2.375-.967 2.722-1.922.347-.955.347-1.782.248-1.956z" /></svg>
                            Direct WhatsApp Access
                        </a>

                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about styling, sizing..."
                                className="flex-1 text-sm bg-zinc-50 border-none focus:ring-1 focus:ring-black px-4 py-3 rounded-full"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="p-3 bg-black text-white rounded-full disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
