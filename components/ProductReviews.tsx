
import React, { useState, useEffect } from 'react';
import { geminiService, Review } from '../services/geminiService';

interface ProductReviewsProps {
  productName: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);

      // Load local reviews ONLY
      let localReviews = [];
      try {
        const saved = localStorage.getItem(`klyora_reviews_${productName}`);
        localReviews = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(localReviews)) localReviews = [];
      } catch (e) {
        console.warn("Corrupt review data", e);
        localReviews = [];
      }

      setReviews(localReviews);
      setIsLoading(false);
    };
    fetchReviews();
  }, [productName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const review: Review = {
        id: Math.random().toString(36).substr(2, 9),
        name: newReview.name || 'Boutique Guest',
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setReviews(prev => {
        const updated = [review, ...prev];
        // Save ONLY the new user reviews to local storage to avoid duplicating mock data forever
        const existingLocal = localStorage.getItem(`klyora_reviews_${productName}`);
        const localParsed = existingLocal ? JSON.parse(existingLocal) : [];
        localStorage.setItem(`klyora_reviews_${productName}`, JSON.stringify([review, ...localParsed]));
        return updated;
      });

      setNewReview({ rating: 5, comment: '', name: '' });
      setIsSubmitting(false);
      setShowForm(false);
    }, 800);
  };

  const StarRating = ({ rating, interactive = false, onRate }: { rating: number, interactive?: boolean, onRate?: (r: number) => void }) => (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}`}
        >
          <svg
            className={`w-3 h-3 ${star <= rating ? 'fill-[#8ca67a]' : 'fill-none stroke-black/10 stroke-1'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-16">
      <div className="flex justify-between items-end border-b border-black/5 pb-8">
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-300">Client Reflections</h3>
          <p className="text-3xl font-serif italic text-black">What they felt.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[9px] uppercase tracking-[0.4em] font-bold text-black border-b border-black pb-1 hover:opacity-50 transition-all"
          >
            Add Reflection
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-zinc-50 p-10 border border-black/5 animate-fade-in-up">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-[9px] uppercase font-bold tracking-[0.3em]">Submit Reflection</h4>
            <button onClick={() => setShowForm(false)} className="text-[18px] text-zinc-300 hover:text-black">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-400">Sentiment Intensity</span>
              <StarRating rating={newReview.rating} interactive onRate={(r) => setNewReview(prev => ({ ...prev, rating: r }))} />
            </div>
            <input
              type="text"
              placeholder="Name or Pseudonym"
              className="w-full bg-transparent border-b border-black/10 p-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-all"
              value={newReview.name}
              onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
            />
            <textarea
              placeholder="Your reflection on the drape, silhouette, or textile..."
              className="w-full bg-transparent border-b border-black/10 p-4 text-[12px] uppercase tracking-widest outline-none focus:border-black min-h-[120px] resize-none transition-all font-light"
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newReview.comment.trim()}
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all disabled:opacity-20 shadow-xl"
            >
              {isSubmitting ? 'Securing Submission...' : 'Publish Reflection'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-16">
        {/* APP INTEGRATION WIDGETS */}
        {/* Judge.me Widget */}
        <div id="judgeme_product_reviews" className="jdgm-widget jdgm-review-widget" data-product-title={productName} data-id={productName}></div>
        {/* Loox Widget */}
        <div id="looxReviews" data-product-id="" className="loox-reviews-default"></div>

        {isLoading ? (
          <div className="space-y-12">
            {[1, 2].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="h-2 bg-zinc-100 w-1/4"></div>
                <div className="h-4 bg-zinc-100 w-full"></div>
                <div className="h-4 bg-zinc-100 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-[11px] uppercase tracking-widest text-zinc-300 italic text-center py-10">No reflections yet recorded for this silhouette.</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="animate-fade-in group space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black">{rev.name}</span>
                  <StarRating rating={rev.rating} />
                </div>
                <span className="text-[8px] uppercase tracking-widest text-zinc-300 font-bold">{rev.date}</span>
              </div>
              <p className="text-[15px] leading-[1.8] text-zinc-700 font-serif italic font-light group-hover:text-black transition-colors">
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
