import React from 'react';
import { Droplets, Clock, ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';

export const WhyElasirsSection: React.FC = () => {
  const pillars = [
    {
      icon: Droplets,
      title: 'High-Concentration Formulations',
      description:
        'Every flacon features 20% to 28% pure perfume oils (Extrait de Parfum & Haute EDP) for round, all-day presence without synthetic sharpness.',
    },
    {
      icon: Clock,
      title: '120-Day Cellar Maturation',
      description:
        'Raw botanical harvests age in glass demijohn vessels for an unhurried 120 days, allowing floral and woody accords to bond seamlessly.',
    },
    {
      icon: Award,
      title: 'Discovery Trial Guarantee',
      description:
        'Every full flacon includes a complimentary 2ml matching sample. Experience the scent on your skin before opening the main presentation box.',
    },
    {
      icon: Truck,
      title: 'Insured Delivery & Secure Checkout',
      description:
        'Orders above ₹4,000 enjoy complimentary climate-controlled delivery across India, protected by 256-bit bank-grade SSL encrypted checkout.',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#FFFDF9] border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Integrity & Craftsmanship</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            WHY ELASIRS
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#756B63] font-light leading-relaxed">
            Accessible luxury defined by classical French extraction methods, authentic regional botanicals, and transparent craftsmanship.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white border border-[#E8DDD2] rounded-sm flex flex-col justify-between shadow-xs hover:border-[#B8945F]/60 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] border border-[#E8DDD2] flex items-center justify-center text-[#B8945F] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-luxury text-xl text-[#292522] font-normal leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-[#756B63] leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#E8DDD2]/60 flex items-center text-[10px] uppercase tracking-wider text-[#B8945F] font-semibold">
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
