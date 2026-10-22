import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Review } from '../types';

interface TestimonialsProps {
  reviews: Review[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ reviews }) => {
  return (
    <section className="py-16 lg:py-24 bg-[#FAF3EC] border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
            REVIEWS & PATRON IMPRESSIONS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            LOVED BY THOSE WHO WEAR IT
          </h2>
          <p className="mt-3 text-sm text-[#756B63] leading-relaxed">
            Real encounters from patrons who have made ELASIRS their signature olfactory memory.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 4).map(rev => (
            <div
              key={rev.id}
              className="bg-white border border-[#E8DDD2] rounded-sm p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#B8945F]/50 transition-all duration-300"
            >
              <div>
                {/* Star Rating */}
                <div className="flex items-center gap-1 text-[#B8945F] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-[#B8945F] text-[#B8945F]' : 'text-[#E8DDD2]'
                      }`}
                    />
                  ))}
                </div>

                {/* Fragrance tagged */}
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] font-semibold block mb-2">
                  {rev.productName}
                </span>

                {/* Review Title */}
                <h4 className="font-serif-luxury text-lg text-[#292522] font-normal mb-2 leading-snug">
                  "{rev.title}"
                </h4>

                {/* Comment */}
                <p className="text-xs text-[#756B63] leading-relaxed font-light line-clamp-4">
                  {rev.comment}
                </p>
              </div>

              {/* Author & Verification */}
              <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#292522] tracking-wide">
                    {rev.customerName}
                  </p>
                  <p className="text-[10px] text-[#756B63] mt-0.5">
                    {rev.date}
                  </p>
                </div>

                {rev.verified && (
                  <div className="flex items-center gap-1 text-[10px] text-[#B8945F] tracking-wider uppercase font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
