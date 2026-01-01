
import React from 'react';

export const InstagramFeed: React.FC = () => {
    // Default Mock Data (Fallback)
    const mockPosts = [
        { id: '1', handle: '@sophieturner', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000', permalink: '#' },
        { id: '2', handle: '@emilyinparis', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000', permalink: '#' },
        { id: '3', handle: '@vogue_nyc', img: 'https://images.unsplash.com/photo-1550614000-4b9519e07d0f?q=80&w=1000', permalink: '#' },
        { id: '4', handle: '@london.style', img: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1000', permalink: '#' },
        { id: '5', handle: '@milan.menswear', img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000', permalink: '#' },
        { id: '6', handle: '@klyora_official', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000', permalink: '#' }
    ];

    const [posts, setPosts] = React.useState(mockPosts);

    React.useEffect(() => {
        const fetchInstagramData = async () => {
            const token = import.meta.env.VITE_IG_ACCESS_TOKEN;
            const userId = import.meta.env.VITE_IG_USER_ID;
            if (!token || !userId) return;

            try {
                // Fetch Business Account Media
                const response = await fetch(`https://graph.facebook.com/v21.0/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,username&limit=6&access_token=${token}`);
                const data = await response.json();

                if (data && data.data) {
                    const realPosts = data.data.map((item: any) => ({
                        id: item.id,
                        handle: `@${item.username || 'klyoraofficial'}`,
                        // Use thumbnail for videos, media_url for images
                        img: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
                        permalink: item.permalink
                    }));
                    setPosts(realPosts);
                }
            } catch (error) {
                console.warn("Instagram Feed Error (Using Mock Data):", error);
            }
        };

        fetchInstagramData();
    }, []);

    return (
        <section className="bg-white py-24 border-t border-black/5 overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-black mb-2">As Seen On You</h2>
                <div className="flex items-center justify-center gap-2">
                    <p className="font-serif italic text-2xl text-zinc-500">#MaisonKlyora</p>
                    {posts !== mockPosts && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live Connection Active"></span>}
                </div>
            </div>

            <div className="relative w-full overflow-x-auto pb-8 hide-scrollbar">
                <div className="flex px-4 gap-4 md:gap-1.5 min-w-max mx-auto">
                    {posts.map(post => (
                        <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="relative group w-[200px] md:w-[250px] aspect-square overflow-hidden cursor-pointer block">
                            <img src={post.img} alt={`Klyora style ${post.handle}`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                <span className="text-white text-[9px] uppercase tracking-widest font-bold">Shop This Look</span>
                                <span className="text-white/70 text-[8px] tracking-wider">{post.handle}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};
