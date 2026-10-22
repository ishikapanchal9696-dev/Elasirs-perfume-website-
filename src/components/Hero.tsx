import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Droplets } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onDiscoverClick: () => void;
  onBespokeClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onDiscoverClick, onBespokeClick }) => {
  return (
    <section className="relative overflow-hidden bg-[#FFFDF9] border-b border-[#E8DDD2] pt-8 pb-16 lg:py-20">
      {/* Background Nude, Soft Peach & Champagne Lighting Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-36 right-1/4 w-[550px] h-[550px] rounded-full bg-[#FAF3EC] blur-3xl opacity-80" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[450px] rounded-full bg-[#F5E8DC]/60 blur-3xl" />
        <div className="absolute top-1/3 left-10 w-[380px] h-[380px] rounded-full bg-[#F3D8CC]/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-[#E6D0B8]/30 blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Staggered Text (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left order-2 lg:order-1">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-4 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
              <span>Haute Parfumerie · Accessible Luxury</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-light text-[#292522] tracking-[0.02em] leading-[1.08] animate-fade-up">
              More Than a Scent,
              <br />
              <span className="italic font-normal text-[#B8945F]">It's a Feeling</span>
            </h1>

            {/* Subheadline */}
            <p
              className="mt-6 text-base sm:text-lg text-[#756B63] max-w-xl font-light leading-relaxed animate-fade-up"
              style={{ animationDelay: '150ms' }}
            >
              Premium fragrances for every mood, every moment, and every version of you. Handcrafted with authentic botanical harvests, formulated for everyday elegance.
            </p>

            {/* Price Presentation Callout */}
            <div
              className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#756B63] animate-fade-up"
              style={{ animationDelay: '250ms' }}
            >
              <span className="font-semibold text-[#292522] text-sm tabular-nums">
                From ₹1,099
              </span>
              <span className="text-[#E8DDD2]">·</span>
              <span>10ml Travel Flacon</span>
              <span className="text-[#E8DDD2]">·</span>
              <span className="font-medium text-[#292522]">50ml Artisanal Editions at ₹2,999–₹3,899</span>
            </div>

            {/* Action Buttons */}
            <div
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 animate-fade-up"
              style={{ animationDelay: '350ms' }}
            >
              <button
                onClick={onShopClick}
                className="px-8 py-4 bg-[#292522] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onBespokeClick || onDiscoverClick}
                className="px-8 py-4 bg-white border border-[#E8DDD2] text-[#292522] text-xs font-semibold uppercase tracking-[0.22em] hover:border-[#292522] hover:bg-[#FAF3EC] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
              >
                <span>CREATE YOUR SCENT</span>
              </button>
            </div>

            {/* Guarantees / Service Badges */}
            <div
              className="mt-12 pt-6 border-t border-[#E8DDD2] grid grid-cols-3 gap-4 text-left animate-fade-up"
              style={{ animationDelay: '450ms' }}
            >
              <div className="flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-[#B8945F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#292522]">Pure Essences</h4>
                  <p className="text-[11px] text-[#756B63] mt-0.5">High Extrait & EDP</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#B8945F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#292522]">Complimentary</h4>
                  <p className="text-[11px] text-[#756B63] mt-0.5">Delivery Over ₹4,000</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B8945F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#292522]">Discovery Sample</h4>
                  <p className="text-[11px] text-[#756B63] mt-0.5">Included with Order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: VISUAL HERO — LARGE Prominent Flacon (lg:col-span-6) */}
          {/* Perfume bottle occupies 45–55% of visual area with generous whitespace, bright cream/nude background, soft natural shadow */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center items-center">
            <div className="relative w-full max-w-lg lg:max-w-xl aspect-[4/5] min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] rounded-sm bg-gradient-to-b from-[#FAF3EC] via-[#F5E8DC]/80 to-[#FAF3EC] border border-[#E8DDD2] flex items-center justify-center p-6 sm:p-10 shadow-sm animate-fade-up overflow-hidden">
              
              {/* Soft warm champagne & peach radial ambient lighting behind bottle */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,253,249,0.95)_0%,_rgba(250,243,236,0.85)_50%,_rgba(245,232,220,0.6)_100%)]" />

              {/* Minimalist corner tags */}
              <div className="absolute top-5 left-5 z-20 text-[10px] uppercase tracking-[0.25em] text-[#756B63] font-mono">
                ICONIC NO. 01 · EDP
              </div>

              <div className="absolute top-5 right-5 z-20 text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold bg-white/90 px-2.5 py-0.5 border border-[#E8DDD2] rounded-xs">
                BESTSELLER
              </div>

              {/* The Hero Product Flacon — Large, Prominent, Dominant Visual Center */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-bottle-float cursor-pointer" onClick={onShopClick}>
                <img
                  src="/src/assets/images/featured_elasirs_no1_1790830702808.jpg"
                  alt="ELASIRS NO. 01 Haute Parfumerie Flacon"
                  className="max-h-[82%] sm:max-h-[86%] w-auto object-contain drop-shadow-[0_24px_40px_rgba(41,37,34,0.18)] transition-transform duration-700 hover:scale-105"
                />
                {/* Natural soft shadow underneath the bottle */}
                <div className="w-3/5 h-4 bg-[#756B63]/15 rounded-[100%] blur-md mt-1" />
              </div>

              {/* Subtle floating badge at bottom */}
              <div className="absolute bottom-5 inset-x-5 z-20 bg-white/95 backdrop-blur-xs border border-[#E8DDD2] px-4 py-3 shadow-xs flex items-center justify-between rounded-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#756B63]">Signature Flacon</div>
                  <div className="font-serif-luxury text-base text-[#292522]">ELASIRS NO. 01 · Floral Warmth</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[#292522] tabular-nums block">₹3,499</span>
                  <span className="text-[10px] text-[#B8945F] font-medium uppercase tracking-wider">50ml Extrait</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
