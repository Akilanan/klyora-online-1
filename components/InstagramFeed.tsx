
import React from 'react';

export const InstagramFeed: React.FC = () => {
    // Stories Data (Static Highlights)
    const stories = [
        { id: 's1', label: 'Runway', img: 'https://images.unsplash.com/photo-1549886369-02ae887b38d3?q=80&w=200' },
        { id: 's2', label: 'Events', img: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=200' },
        { id: 's3', label: 'Atelier', img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=200' },
        { id: 's4', label: 'Press', img: 'https://images.unsplash.com/photo-1507473885765-e6ed05e53335?q=80&w=200' },
        { id: 's5', label: 'Clients', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200' },
    ];

    // Mock Posts with Engagement
    const mockPosts = [
        { id: '1', handle: '@klyora_official', likes: '2.4k', img: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=800', permalink: 'https://klyora-2.myshopify.com/products/silk-dress' },
        { id: '2', handle: '@klyora_official', likes: '1.8k', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800', permalink: 'https://klyora-2.myshopify.com/collections/new-arrivals' },
        { id: '3', handle: '@klyora_official', likes: '4.1k', img: 'https://images.unsplash.com/photo-1618221823713-9806373b88b7?q=80&w=800', permalink: 'https://klyora-2.myshopify.com/products/archive-coat' },
        { id: '4', handle: '@klyora_official', likes: '956', img: 'https://images.unsplash.com/photo-1507473885765-e6ed05e53335?q=80&w=800', permalink: 'https://klyora-2.myshopify.com/collections/accessories' },
        { id: '5', handle: '@klyora_official', likes: '3.2k', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800', permalink: 'https://klyora-2.myshopify.com/products/signature-bag' },
        { id: '6', handle: '@klyora_official', likes: '1.5k', img: 'https://images.unsplash.com/photo-1490481651871-ab253a670147?q=80&w=800', permalink: 'https://klyora-2.myshopify.com/collections/all' }
    ];

    const [posts, setPosts] = React.useState(mockPosts);

    React.useEffect(() => {
        const fetchInstagramData = async () => {
            const token = (import.meta as any).env.VITE_IG_ACCESS_TOKEN;
            const userId = (import.meta as any).env.VITE_IG_USER_ID;
            if (!token || !userId) return;

            try {
                const response = await fetch(`https://graph.facebook.com/v21.0/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,username,like_count&limit=6&access_token=${token}`);
                const data = await response.json();

                if (data && data.data) {
                    const realPosts = data.data.map((item: any) => ({
                        id: item.id,
                        handle: `@${item.username || 'klyoraofficial'}`,
                        likes: item.like_count ? `${(item.like_count / 1000).toFixed(1)}k` : '1.2k',
                        img: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
                        permalink: 'https://klyora-2.myshopify.com/collections/all'
                    }));
                    setPosts(realPosts);
                }
            } catch (error) {
                console.warn("Instagram Feed Error:", error);
            }
        };
        fetchInstagramData();
    }, []);

    return (
        <section className="bg-white py-24 border-t border-black/5 overflow-hidden">
            {/* Header / Stories */}
            <div className="max-w-[1600px] mx-auto px-6 mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-black mb-2">The Social Edit</h2>
                        <a href="https://instagram.com/klyoraofficial" target="_blank" className="font-serif italic text-3xl text-zinc-900 hover:text-[#8ca67a] transition-colors">
                            @klyoraofficial
                        </a>
                    </div>

                    {/* Stories Ring */}
                    <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar w-full md:w-auto justify-center md:justify-end">
                        {stories.map((story) => (
                            <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 group-hover:scale-105 transition-transform duration-300">
                                    <div className="p-[2px] bg-white rounded-full">
                                        <div className="w-14 h-14 rounded-full overflow-hidden">
                                            <img src={story.img} alt={story.label} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] uppercase tracking-wider font-medium">{story.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Posts Grid - Masonry/Reel Layout */}
            <div className="relative w-full overflow-x-auto pb-12 hide-scrollbar">
                <div className="flex px-4 gap-8 min-w-max mx-auto">
                    {posts.map(post => (
                        <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="relative group w-[280px] aspect-[4/5] overflow-hidden bg-zinc-100 shadow-xl cursor-pointer block">
                            <img src={post.img} alt="Social Post" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <div className="bg-white/10 backdrop-blur-md p-4 border border-white/20 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                            <span className="text-xs font-bold">{post.likes}</span>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-wider">Shop Look</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-white/30 mb-2"></div>
                                    <p className="text-[10px] opacity-80 font-serif italic">View on Instagram &rarr;</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <a href="https://instagram.com/klyoraofficial" target="_blank" className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-[#8ca67a] transition-colors">
                    Follow Our Journey
                </a>
            </div>
        </section>
    );
};
