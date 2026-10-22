import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  badgeLabel?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickView,
  badgeLabel,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const displayImage = product.images[0] || '/src/assets/images/gloss_gems_radiance.jpg';

  // Calculate discount percentage if original price exists and is higher
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Determine badge: custom badgeLabel, or smart luxury indicator
  const computedBadge =
    badgeLabel ||
    (product.bestSeller
      ? 'BESTSELLER'
      : product.price <= 3000
      ? 'BEST VALUE'
      : product.rating >= 4.9
      ? 'MOST LOVED'
      : product.isNew
      ? 'NEW RELEASE'
      : null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.variants[0]?.size || '50ml');
    setIsAdded(true);
    showToast(`${product.name} added to your shopping bag`, 'success');
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      className="group relative flex flex-col bg-[#FFFFFF] border border-[#E8DDD2] rounded-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#B8945F]/60 hover:shadow-lg hover:shadow-[#292522]/6 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. LARGE PRODUCT IMAGE CONTAINER (Occupies ~65–70% of Card Visual Height) */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF3EC] cursor-pointer flex items-center justify-center p-6 sm:p-8"
        onClick={() => onSelect(product.id)}
      >
        {/* Soft, bright nude-cream radial lighting glow highlighting bottle */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,253,249,0.95)_0%,_rgba(250,243,236,0.85)_55%,_rgba(245,232,220,0.5)_100%)]" />

        {/* Product Image — Large, Centered, High Visual Dominance */}
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="relative z-10 max-h-[90%] max-w-[90%] object-contain object-center drop-shadow-[0_14px_24px_rgba(41,37,34,0.13)] transition-transform duration-500 ease-out group-hover:scale-106"
        />

        {/* Soft natural contact shadow underneath the bottle */}
        <div className="absolute bottom-5 w-1/2 h-3 bg-[#756B63]/12 rounded-[100%] blur-sm pointer-events-none" />

        {/* Editorial Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
          {computedBadge && (
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#292522] bg-white/95 px-2.5 py-0.5 border border-[#E8DDD2] shadow-xs">
              {computedBadge}
            </span>
          )}
          {hasDiscount && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B8945F] bg-[#FAF3EC] px-2 py-0.5 border border-[#B8945F]/30">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/95 border border-[#E8DDD2] text-[#292522] hover:text-[#B8945F] hover:border-[#B8945F] transition-all z-20 cursor-pointer shadow-xs rounded-full"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isWishlisted
                ? 'fill-[#B8945F] text-[#B8945F] scale-110'
                : 'text-[#756B63] hover:text-[#292522]'
            }`}
          />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div
            className={`absolute bottom-3 inset-x-3 transition-all duration-300 z-20 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full py-2 bg-white/95 border border-[#292522] text-[#292522] text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#292522] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. CARD DETAILS: Clean, Approchable Luxury Hierarchy */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 bg-[#FFFFFF]">
        {/* Product Name */}
        <h3
          onClick={() => onSelect(product.id)}
          className="font-serif-luxury text-lg sm:text-xl font-normal text-[#292522] group-hover:text-[#B8945F] transition-colors cursor-pointer truncate"
        >
          {product.name}
        </h3>

        {/* Fragrance Family */}
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#756B63] mt-1 font-medium">
          <span>{product.family}</span>
          <span className="text-[#E8DDD2]">·</span>
          <span className="text-[#B8945F]">{product.type}</span>
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#756B63]">
          <div className="flex items-center text-[#B8945F]">
            <Star className="w-3.5 h-3.5 fill-[#B8945F]" />
          </div>
          <span className="font-semibold text-[#292522] tabular-nums">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[#756B63]/70 tabular-nums">
            ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Price Presentation */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-base font-semibold text-[#292522] tabular-nums">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-[#756B63]/70 line-through tabular-nums">
                ₹{product.originalPrice!.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-[#B8945F]">
                ({discountPercent}% off)
              </span>
            </>
          )}
        </div>

        {/* Add to Cart Action */}
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`mt-4 w-full py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs rounded-xs ${
            isAdded
              ? 'bg-[#B8945F] text-white border border-[#B8945F]'
              : 'bg-[#292522] text-[#FFFFFF] group-hover:bg-[#B8945F] active:scale-[0.99]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
