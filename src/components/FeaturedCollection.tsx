import React, { useState } from 'react';
import { Product, FragranceFamily } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedCollectionProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onViewAll: () => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  products,
  onSelectProduct,
  onQuickView,
  onViewAll,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const families: ('All' | FragranceFamily)[] = ['All', 'Floral', 'Woody', 'Oriental', 'Fresh'];

  // Prioritize bestsellers and filtered items
  const bestSellerList = products.filter(p => p.bestSeller || p.rating >= 4.8);
  const sourceList = bestSellerList.length >= 4 ? bestSellerList : products;

  const filteredProducts =
    activeFilter === 'All'
      ? sourceList
      : sourceList.filter(p => p.family === activeFilter);

  return (
    <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8DDD2]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
              <span>Iconic Creations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
              BESTSELLERS
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#756B63] font-light max-w-xl">
              The signature flacons most coveted by our patrons—formulated for longevity, subtle sillage, and unforgettable memory.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {families.map(family => (
              <button
                key={family}
                onClick={() => setActiveFilter(family)}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-200 cursor-pointer rounded-xs ${
                  activeFilter === family
                    ? 'bg-[#292522] text-white shadow-xs'
                    : 'bg-white text-[#756B63] border border-[#E8DDD2] hover:border-[#292522] hover:text-[#292522]'
                }`}
              >
                {family}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Column Product Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {/* View All Collection CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white border border-[#292522] text-[#292522] text-xs font-semibold tracking-[0.22em] uppercase hover:bg-[#292522] hover:text-white transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer rounded-xs"
          >
            <span>EXPLORE ALL FRAGRANCES ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
