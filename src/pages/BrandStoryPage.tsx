import React from 'react';
import { ArrowLeft, Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface BrandStoryPageProps {
  onBackToShop: () => void;
}

export const BrandStoryPage: React.FC<BrandStoryPageProps> = ({ onBackToShop }) => {
  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 lg:py-20 text-[#292522]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#756B63] hover:text-[#292522] transition-colors mb-10 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-4 h-4 text-[#B8945F]" />
          <span>Back to Collection</span>
        </button>

        {/* Story Header */}
        <div className="text-center pb-12 border-b border-[#E8DDD2]">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>L'Origine & La Vision</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            A SCENT WITH A STORY
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#756B63] font-light max-w-2xl mx-auto italic font-serif-luxury leading-relaxed">
            "At ELASIRS, we believe fragrance is an invisible expression of who you are. Every composition is created to evoke a feeling, preserve a moment and leave an impression long after you have left."
          </p>
        </div>

        {/* Editorial Photo Section */}
        <div className="my-12 overflow-hidden border border-[#E8DDD2] shadow-sm bg-[#FAF3EC] rounded-sm">
          <img
            src="/src/assets/images/brand_story_editorial_1790830714958.jpg"
            alt="Master perfumer formulating ELASIRS compositions in Grasse"
            referrerPolicy="no-referrer"
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="p-4 bg-white text-right text-[11px] uppercase tracking-widest text-[#756B63] border-t border-[#E8DDD2]">
            Maison ELASIRS Botanical Reserve & Cellar Maturation Room
          </div>
        </div>

        {/* Story Prose */}
        <div className="space-y-8 text-sm sm:text-base text-[#756B63] font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif-luxury text-[#292522] uppercase tracking-wide mb-3 font-normal">
              The Architecture of Memory
            </h2>
            <p>
              Founded with the conviction that luxury fragrance should evoke profound emotional intimacy rather than fleeting trendiness, ELASIRS operates at the nexus of classical haute parfumerie and contemporary architectural minimalism.
            </p>
            <p className="mt-4">
              We do not formulate scents to shout across a room. We create multidimensional silhouettes that unfold organically with the natural warmth of your skin—subtle, magnetic, and unmistakably distinct.
            </p>
          </section>

          <section className="pt-6 border-t border-[#E8DDD2]">
            <h2 className="text-2xl font-serif-luxury text-[#292522] uppercase tracking-wide mb-3 font-normal">
              Sustainable Extraction & Pure Extrait
            </h2>
            <p>
              From certified sustainable Mysore sandalwood orchards to hand-plucked night jasmine blossoms harvested in the pre-dawn mist of Grasse, our raw materials undergo minimal thermal processing. Each formula rests in glass demijohn vessels for an unhurried 120-day maturation period before being hand-bottled.
            </p>
          </section>

          <section className="pt-6 border-t border-[#E8DDD2]">
            <h2 className="text-2xl font-serif-luxury text-[#292522] uppercase tracking-wide mb-3 font-normal">
              The Flacon as Modern Sculpture
            </h2>
            <p>
              Each ELASIRS flacon is weighted with solid glass and crowned by a brushed muted gold cap inspired by brutalist jewelry design. Designed to become an enduring heirloom on your vanity long after the final spray is savored.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center pt-8 border-t border-[#E8DDD2]">
          <button
            onClick={onBackToShop}
            className="px-8 py-4 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-colors rounded-xs shadow-xs cursor-pointer"
          >
            DISCOVER THE FRAGRANCES
          </button>
        </div>
      </div>
    </div>
  );
};
