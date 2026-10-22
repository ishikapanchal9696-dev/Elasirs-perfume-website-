import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NewArrivalsSectionProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onViewAll: () => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  products,
  onSelectProduct,
  onQuickView,
  onViewAll,
}) => {
  // Sort by newest or pick new releases
  const newReleases = products.filter(p => p.isNew || p.id === 'velvet-oudh' || p.id === 'ambre-soleil');
  const itemsToShow = newReleases.length >= 3 ? newReleases : products.slice(-4);

  return (
    <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8DDD2]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Formulations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
              NEW ARRIVALS
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#756B63] font-light max-w-xl">
              Freshly matured flacons from our 120-day natural aging cellar, highlighting rare seasonal harvests.
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="self-start md:self-end inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#292522] hover:text-[#B8945F] transition-colors pb-1 border-b border-[#292522] hover:border-[#B8945F] cursor-pointer"
          >
            <span>View All New Releases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Column Product Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {itemsToShow.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              badgeLabel="NEW RELEASE"
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
