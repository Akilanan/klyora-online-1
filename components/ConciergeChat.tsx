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
                        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                        </button>
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
