
import React from 'react';

export const JournalSection: React.FC = () => {
    const articles = [
        {
            id: 1,
            category: 'Campaign',
            title: 'The Resort Edit: 2026',
            excerpt: 'Lightweight linens and neutral tones designed for the quiet moments of the season.',
            date: 'Jan 02, 2026',
            image: 'https://images.unsplash.com/photo-1549298916-f52d724204b4?q=80&w=1000'
        },
        {
            id: 2,
            category: 'Atelier',
            title: 'Fabric Care: The Guide',
            excerpt: 'How to maintain the structure and softness of your premium knits for decades to come.',
            date: 'Dec 28, 2025',
            image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000'
        },
        {
            id: 3,
            category: 'Styling',
            title: 'The Art of the Silhouette',
            excerpt: 'Why tailored fits and structured shoulders are the defining elements of modern heritage.',
            date: 'Dec 20, 2025',
            image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'
        }
    ];

    return (
        <section className="bg-white border-t border-black/5 py-32">
            <div className="max-w-[1600px] mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[#8ca67a] font-bold block mb-4">The Journal</span>
                        <h2 className="text-3xl font-serif italic text-black">Insights & Editorials</h2>
                    </div>
                    <button className="text-[9px] uppercase tracking-[0.2em] font-bold border-b border-black pb-1 hover:opacity-50 transition-opacity">
                        Read All Articles
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <article key={article.id} className="group cursor-pointer">
                            <div className="overflow-hidden aspect-[4/5] mb-6 relative">
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] uppercase tracking-widest text-zinc-400">
                                    <span>{article.category}</span>
                                    <span>{article.date}</span>
                                </div>
                                <h3 className="text-lg font-serif italic text-black group-hover:text-[#8ca67a] transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-xs font-light text-zinc-600 leading-relaxed">
                                    {article.excerpt}
                                </p>
                                <span className="inline-block pt-2 text-[9px] uppercase tracking-widest font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">Read Article →</span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
