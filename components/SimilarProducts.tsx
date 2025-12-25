
import React from 'react';
import { BoutiqueImage } from './BoutiqueImage';

interface SimilarProductsProps {
  currentProductId: string;
  products: any[]; // Using any[] to match catalog structure easily, or proper Product type
  currency?: string;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProductId, products, currency = '$' }) => {
  // Find current product to get category
  const currentProduct = products.find(p => p.id === currentProductId);

  // Find related products: Same category, excluding current product
  const suggested = products
    .filter(p => p.id !== currentProductId && p.category === currentProduct?.category)
    .slice(0, 4);

  if (suggested.length === 0) return null;

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-300">Atelier Curation</h4>
        <p className="text-3xl font-serif italic text-black">Curated Pairings.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {suggested.map((item) => (
          <div key={item.id} className="group cursor-pointer space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
              <BoutiqueImage
                src={item.image}
                alt={item.name}
                aspectRatio="aspect-auto h-full w-full"
                className="group-hover:scale-110 transition-transform duration-[2s]"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <h5 className="text-[9px] uppercase font-bold tracking-[0.2em] truncate text-black">{item.name}</h5>
              <p className="text-[11px] font-serif italic text-zinc-400">{currency}{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
