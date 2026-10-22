import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';

interface BrandStoryProps {
  onLearnMore: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ onLearnMore }) => {
  return (
    <section className="py-16 lg:py-24 bg-[#FFFDF9] border-b border-[#E8DDD2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>ELASIRS BRAND STORY · Philosophy & Sourcing</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase leading-tight">
              A SCENT WITH A STORY
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base text-[#756B63] font-light leading-relaxed">
              <p>
                At Maison ELASIRS, we believe fragrance is the most intimate form of self-expression. It is the invisible memory you leave behind in every room you enter.
              </p>
              <p>
                Every formulation is guided by classical French perfumery architecture, enriched with rare Indian and Mediterranean botanicals. We age our pure oil concentrates for a minimum of 120 days to ensure a round, radiant, and enduring sillage.
              </p>
            </div>

            {/* Atelier credentials metrics */}
            <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-[#E8DDD2]">
              <div>
                <span className="block text-2xl lg:text-3xl font-serif-luxury text-[#B8945F] font-normal tabular-nums">
                  100%
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#756B63] mt-1 block font-medium">
                  Cruelty Free
                </span>
              </div>
              <div>
                <span className="block text-2xl lg:text-3xl font-serif-luxury text-[#B8945F] font-normal tabular-nums">
                  120 Days
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#756B63] mt-1 block font-medium">
                  Natural Maceration
                </span>
              </div>
              <div>
                <span className="block text-2xl lg:text-3xl font-serif-luxury text-[#B8945F] font-normal tabular-nums">
                  Grasse
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#756B63] mt-1 block font-medium">
                  Heritage Oils
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={onLearnMore}
                className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] font-semibold text-[#292522] hover:text-[#B8945F] transition-colors cursor-pointer"
              >
                <span>EXPLORE OUR PHILOSOPHY</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Split-screen Editorial Image */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#E8DDD2] rounded-sm shadow-md bg-[#FAF3EC]">
              <img
                src="/src/assets/images/brand_story_editorial_1790830714958.jpg"
                alt="Master perfumer formulating ELASIRS flacons in Grasse"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-104"
              />
            </div>

            <div className="mt-2.5 text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#756B63]">
                L'Atelier ELASIRS · Artisan Distillation & Aging
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
