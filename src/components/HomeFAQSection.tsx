import React, { useState } from 'react';
import { ChevronDown, Sparkles, ArrowRight } from 'lucide-react';

interface HomeFAQSectionProps {
  onViewAllFAQ: () => void;
}

export const HomeFAQSection: React.FC<HomeFAQSectionProps> = ({ onViewAllFAQ }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const topQuestions = [
    {
      q: 'How long do ELASIRS perfumes last on the skin?',
      a: 'Due to our 120-day natural cellar aging and high oil concentration (20%–28%), our Eau de Parfum creations consistently yield 8 to 10 hours of noticeable aura, while our Extrait de Parfum compositions offer 12 to 14+ hours of enduring presence.',
    },
    {
      q: 'What is the Discovery Trial policy?',
      a: 'Every 50ml or 100ml flacon includes a complimentary 2ml matching sample vial. We recommend testing the sample first. If the scent does not suit your skin chemistry, return the unopened full flacon within 14 days for a full refund or exchange.',
    },
    {
      q: 'Are ELASIRS perfumes unisex?',
      a: 'Yes. Classical Haute Parfumerie is guided by personal emotion and skin warmth rather than conventional labels. All ELASIRS compositions harmonize uniquely with each patron’s individual skin pH and chemistry.',
    },
    {
      q: 'How does complimentary delivery work?',
      a: 'All domestic orders above ₹4,000 receive complimentary insured priority express shipping. Bottles are packed in shockproof thermal-regulated boxes to guarantee safe arrival.',
    },
    {
      q: 'How does "Create Your Signature Scent" work?',
      a: 'Our bespoke atelier guides you through 5 immersive sensory choices: your core personality essence, desired fragrance family, botanical heart notes, flacon silhouette, and custom engraved label name. Your formula is individually reviewed by our fragrance team and archived in your patron account for lifetime reordering.',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#FAF3EC] border-b border-[#E8DDD2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Client Care</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="mt-2 text-sm text-[#756B63] font-light leading-relaxed">
            Essential answers regarding our botanical compositions, flacon sizing, delivery, and trial guarantee.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {topQuestions.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E8DDD2] rounded-xs overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FFFDF9] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif-luxury text-base sm:text-lg text-[#292522] font-normal">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#B8945F] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#292522]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-[#756B63] leading-relaxed border-t border-[#E8DDD2]/60 pt-3 animate-fade-in font-light">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All FAQ Link */}
        <div className="mt-10 text-center">
          <button
            onClick={onViewAllFAQ}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#292522] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8945F] transition-colors rounded-xs shadow-xs cursor-pointer"
          >
            <span>EXPLORE COMPLETE KNOWLEDGE BASE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
