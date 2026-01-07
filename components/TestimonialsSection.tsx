import React from 'react';

import { TESTIMONIALS } from '../data/testimonials';

export const TestimonialsSection: React.FC = () => {
    return (
        <section className="bg-zinc-50 py-24 border-t border-black/5">
            <div className="max-w-[1600px] mx-auto px-10">
                <div className="text-center mb-16">
                    <span className="text-[9px] uppercase tracking-[0.6em] text-[#8ca67a] font-bold block mb-4">Client Reflections</span>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-black">Distinguished Voices</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((review) => (
                        <div key={review.id} className="bg-white p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-shadow duration-500 border border-black/5 relative group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white text-[10px] uppercase font-bold px-3 py-1 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                {review.product}
                            </div>

                            <div className="flex justify-center gap-1 mb-6 text-[#8ca67a]">
                                {[...Array(Math.round(review.rating))].map((_, i) => (
                                    <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>

                            <blockquote className="text-center mb-8">
                                <p className="font-serif italic text-lg leading-relaxed text-zinc-800">"{review.text}"</p>
                            </blockquote>

                            <div className="text-center border-t border-black/5 pt-6">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1">{review.name}</p>
                                <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-400 uppercase tracking-wider">
                                    <span>{review.location}</span>
                                    <span>•</span>
                                    <span className={review.role.includes('VIP') ? 'text-black font-bold' : 'text-[#8ca67a]'}>{review.role}</span>
                                    {review.role === 'Verified Client' && (
                                        <svg className="w-3 h-3 text-[#8ca67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
