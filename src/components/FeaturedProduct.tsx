import React from 'react';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface FeaturedProductProps {
  product: Product;
  onDiscover: (productId: string) => void;
}

export const FeaturedProduct: React.FC<FeaturedProductProps> = ({ product, onDiscover }) => {
  const { addToCart } = useCart();

  return (
    <section className="py-20 lg:py-28 bg-[#FFFDF9] border-b border-[#B8945F]/15 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Column 1: Large Editorial Perfume Image */}
          <div className="relative group">
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] w-full overflow-hidden border border-[#B8945F]/30 shadow-2xl bg-[#FFFFFF]">
              <img
                src="/src/assets/images/gloss_gems_radiance.jpg"
                alt="ELASIRS NO. 01 The Signature"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9]/70 via-transparent to-transparent" />
            </div>

            {/* Decorative subtle frame accent */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#B8945F]/20 -z-10 pointer-events-none hidden sm:block" />
          </div>

          {/* Column 2: Editorial Product Content */}
          <div className="flex flex-col justify-center">
            {/* Header kicker */}
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#B8945F] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Masterpiece</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-light tracking-[0.1em] text-[#292522] uppercase">
              ELASIRS NO. 01
            </h2>

            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#B8945F] mt-2">
              THE SIGNATURE · EAU DE PARFUM
            </p>

            <blockquote className="mt-6 text-base sm:text-lg font-serif-luxury italic text-[#292522]/90 border-l-2 border-[#B8945F] pl-4 py-1 leading-relaxed">
              "An intimate composition of luminous florals, warm woods and subtle amber."
            </blockquote>

            {/* Detailed Scent Pyramid Cards */}
            <div className="mt-8 space-y-4">
              <div className="p-3.5 bg-[#FFFFFF] border border-[#B8945F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B8945F] w-28">
                  Top Notes
                </span>
                <span className="text-xs text-[#292522] tracking-wide">
                  Calabrian Bergamot · Pink Pepper · Sicilian Lemon
                </span>
              </div>

              <div className="p-3.5 bg-[#FFFFFF] border border-[#B8945F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B8945F] w-28">
                  Heart Notes
                </span>
                <span className="text-xs text-[#292522] tracking-wide">
                  Damask Rose · Night-Blooming Jasmine · Florentine Iris
                </span>
              </div>

              <div className="p-3.5 bg-[#FFFFFF] border border-[#B8945F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B8945F] w-28">
                  Base Notes
                </span>
                <span className="text-xs text-[#292522] tracking-wide">
                  Golden Amber · Mysore Sandalwood · Cashmere Musk
                </span>
              </div>
            </div>

            {/* Price display */}
            <div className="mt-8 flex items-baseline gap-4">
              <span className="text-3xl font-serif-luxury text-[#292522] tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#292522]/60">
                50ml Flacon · Free Priority Shipping
              </span>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onDiscover(product.id)}
                className="w-full sm:w-auto px-8 py-4 bg-[#B8945F] text-[#FFFDF9] text-xs font-semibold tracking-[0.25em] uppercase hover:bg-[#292522] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>DISCOVER THE FRAGRANCE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => addToCart(product, '50ml')}
                className="w-full sm:w-auto px-8 py-4 bg-[#FFFFFF] border border-[#B8945F]/50 text-[#292522] text-xs font-semibold tracking-[0.25em] uppercase hover:border-[#B8945F] hover:text-[#B8945F] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
