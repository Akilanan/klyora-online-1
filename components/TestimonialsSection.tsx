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
                        <div key={review.id} className="bg-white p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-shadow duration-500 border border-black/5 relative group flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex text-[#8ca67a]">
                                        {[...Array(Math.round(review.rating))].map((_, i) => (
                                            <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest text-zinc-300 font-medium">Verified Purchase</span>
                                </div>

                                <blockquote className="mb-8">
                                    <p className="font-serif italic text-lg leading-relaxed text-zinc-800">"{review.text}"</p>
                                </blockquote>
                            </div>

                            <div className="border-t border-black/5 pt-6 mt-auto">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest">{review.name}</p>
                                        <p className="text-[9px] text-zinc-400 uppercase tracking-wider">{review.location}</p>
                                    </div>
                                </div>
                                <p className="text-[9px] text-zinc-400 mt-2">
                                    Purchased: <span className="text-black font-medium border-b border-black/10">{review.product}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
