import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, Shield, Gift, Zap } from 'lucide-react';

interface AccessibleDiscoverySectionProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onQuickView?: (product: Product) => void;
}

export const AccessibleDiscoverySection: React.FC<AccessibleDiscoverySectionProps> = ({
  products,
  onSelectProduct,
  onQuickView,
}) => {
  // Select accessible everyday favorites
  const accessibleItems = products
    .filter(p => p.price <= 3499)
    .sort((a, b) => a.price - b.price);

  const displayList = accessibleItems.length >= 3 ? accessibleItems : products.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-[#F5E8DC]/60 border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accessible Luxury · Curated For You</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            YOU MAY ALSO LIKE
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#756B63] font-light italic font-serif-luxury">
            "Find your signature scent, without the traditional luxury splurge."
          </p>
          <p className="mt-2 text-xs sm:text-sm text-[#756B63] max-w-xl mx-auto font-light leading-relaxed">
            Elevate your everyday presence with fine French-grade perfumes. Premium glass flacons, authentic botanical harvests, and uncompromised longevity—priced transparently.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {displayList.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              badgeLabel="EVERYDAY FAVORITE"
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {/* 3 Pillar Benefit Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm text-center">
            <div className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#B8945F] flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292522]">
              600+ Sprays Per 50ml
            </h4>
            <p className="text-xs text-[#756B63] mt-1.5 font-light leading-relaxed">
              High concentration ensures just 2–3 sprays linger all day, making each bottle last 6 to 9 months of daily wear.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm text-center">
            <div className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#B8945F] flex items-center justify-center mx-auto mb-3">
              <Gift className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292522]">
              Discovery Sample Included
            </h4>
            <p className="text-xs text-[#756B63] mt-1.5 font-light leading-relaxed">
              Test your fragrance first using the complimentary 2ml sample before opening your full presentation flacon.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm text-center">
            <div className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#B8945F] flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292522]">
              Fair Pricing Integrity
            </h4>
            <p className="text-xs text-[#756B63] mt-1.5 font-light leading-relaxed">
              We eliminate traditional middleman distributor markups to invest directly in raw botanical oils and luxury glass.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
