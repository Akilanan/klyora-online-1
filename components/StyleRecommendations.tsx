
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { Product } from '../types';

interface StyleRecommendationsProps {
  product: Product;
}

export const StyleRecommendations: React.FC<StyleRecommendationsProps> = ({ product }) => {
  const [advice, setAdvice] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setIsLoading(true);
      // Enhanced context including category and composition as requested
      const promptContext = `
        Product: ${product.name}
        Category: ${product.category}
        Material: ${product.composition}
        Atelier: ${product.origin}
        
        Provide high-fashion editorial styling advice for this piece. 
        Focus on silhouette, complementary textures, and occasion suitability.
        Keep it brief, sophisticated, and professional.
      `;
      
      const result = await geminiService.getStyleRecommendations(promptContext);
      setAdvice(result.text);
      setSources(result.sources);
      setIsLoading(false);
    };
    fetchAdvice();
  }, [product.id, product.name, product.category, product.composition]);

  return (
    <div className="bg-[#fafafa] border border-black/5 p-8 md:p-10 space-y-8 animate-fade-in mt-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#8ca67a] rounded-full animate-pulse shadow-[0_0_10px_rgba(140,166,122,0.5)]"></div>
          <h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#8ca67a]">AI Style Curator</h3>
        </div>
        <span className="text-[7px] uppercase tracking-[0.5em] text-zinc-300 font-bold">Atelier Insights</span>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-2 bg-zinc-200 w-full"></div>
          <div className="h-2 bg-zinc-200 w-5/6"></div>
          <div className="h-2 bg-zinc-200 w-4/6"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
             <h4 className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-400">Seasonal Direction</h4>
             <p className="text-[12px] leading-[2.2] text-zinc-800 font-serif italic uppercase tracking-wider">
               {advice || "Our AI stylist is currently analyzing the latest runway trends to curate your look."}
             </p>
          </div>
          
          <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row gap-10 justify-between items-start md:items-end">
             <div className="space-y-4">
                <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-400">Atelier Selection</p>
                <a 
                  href="https://Klyoraofficial.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-4 text-[10px] text-black font-bold uppercase tracking-[0.2em] transition-all"
                >
                  Shop the Official Collection
                  <span className="w-8 h-[1px] bg-black transition-all group-hover:w-12"></span>
                </a>
             </div>

             {sources.length > 0 && (
               <div className="space-y-4 text-right">
                  <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-400">Grounding Sources</p>
                  <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2">
                    {sources.map((source, idx) => (
                      source.web && (
                        <a 
                          key={idx} 
                          href={source.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[9px] text-zinc-400 hover:text-black transition-colors underline decoration-zinc-200 hover:decoration-black truncate max-w-[150px]"
                        >
                          {source.web.title || `Fashion Source`}
                        </a>
                      )
                    ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
