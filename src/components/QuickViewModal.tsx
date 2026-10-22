import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFull: (productId: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFull,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '50ml');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const currentVariant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
  const activePrice = currentVariant ? currentVariant.price : product.price;
  const isWishlisted = isInWishlist(product.id);

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > activePrice);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - activePrice) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    showToast(`${product.name} (${selectedSize}) added to bag`, 'success');
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-[#E8DDD2] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] rounded-sm">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#756B63] hover:text-[#292522] bg-white/90 border border-[#E8DDD2] transition-colors rounded-full cursor-pointer shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Column with high contrast and natural shadow */}
        <div className="md:w-1/2 relative bg-[#FAF3EC] flex items-center justify-center min-h-[300px] md:min-h-[460px] p-8 border-b md:border-b-0 md:border-r border-[#E8DDD2]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,253,249,0.95)_0%,_rgba(250,243,236,0.85)_55%,_rgba(245,232,220,0.5)_100%)]" />
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="relative z-10 max-h-76 object-contain drop-shadow-[0_18px_32px_rgba(41,37,34,0.16)]"
          />
          <div className="absolute bottom-6 w-1/2 h-3 bg-[#756B63]/12 rounded-[100%] blur-sm pointer-events-none" />
        </div>

        {/* Product Info Column */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#756B63] mb-1.5 font-medium">
              <span>{product.family}</span>
              <span className="text-[#E8DDD2]">·</span>
              <span className="text-[#B8945F]">{product.type}</span>
            </div>

            <h2 className="text-2xl font-serif-luxury text-[#292522] tracking-wide font-normal">
              {product.name}
            </h2>
            <p className="text-[11px] text-[#756B63] uppercase tracking-wider mt-0.5">
              {product.subtitle}
            </p>

            {/* Ratings and Price */}
            <div className="mt-3 flex items-center justify-between pb-3.5 border-b border-[#E8DDD2]">
              <div className="flex items-center gap-1.5 text-xs text-[#756B63]">
                <Star className="w-4 h-4 fill-[#B8945F] text-[#B8945F]" />
                <span className="font-semibold text-[#292522] tabular-nums">
                  {product.rating}
                </span>
                <span className="text-[#756B63]/60 tabular-nums">
                  ({product.reviewCount} reviews)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-semibold text-[#292522] tabular-nums">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-[#756B63] line-through tabular-nums ml-2">
                    ₹{product.originalPrice!.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Short description */}
            <p className="mt-3.5 text-xs text-[#756B63] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Notes Pyramid summary */}
            <div className="mt-3.5 p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-xs space-y-1 rounded-xs">
              <p className="text-[#756B63] text-[11px] uppercase tracking-wider">
                <strong className="text-[#292522] font-medium">Top:</strong> {product.notes.top.join(' · ')}
              </p>
              <p className="text-[#756B63] text-[11px] uppercase tracking-wider">
                <strong className="text-[#292522] font-medium">Heart:</strong> {product.notes.heart.join(' · ')}
              </p>
              <p className="text-[#756B63] text-[11px] uppercase tracking-wider">
                <strong className="text-[#292522] font-medium">Base:</strong> {product.notes.base.join(' · ')}
              </p>
            </div>

            {/* Size Variant Selector */}
            <div className="mt-4">
              <span className="text-[11px] uppercase tracking-wider text-[#292522] font-semibold block mb-2">
                Select Flacon Size
              </span>
              <div className="grid grid-cols-3 gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    className={`py-2 px-2 text-xs uppercase tracking-wider font-semibold border transition-all cursor-pointer rounded-xs ${
                      selectedSize === v.size
                        ? 'border-[#292522] bg-[#292522] text-white shadow-xs'
                        : 'border-[#E8DDD2] bg-[#FAF3EC] text-[#756B63] hover:border-[#292522] hover:text-[#292522]'
                    }`}
                  >
                    <span>{v.size}</span>
                    <span className="block text-[10px] opacity-80 mt-0.5 tabular-nums">
                      ₹{v.price.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-[#E8DDD2] space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-[#E8DDD2] bg-[#FAF3EC] rounded-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-xs text-[#292522] hover:text-[#B8945F] font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 text-xs text-[#292522] font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-xs text-[#292522] hover:text-[#B8945F] font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xs shadow-xs ${
                  isAdded
                    ? 'bg-[#B8945F] text-white'
                    : 'bg-[#292522] text-white hover:bg-[#B8945F]'
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
                    <span>Add to Cart · ₹{(activePrice * quantity).toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="p-3 border border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] hover:text-[#B8945F] transition-colors rounded-xs cursor-pointer bg-white"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-[#B8945F] text-[#B8945F]' : 'text-[#756B63]'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewFull(product.id);
              }}
              className="w-full text-center text-xs uppercase tracking-wider text-[#756B63] hover:text-[#292522] underline transition-colors cursor-pointer py-1"
            >
              View Full Product Details & Olfactory Notes →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
