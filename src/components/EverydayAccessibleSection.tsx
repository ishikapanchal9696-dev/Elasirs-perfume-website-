import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, CheckCircle2, Clock, Heart } from 'lucide-react';

interface EverydayAccessibleSectionProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onViewAll: () => void;
  onExploreCollection?: (collectionId: string) => void;
}

export const EverydayAccessibleSection: React.FC<EverydayAccessibleSectionProps> = ({
  products,
  onSelectProduct,
  onQuickView,
  onViewAll,
  onExploreCollection,
}) => {
  const [selectedTier, setSelectedTier] = useState<'all' | 'everyday' | 'signature' | 'luxe'>('all');

  // Categorize products into tiers
  const everydayProducts = products.filter(p => p.price <= 3299);
  const signatureProducts = products.filter(p => p.price > 3299 && p.price <= 3699);
  const luxeProducts = products.filter(p => p.price > 3699);

  let displayedProducts = products;
  if (selectedTier === 'everyday') displayedProducts = everydayProducts;
  else if (selectedTier === 'signature') displayedProducts = signatureProducts;
  else if (selectedTier === 'luxe') displayedProducts = luxeProducts;

  return (
    <section className="py-16 lg:py-24 bg-[#FFFDF9] border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulation Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            SHOP BY COLLECTION
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#756B63] font-light italic font-serif-luxury">
            "Beautiful fragrances for every kind of everyday."
          </p>
          <p className="mt-2 text-xs sm:text-sm text-[#756B63] max-w-xl mx-auto font-light leading-relaxed">
            Curated by oil concentration and occasion presence—from effortless morning essentials to noble evening extraits.
          </p>
        </div>

        {/* 3 Featured Collection Cards (EVERYDAY, SIGNATURE, LUXE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {/* Card 1: EVERYDAY */}
          <div
            onClick={() => onExploreCollection ? onExploreCollection('everyday') : setSelectedTier('everyday')}
            className={`group p-6 bg-white border rounded-sm flex flex-col justify-between hover:border-[#B8945F] hover:shadow-md transition-all duration-300 cursor-pointer ${
              selectedTier === 'everyday' ? 'border-[#292522] shadow-xs' : 'border-[#E8DDD2]'
            }`}
          >
            <div>
              <div className="relative aspect-[4/3] w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-4 mb-4 border border-[#E8DDD2]/60">
                <img
                  src="/src/assets/images/perfume_floral_flacon_1790830736168.jpg"
                  alt="Everyday Collection"
                  className="max-h-[88%] object-contain group-hover:scale-106 transition-transform duration-500 drop-shadow-sm"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 border border-[#E8DDD2] text-[9px] font-mono uppercase tracking-widest text-[#756B63]">
                  {everydayProducts.length} CREATIONS
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] font-semibold block mb-0.5">
                TIER 01 · DAILY ELEGANCE
              </span>
              <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                EVERYDAY
              </h3>
              <p className="mt-1 text-xs text-[#756B63] font-light leading-relaxed">
                Effortless fragrances made for everyday moments. Subtle, clean, and radiant.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E8DDD2] flex items-center justify-between">
              <span className="text-xs text-[#292522] font-semibold tabular-nums">From ₹2,999</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#292522] group-hover:text-[#B8945F] flex items-center gap-1 transition-colors">
                <span>Explore</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
          </div>

          {/* Card 2: SIGNATURE */}
          <div
            onClick={() => onExploreCollection ? onExploreCollection('signature') : setSelectedTier('signature')}
            className={`group p-6 bg-white border rounded-sm flex flex-col justify-between hover:border-[#B8945F] hover:shadow-md transition-all duration-300 cursor-pointer relative ${
              selectedTier === 'signature' ? 'border-[#B8945F] shadow-xs' : 'border-[#E8DDD2]'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B8945F] text-white px-3 py-0.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-2xs">
              BESTSELLER
            </div>
            <div>
              <div className="relative aspect-[4/3] w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-4 mb-4 border border-[#E8DDD2]/60">
                <img
                  src="/src/assets/images/featured_elasirs_no1_1790830702808.jpg"
                  alt="Signature Collection"
                  className="max-h-[88%] object-contain group-hover:scale-106 transition-transform duration-500 drop-shadow-sm"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 border border-[#E8DDD2] text-[9px] font-mono uppercase tracking-widest text-[#756B63]">
                  {signatureProducts.length} CREATIONS
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] font-semibold block mb-0.5">
                TIER 02 · MAISON ICONS
              </span>
              <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                SIGNATURE
              </h3>
              <p className="mt-1 text-xs text-[#756B63] font-light leading-relaxed">
                Distinctive scents that become part of your identity. Masterfully balanced botanical bouquets.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E8DDD2] flex items-center justify-between">
              <span className="text-xs text-[#292522] font-semibold tabular-nums">From ₹3,499</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#292522] group-hover:text-[#B8945F] flex items-center gap-1 transition-colors">
                <span>Explore</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
          </div>

          {/* Card 3: LUXE */}
          <div
            onClick={() => onExploreCollection ? onExploreCollection('luxe') : setSelectedTier('luxe')}
            className={`group p-6 bg-white border rounded-sm flex flex-col justify-between hover:border-[#B8945F] hover:shadow-md transition-all duration-300 cursor-pointer ${
              selectedTier === 'luxe' ? 'border-[#292522] shadow-xs' : 'border-[#E8DDD2]'
            }`}
          >
            <div>
              <div className="relative aspect-[4/3] w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-4 mb-4 border border-[#E8DDD2]/60">
                <img
                  src="/src/assets/images/hero_perfume_luxury_1790830691406.jpg"
                  alt="Luxe Collection"
                  className="max-h-[88%] object-contain group-hover:scale-106 transition-transform duration-500 drop-shadow-sm"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 border border-[#E8DDD2] text-[9px] font-mono uppercase tracking-widest text-[#756B63]">
                  {luxeProducts.length} CREATIONS
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] font-semibold block mb-0.5">
                TIER 03 · HAUTE EXTRAIT RESERVE
              </span>
              <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                LUXE
              </h3>
              <p className="mt-1 text-xs text-[#756B63] font-light leading-relaxed">
                Rich, sophisticated fragrances for unforgettable moments. Concentrated 24%+ pure perfume oils.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E8DDD2] flex items-center justify-between">
              <span className="text-xs text-[#292522] font-semibold tabular-nums">From ₹3,799</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#292522] group-hover:text-[#B8945F] flex items-center gap-1 transition-colors">
                <span>Explore</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Tier Product Highlights */}
        <div className="pt-8 border-t border-[#E8DDD2]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-serif-luxury text-xl sm:text-2xl text-[#292522] uppercase tracking-wide">
              {selectedTier === 'all'
                ? 'FEATURED COLLECTION CREATIONS'
                : selectedTier === 'everyday'
                ? 'EVERYDAY ESSENTIALS'
                : selectedTier === 'signature'
                ? 'SIGNATURE ICON EDITIONS'
                : 'HAUTE LUXE EXTRAITS'}
            </h4>
            <button
              onClick={onViewAll}
              className="text-xs uppercase tracking-wider font-semibold text-[#292522] hover:text-[#B8945F] transition-colors pb-0.5 border-b border-[#292522] hover:border-[#B8945F] cursor-pointer"
            >
              View Full Boutique →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {displayedProducts.slice(0, 4).map(product => {
              let tierBadge = 'EVERYDAY FAVORITE';
              if (product.price > 3699) tierBadge = 'LUXE EXTRAIT';
              else if (product.price > 3299) tierBadge = 'SIGNATURE ICON';
              else if (product.price <= 3000) tierBadge = 'BEST VALUE';

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeLabel={tierBadge}
                  onSelect={onSelectProduct}
                  onQuickView={onQuickView}
                />
              );
            })}
          </div>
        </div>

        {/* Accessible Assurance Highlights */}
        <div className="mt-14 p-6 sm:p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#B8945F] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292522]">
                Zero Compromise on Oils
              </h4>
              <p className="text-xs text-[#756B63] mt-1 font-light leading-relaxed">
                We formulate with high-concentration French and Indian naturals—never synthetic water dilutions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-[#B8945F] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292522]">
                12-Hour Daily Longevity
              </h4>
              <p className="text-xs text-[#756B63] mt-1 font-light leading-relaxed">
                Skin-tested in Indian weather for real projection and clean drydowns from 9 AM to late evening.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Heart className="w-5 h-5 text-[#B8945F] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292522]">
                Discovery Trial Friendly
              </h4>
              <p className="text-xs text-[#756B63] mt-1 font-light leading-relaxed">
                Order full bottles with a free trial sample included. If not completely in love, return unopened.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
