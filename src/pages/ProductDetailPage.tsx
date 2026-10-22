import React, { useState } from 'react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Truck,
  Check,
  Droplets,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  Calendar,
  Zap,
  Trash2,
  Edit3,
  ZoomIn,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts?: Product[];
  allReviews: Review[];
  onBack: () => void;
  onSelectProduct?: (productId: string) => void;
  onCheckoutDirect: () => void;
  onReviewSubmit: (reviewData: {
    productId: string;
    customerName: string;
    rating: number;
    title: string;
    comment: string;
  }) => Promise<void>;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts = [],
  allReviews,
  onBack,
  onSelectProduct,
  onCheckoutDirect,
  onReviewSubmit,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, user } = useAuth();
  const { showToast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '50ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'notes' | 'reviews'>('description');

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');

  // Local reviews array initialized from props
  const [localReviews, setLocalReviews] = useState<Review[]>(allReviews);

  // Gallery Zoom / Fullscreen Lightbox
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Delivery / Pincode check state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
    estimate?: string;
  } | null>(null);

  // 9. Intelligent discovery & recommendations states & computations
  const [recommendationTab, setRecommendationTab] = useState<'youMayLike' | 'similar' | 'complete' | 'bestsellers'>('youMayLike');

  // 1. You May Also Like: same family or high rated, strictly in stock & different product
  const youMayLikeProducts = React.useMemo(() => {
    return (allProducts || [])
      .filter(p => p.id !== product.id && p.stock > 0)
      .sort((a, b) => {
        const aFamScore = a.family === product.family ? 4 : 0;
        const bFamScore = b.family === product.family ? 4 : 0;
        return (bFamScore + (b.bestSeller ? 2 : 0) + b.rating) - (aFamScore + (a.bestSeller ? 2 : 0) + a.rating);
      })
      .slice(0, 4);
  }, [allProducts, product.id, product.family]);

  // 2. Similar Fragrances: based on shared olfactory notes (top, heart, base)
  const currentNotes = React.useMemo(() => {
    return [
      ...product.notes.top,
      ...product.notes.heart,
      ...product.notes.base,
    ].map(n => n.toLowerCase());
  }, [product]);

  const similarFragrances = React.useMemo(() => {
    return (allProducts || [])
      .filter(p => p.id !== product.id && p.stock > 0)
      .map(p => {
        const pNotes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].map(n => n.toLowerCase());
        const shared = pNotes.filter(n => currentNotes.some(cn => cn.includes(n) || n.includes(cn))).length;
        return { product: p, shared };
      })
      .sort((a, b) => b.shared - a.shared || b.product.rating - a.product.rating)
      .map(item => item.product)
      .slice(0, 4);
  }, [allProducts, product.id, currentNotes]);

  // 3. Complete Your Collection: complimentary fragrance pairings (different family for day/evening contrast)
  const completeCollectionProducts = React.useMemo(() => {
    return (allProducts || [])
      .filter(p => p.id !== product.id && p.stock > 0 && p.family !== product.family)
      .sort((a, b) => (b.bestSeller ? 2 : 0) + b.rating - ((a.bestSeller ? 2 : 0) + a.rating))
      .slice(0, 4);
  }, [allProducts, product.id, product.family]);

  // 4. Bestsellers: top-selling fragrances in house
  const bestsellerRecommendations = React.useMemo(() => {
    return (allProducts || [])
      .filter(p => p.id !== product.id && p.stock > 0)
      .sort((a, b) => (b.bestSeller ? 3 : 0) + b.reviewCount - ((a.bestSeller ? 3 : 0) + a.reviewCount))
      .slice(0, 4);
  }, [allProducts, product.id]);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeInput.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeResult({
        checked: true,
        valid: false,
        message: 'Please enter a valid 6-digit postal pincode',
      });
      return;
    }
    setPincodeResult({
      checked: true,
      valid: true,
      message: `Delivery available to ${cleanPin}`,
      estimate: 'Expected delivery in 2–4 business days via insured climate-controlled courier',
    });
  };

  // Keep local reviews synchronized if props update
  React.useEffect(() => {
    setLocalReviews(allReviews);
  }, [allReviews]);

  const currentVariant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
  const activePrice = currentVariant ? currentVariant.price : product.price;
  const isWishlisted = isInWishlist(product.id);

  // Calculate discount percentage if original price exists and is higher
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > activePrice);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - activePrice) / product.originalPrice!) * 100)
    : 0;

  // Filter reviews for this product
  const productReviews = localReviews.filter(r => r.productId === product.id && r.approved !== false);

  // Review stats calculation
  const totalReviewsCount = productReviews.length;
  const calculatedAvgRating = totalReviewsCount > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : product.rating.toFixed(1);

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: productReviews.filter(r => Math.round(r.rating) === stars).length,
    percentage: totalReviewsCount > 0
      ? Math.round((productReviews.filter(r => Math.round(r.rating) === stars).length / totalReviewsCount) * 100)
      : 0,
  }));

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    onCheckoutDirect();
  };

  const handleReviewFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review impressions', 'error');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await onReviewSubmit({
        productId: product.id,
        customerName: reviewName.trim(),
        rating: reviewRating,
        title: reviewTitle.trim() || 'Exceptional Fragrance Experience',
        comment: reviewComment.trim(),
      });
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      showToast('Thank you for submitting your impression', 'success');
    } catch {
      showToast('Error publishing your review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReviewSubmit = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle,
          comment: editComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, rating: editRating, title: editTitle, comment: editComment } : r))
        );
        setEditingReviewId(null);
        showToast('Review updated successfully', 'success');
      }
    } catch {
      showToast('Failed to update review', 'error');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you wish to delete your impression?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLocalReviews(prev => prev.filter(r => r.id !== reviewId));
        showToast('Review removed', 'success');
      }
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  const isOwnerOfReview = (rev: Review) => {
    if (!user) return false;
    if (rev.userId && rev.userId === user.id) return true;
    if (rev.userEmail && rev.userEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (rev.customerName.toLowerCase() === user.name.toLowerCase()) return true;
    return false;
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen bg-[#FFFDF9] pt-8 pb-24 sm:pb-16 lg:pt-12 lg:pb-20 text-[#292522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8DDD2]">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#756B63] hover:text-[#292522] transition-colors cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-[#B8945F]" />
            <span>Back to All Fragrances</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#756B63]">
            <span>Maison ELASIRS</span>
            <span>/</span>
            <span className="text-[#B8945F] font-medium">{product.family} Collection</span>
            <span>/</span>
            <span className="text-[#292522] font-semibold">{product.name}</span>
          </div>
        </div>

        {/* 1. TOP PRODUCT SHOWCASE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Visual Hero Gallery (Left, lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Primary Main Bottle Showcase */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF3EC] border border-[#E8DDD2] rounded-sm shadow-sm flex items-center justify-center p-8 sm:p-14 group">
              {/* Warm radial lighting highlighting the bottle */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,1)_0%,_rgba(248,241,232,0.85)_55%,_rgba(243,216,204,0.35)_100%)]" />

              {/* Badges on Flacon */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#292522] bg-white/95 px-3 py-1 border border-[#E8DDD2] shadow-xs">
                  {product.bestSeller ? 'BESTSELLER' : product.price <= 3000 ? 'BEST VALUE' : 'MAISON ICON'}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B8945F] bg-[#FAF3EC] px-2.5 py-1 border border-[#B8945F]/30 shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Button floating on image */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-3 bg-white/95 border border-[#E8DDD2] text-[#292522] hover:text-[#B8945F] transition-all z-20 rounded-full shadow-xs cursor-pointer"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isWishlisted ? 'fill-[#B8945F] text-[#B8945F] scale-110' : 'text-[#756B63]'
                  }`}
                />
              </button>

              {/* Product Bottle Image */}
              <img
                src={product.images[selectedImage] || product.images[0] || '/src/assets/images/gloss_gems_radiance.jpg'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/src/assets/images/gloss_gems_radiance.jpg';
                }}
                alt={`${product.name} Haute Parfumerie Presentation`}
                referrerPolicy="no-referrer"
                className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_22px_38px_rgba(36,33,31,0.18)] transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute bottom-4 left-4 z-20 text-[10px] uppercase tracking-widest text-[#756B63] font-mono">
                50ml / 100ml / 10ml · Hand-Finished
              </div>

              {/* Zoom & Fullscreen Trigger */}
              <button
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                className="absolute bottom-4 right-4 z-20 px-2.5 py-1.5 bg-white/95 border border-[#E8DDD2] text-[#292522] hover:text-[#B8945F] hover:border-[#B8945F] transition-all rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold"
                aria-label="Expand and zoom bottle flacon presentation"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#B8945F]" />
                <span className="hidden sm:inline">Zoom View</span>
              </button>
            </div>

            {/* Thumbnail Gallery Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden border transition-all cursor-pointer rounded-xs p-2 bg-[#FAF3EC] flex items-center justify-center ${
                      selectedImage === idx
                        ? 'border-[#292522] ring-1 ring-[#292522]'
                        : 'border-[#E8DDD2] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Purchase Column (Right, lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            {/* Fragrance Family & Concentration */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#756B63] mb-2 font-medium">
              <span>{product.family} Family</span>
              <span className="text-[#E8DDD2]">·</span>
              <span className="text-[#B8945F] font-semibold">{product.type}</span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light text-[#292522] uppercase tracking-[0.06em] leading-[1.1]">
              {product.name}
            </h1>

            {/* Subtitle / Archetype */}
            <p className="text-xs uppercase tracking-[0.22em] text-[#756B63] mt-1.5 font-medium">
              {product.subtitle}
            </p>

            {/* Rating & Reviews Jump Link */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center text-[#B8945F]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(Number(calculatedAvgRating))
                        ? 'fill-[#B8945F] text-[#B8945F]'
                        : 'text-[#E8DDD2]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#292522] tabular-nums">
                {calculatedAvgRating}
              </span>
              <span className="text-xs text-[#756B63]">·</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-[#756B63] hover:text-[#B8945F] underline underline-offset-4 cursor-pointer"
              >
                {totalReviewsCount} Patron Impressions
              </button>
            </div>

            {/* Price Presentation (Current Price, Original Price, Discount) */}
            <div className="mt-5 p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-serif-luxury text-[#292522] tabular-nums font-normal">
                    ₹{activePrice.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-[#756B63]/75 line-through tabular-nums font-light">
                      ₹{product.originalPrice!.toLocaleString('en-IN')}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-semibold text-[#B8945F] uppercase tracking-wider">
                      Save ₹{(product.originalPrice! - activePrice).toLocaleString('en-IN')} ({discountPercent}% off)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#756B63] block mt-0.5">
                  Inclusive of all taxes & complimentary delivery across India
                </span>
              </div>
            </div>

            {/* Brief Description */}
            <p className="mt-4 text-sm text-[#756B63] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Quick Scent Profile Pillars */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#E8DDD2] rounded-xs flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B8945F] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#756B63] block font-medium">Longevity</span>
                  <span className="font-semibold text-[#292522]">{product.longevity || '10–12 Hours'}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E8DDD2] rounded-xs flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-[#B8945F] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#756B63] block font-medium">Sillage</span>
                  <span className="font-semibold text-[#292522]">{product.sillage || 'Moderate & Radiant'}</span>
                </div>
              </div>
            </div>

            {/* Available Sizes Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-[#292522] font-semibold">
                  Select Presentation Size
                </span>
                <span className="text-[11px] text-[#B8945F] uppercase tracking-wider font-semibold">
                  Matured Extraits
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {product.variants.map(variant => (
                  <button
                    key={variant.size}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`py-3 px-3 text-center border transition-all cursor-pointer rounded-xs ${
                      selectedSize === variant.size
                        ? 'border-[#292522] bg-[#292522] text-white shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#756B63] hover:border-[#292522] hover:text-[#292522]'
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wider">
                      {variant.size}
                    </span>
                    <span
                      className={`block text-[11px] tabular-nums mt-0.5 ${
                        selectedSize === variant.size ? 'text-[#E8DCC8]' : 'text-[#B8945F]'
                      }`}
                    >
                      ₹{variant.price.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability & Quantity Selector */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E8DDD2]">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium">
                  Quantity:
                </span>
                <div className="flex items-center border border-[#E8DDD2] bg-[#FAF3EC] rounded-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3.5 py-1.5 text-sm text-[#292522] hover:text-[#B8945F] font-bold cursor-pointer disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs text-[#292522] font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="px-3.5 py-1.5 text-sm text-[#292522] hover:text-[#B8945F] font-bold cursor-pointer disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Message */}
              <div>
                {isOutOfStock ? (
                  <span className="text-xs text-red-600 font-semibold uppercase tracking-wider">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span className="text-xs text-[#756B63]">
                    In Stock ({product.stock} flacons available)
                  </span>
                )}
              </div>
            </div>

            {/* CTAs: ADD TO BAG and BUY NOW */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  addToCart(product, selectedSize, quantity);
                  showToast(`${product.name} (${selectedSize}) added to your bag`, 'success');
                }}
                disabled={isOutOfStock}
                className="flex-1 py-4 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 rounded-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-4 bg-[#B8945F] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#292522] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 rounded-xs"
              >
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Atelier Guarantees Banner */}
            <div className="mt-8 pt-5 border-t border-[#E8DDD2] grid grid-cols-2 gap-4 text-xs text-[#756B63]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#B8945F] shrink-0" />
                <span>Free priority dispatch across India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B8945F] shrink-0" />
                <span>2ml matching sample included</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B8945F] shrink-0" />
                <span>100% Authentic Grasse Botanicals</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#B8945F] shrink-0" />
                <span>14-Day unopened bottle return</span>
              </div>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="mt-6 p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-2.5">
              <span className="text-xs uppercase tracking-wider text-[#292522] font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B8945F]" />
                <span>Check Delivery & Pincode Availability</span>
              </span>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit postal pincode (e.g. 400001)"
                  value={pincodeInput}
                  onChange={e => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 bg-white border border-[#E8DDD2] text-xs text-[#292522] outline-none rounded-xs focus:border-[#292522]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#292522] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeResult && (
                <div
                  className={`text-xs pt-1 flex items-start gap-1.5 ${
                    pincodeResult.valid ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {pincodeResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <span className="font-bold text-red-600">!</span>
                  )}
                  <div>
                    <span className="font-semibold block">{pincodeResult.message}</span>
                    {pincodeResult.estimate && (
                      <span className="text-[11px] text-[#756B63] block mt-0.5">
                        {pincodeResult.estimate}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 2. DEDICATED TABS / SECTIONS */}
        <div className="mt-20 pt-8 border-t border-[#E8DDD2]">
          
          {/* Tab Navigation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pb-6 border-b border-[#E8DDD2]">
            {[
              { id: 'description', label: 'DESCRIPTION' },
              { id: 'specifications', label: 'SPECIFICATIONS' },
              { id: 'notes', label: 'FRAGRANCE NOTES' },
              { id: 'reviews', label: `REVIEWS (${totalReviewsCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 sm:px-7 py-3 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold transition-all relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#292522] bg-white border border-[#292522] shadow-xs'
                    : 'text-[#756B63] hover:text-[#292522] border border-transparent'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B8945F]" />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="py-12 max-w-4xl mx-auto space-y-10 animate-fade-in">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
                  The Olfactory Story
                </span>
                <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#292522] font-light uppercase tracking-wide">
                  {product.name} · {product.subtitle}
                </h3>
                <p className="mt-4 text-base sm:text-lg text-[#756B63] leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {/* Scent Inspiration / Narrative Story */}
              <div className="p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-sm">
                <h4 className="font-serif-luxury text-2xl text-[#292522] mb-3">
                  Inspiration & Philosophy
                </h4>
                <p className="text-sm text-[#756B63] leading-relaxed font-light italic">
                  "{product.story}"
                </p>
              </div>

              {/* How it smells on skin */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#292522] mb-3">
                  How it smells on skin
                </h4>
                <p className="text-sm text-[#756B63] leading-relaxed font-light">
                  {product.howItSmells}
                </p>
              </div>

              {/* Artisanal Aging & Quality */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E8DDD2]">
                <div className="p-5 bg-white border border-[#E8DDD2] rounded-xs">
                  <span className="text-xl font-serif-luxury text-[#B8945F] block font-normal">
                    120 Days
                  </span>
                  <span className="text-xs font-semibold text-[#292522] uppercase tracking-wider block mt-1">
                    Cellar Maceration
                  </span>
                  <p className="text-[11px] text-[#756B63] mt-1 font-light">
                    Oils age in temperature-controlled glass demijohns to bind seamless floral-woody harmonies.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#E8DDD2] rounded-xs">
                  <span className="text-xl font-serif-luxury text-[#B8945F] block font-normal">
                    Grasse & Mysore
                  </span>
                  <span className="text-xs font-semibold text-[#292522] uppercase tracking-wider block mt-1">
                    Authentic Provenance
                  </span>
                  <p className="text-[11px] text-[#756B63] mt-1 font-light">
                    Hand-harvested botanicals sourced ethically directly from master regional distillers.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#E8DDD2] rounded-xs">
                  <span className="text-xl font-serif-luxury text-[#B8945F] block font-normal">
                    Clean Haute Formule
                  </span>
                  <span className="text-xs font-semibold text-[#292522] uppercase tracking-wider block mt-1">
                    Pure & Cruelty-Free
                  </span>
                  <p className="text-[11px] text-[#756B63] mt-1 font-light">
                    Free of phthalates, parabens, endocrine disruptors, and harsh artificial dyes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === 'specifications' && (
            <div className="py-12 max-w-4xl mx-auto animate-fade-in">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
                  Technical Specifications
                </span>
                <h3 className="font-serif-luxury text-3xl text-[#292522] uppercase font-light">
                  Formulation & Characteristics
                </h3>
              </div>

              {/* Scannable Spec Grid */}
              <div className="bg-white border border-[#E8DDD2] rounded-sm divide-y divide-[#E8DDD2]">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Fragrance Family
                  </span>
                  <span className="text-sm font-semibold text-[#292522] sm:w-2/3">
                    {product.family}
                  </span>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Concentration Type
                  </span>
                  <span className="text-sm font-semibold text-[#292522] sm:w-2/3">
                    {product.type} ({product.type.includes('Extrait') ? '30% Pure Perfume Oil' : '20% High Perfume Oil'})
                  </span>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Tested Longevity
                  </span>
                  <span className="text-sm font-semibold text-[#292522] sm:w-2/3">
                    {product.longevity || '10–12 Hours on skin, 24+ Hours on clothing'}
                  </span>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Sillage & Projection
                  </span>
                  <span className="text-sm font-semibold text-[#292522] sm:w-2/3">
                    {product.sillage || 'Moderate to Radiant (Intimate arms length cloud)'}
                  </span>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Recommended Occasions
                  </span>
                  <div className="sm:w-2/3 flex flex-wrap gap-2">
                    {(product.occasions || ['Daily Signature', 'Formal Evenings', 'Candlelit Dinners']).map(occ => (
                      <span
                        key={occ}
                        className="px-2.5 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-xs font-medium rounded-xs"
                      >
                        {occ}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Available Presentations
                  </span>
                  <span className="text-sm text-[#292522] sm:w-2/3 font-medium">
                    {product.variants.map(v => `${v.size} (₹${v.price.toLocaleString('en-IN')})`).join(' · ')}
                  </span>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Ingredients
                  </span>
                  <p className="text-xs text-[#756B63] font-mono sm:w-2/3 leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#756B63] font-medium sm:w-1/3">
                    Bottle Craft & Hardware
                  </span>
                  <span className="text-xs text-[#756B63] sm:w-2/3 leading-relaxed font-light">
                    Heavy French crystal silhouette, magnetic gold-plated zamak cap, micro-atomizer delivering an ultra-fine velvet diffusion.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRAGRANCE NOTES */}
          {activeTab === 'notes' && (
            <div className="py-12 max-w-4xl mx-auto space-y-12 animate-fade-in">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
                  The Olfactory Architecture
                </span>
                <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#292522] uppercase font-light">
                  The Note Pyramid
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light">
                  A symphony designed to unravel in three distinct temporal phases throughout your day.
                </p>
              </div>

              {/* 3 Tier Olfactory Pyramid Cards */}
              <div className="space-y-6">
                
                {/* 1. TOP NOTES */}
                <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E8DDD2] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#FAF3EC] border border-[#B8945F] text-[#B8945F] text-[10px] font-mono uppercase font-bold">
                        01 TOP
                      </span>
                      <h4 className="font-serif-luxury text-xl text-[#292522]">
                        First Impression (First 15–30 Minutes)
                      </h4>
                    </div>
                    <span className="text-xs text-[#756B63] font-light hidden sm:inline">Radiant & Sparkling</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {product.notes.top.map(note => (
                      <span
                        key={note}
                        className="px-3.5 py-1.5 bg-[#FAF3EC] border border-[#E8DDD2] text-xs font-medium text-[#292522] rounded-xs"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#756B63] font-light leading-relaxed">
                    The initial aromatic awakening upon application. Effervescent, crisp botanical essences that greet the senses and awaken the aura.
                  </p>
                </div>

                {/* 2. HEART NOTES */}
                <div className="p-6 bg-white border border-[#B8945F]/50 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E8DDD2] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#FAF3EC] border border-[#B8945F] text-[#B8945F] text-[10px] font-mono uppercase font-bold">
                        02 HEART
                      </span>
                      <h4 className="font-serif-luxury text-xl text-[#292522]">
                        The Signature Core (2–6 Hours)
                      </h4>
                    </div>
                    <span className="text-xs text-[#B8945F] font-semibold hidden sm:inline">The Soul of the Scent</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {product.notes.heart.map(note => (
                      <span
                        key={note}
                        className="px-3.5 py-1.5 bg-[#FAF3EC] border border-[#B8945F]/40 text-xs font-semibold text-[#292522] rounded-xs"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#756B63] font-light leading-relaxed">
                    The true olfactory personality that emerges as the top notes settle. Intricate florals and rare aromatics that define your sillage.
                  </p>
                </div>

                {/* 3. BASE NOTES */}
                <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E8DDD2] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#FAF3EC] border border-[#B8945F] text-[#B8945F] text-[10px] font-mono uppercase font-bold">
                        03 BASE
                      </span>
                      <h4 className="font-serif-luxury text-xl text-[#292522]">
                        The Enduring Memory (6–14+ Hours)
                      </h4>
                    </div>
                    <span className="text-xs text-[#756B63] font-light hidden sm:inline">Deep & Intimate</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {product.notes.base.map(note => (
                      <span
                        key={note}
                        className="px-3.5 py-1.5 bg-[#FAF3EC] border border-[#E8DDD2] text-xs font-medium text-[#292522] rounded-xs"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#756B63] font-light leading-relaxed">
                    The warmest, heaviest molecules that anchor the composition into your skin. Luxurious ambers, aged woods, and second-skin musks.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="py-12 max-w-4xl mx-auto space-y-12 animate-fade-in">
              
              {/* Reviews Summary Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-[#E8DDD2] p-8 rounded-sm shadow-xs">
                {/* Score summary */}
                <div className="md:col-span-5 text-center md:text-left md:border-r md:border-[#E8DDD2] md:pr-8">
                  <span className="text-5xl font-serif-luxury text-[#292522] font-normal tabular-nums">
                    {calculatedAvgRating}
                  </span>
                  <div className="flex items-center justify-center md:justify-start text-[#B8945F] gap-1 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(Number(calculatedAvgRating))
                            ? 'fill-[#B8945F] text-[#B8945F]'
                            : 'text-[#E8DDD2]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#756B63]">
                    Based on {totalReviewsCount} authenticated patron evaluations
                  </p>
                  <p className="text-[11px] text-[#B8945F] mt-1 font-semibold uppercase tracking-wider">
                    98% of wearers recommend this formulation
                  </p>
                </div>

                {/* Rating Breakdown Bars */}
                <div className="md:col-span-7 space-y-2 text-xs">
                  {ratingCounts.map(rc => (
                    <div key={rc.stars} className="flex items-center gap-3">
                      <span className="w-12 text-[#756B63] font-medium tabular-nums">{rc.stars} Stars</span>
                      <div className="flex-1 bg-[#FAF3EC] h-2 rounded-full overflow-hidden border border-[#E8DDD2]">
                        <div
                          className="bg-[#B8945F] h-full transition-all duration-500"
                          style={{ width: `${rc.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[#756B63] tabular-nums font-mono">
                        {rc.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar: Write Impression Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif-luxury text-2xl text-[#292522]">
                    Patron Impressions
                  </h4>
                  <p className="text-xs text-[#756B63]">
                    Verified experiences from collectors wearing {product.name}
                  </p>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-6 py-3 bg-[#292522] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8945F] transition-all cursor-pointer rounded-xs shadow-xs"
                >
                  {showReviewForm ? 'Close Form' : 'Write an Impression'}
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewFormSubmit}
                  className="p-6 sm:p-8 bg-[#FAF3EC] border border-[#B8945F]/50 rounded-sm shadow-md animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8DDD2]">
                    <h4 className="font-serif-luxury text-2xl text-[#292522]">
                      Compose Your Olfactory Review
                    </h4>
                    <span className="text-[11px] uppercase tracking-wider text-[#B8945F] font-semibold">
                      Verified Review
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block uppercase tracking-wider text-[#756B63] mb-1.5 font-semibold">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={e => setReviewName(e.target.value)}
                        className="w-full p-3 bg-white border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                        placeholder="e.g. Siddharth Varma"
                        required
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[#756B63] mb-1.5 font-semibold">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? 'fill-[#B8945F] text-[#B8945F]'
                                  : 'text-[#E8DDD2]'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-[#B8945F] font-semibold ml-2">
                          ({reviewRating} out of 5 stars)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[#756B63] mb-1.5 font-semibold">
                        Review Title
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={e => setReviewTitle(e.target.value)}
                        className="w-full p-3 bg-white border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                        placeholder="e.g. Mesmerizing dry-down and exceptional longevity"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[#756B63] mb-1.5 font-semibold">
                        Your Impression
                      </label>
                      <textarea
                        rows={4}
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        className="w-full p-3 bg-white border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs leading-relaxed"
                        placeholder="Describe how the fragrance evolves on your skin, longevity, compliments received, favorite notes..."
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-8 py-3.5 bg-[#292522] text-white font-semibold text-xs uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all cursor-pointer rounded-xs shadow-md"
                      >
                        {isSubmittingReview ? 'Publishing...' : 'Submit Verified Review'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {productReviews.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#E8DDD2] rounded-sm">
                    <p className="text-sm text-[#756B63] italic">
                      Be the first patron to share an olfactory impression for {product.name}.
                    </p>
                  </div>
                ) : (
                  productReviews.map(r => (
                    <div
                      key={r.id}
                      className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs flex flex-col justify-between"
                    >
                      {editingReviewId === r.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold text-[#B8945F]">
                              Edit Review
                            </span>
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="text-xs text-[#756B63] hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#756B63] mb-1">
                              Rating
                            </label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setEditRating(st)}
                                  className="p-0.5"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      st <= editRating ? 'fill-[#B8945F] text-[#B8945F]' : 'text-[#E8DDD2]'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full p-2 bg-[#FAF3EC] border border-[#E8DDD2] text-xs rounded-xs"
                            />
                          </div>
                          <div>
                            <textarea
                              rows={3}
                              value={editComment}
                              onChange={e => setEditComment(e.target.value)}
                              className="w-full p-2 bg-[#FAF3EC] border border-[#E8DDD2] text-xs rounded-xs"
                            />
                          </div>
                          <button
                            onClick={() => handleEditReviewSubmit(r.id)}
                            className="px-4 py-2 bg-[#292522] text-white text-xs uppercase tracking-wider font-semibold rounded-xs"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center text-[#B8945F] gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < r.rating ? 'fill-[#B8945F] text-[#B8945F]' : 'text-[#E8DDD2]'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-[#756B63]">{r.date}</span>
                            </div>

                            <h5 className="font-serif-luxury text-lg text-[#292522] mb-1.5 font-normal">
                              "{r.title}"
                            </h5>

                            <p className="text-xs text-[#756B63] leading-relaxed font-light">
                              {r.comment}
                            </p>
                          </div>

                          <div className="mt-5 pt-3 border-t border-[#E8DDD2] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[#292522]">{r.customerName}</span>
                              {r.verified && (
                                <span className="text-[#B8945F] uppercase text-[10px] tracking-wider font-semibold flex items-center gap-1 bg-[#FAF3EC] px-2 py-0.5 border border-[#B8945F]/30 rounded-xs">
                                  <Check className="w-3 h-3" /> Verified Patron
                                </span>
                              )}
                            </div>

                            {/* Owner actions: Edit & Delete */}
                            {isOwnerOfReview(r) && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingReviewId(r.id);
                                    setEditRating(r.rating);
                                    setEditTitle(r.title);
                                    setEditComment(r.comment);
                                  }}
                                  className="p-1 text-[#756B63] hover:text-[#B8945F] transition-colors cursor-pointer"
                                  title="Edit review"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(r.id)}
                                  className="p-1 text-[#756B63] hover:text-red-500 transition-colors cursor-pointer"
                                  title="Delete review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* 2. INTELLIGENT DISCOVERY & RECOMMENDATIONS SECTION */}
        <div className="mt-20 pt-16 border-t border-[#E8DDD2]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Olfactory Discovery</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-serif-luxury font-light tracking-[0.06em] text-[#292522] uppercase">
                RECOMMENDED HARMONIES
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light max-w-xl">
                Formulated by our master noses to complement your skin chemistry, olfactory preferences, and fragrance wardrobe.
              </p>
            </div>

            {/* Interactive Recommendation Mode Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs">
              <button
                onClick={() => setRecommendationTab('youMayLike')}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  recommendationTab === 'youMayLike'
                    ? 'bg-[#292522] text-white shadow-xs'
                    : 'text-[#756B63] hover:text-[#292522]'
                }`}
              >
                You May Also Like
              </button>
              <button
                onClick={() => setRecommendationTab('similar')}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  recommendationTab === 'similar'
                    ? 'bg-[#292522] text-white shadow-xs'
                    : 'text-[#756B63] hover:text-[#292522]'
                }`}
              >
                Similar Fragrances
              </button>
              <button
                onClick={() => setRecommendationTab('complete')}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  recommendationTab === 'complete'
                    ? 'bg-[#292522] text-white shadow-xs'
                    : 'text-[#756B63] hover:text-[#292522]'
                }`}
              >
                Complete Your Collection
              </button>
              <button
                onClick={() => setRecommendationTab('bestsellers')}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  recommendationTab === 'bestsellers'
                    ? 'bg-[#292522] text-white shadow-xs'
                    : 'text-[#756B63] hover:text-[#292522]'
                }`}
              >
                Bestsellers
              </button>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(recommendationTab === 'youMayLike'
              ? youMayLikeProducts
              : recommendationTab === 'similar'
              ? similarFragrances
              : recommendationTab === 'complete'
              ? completeCollectionProducts
              : bestsellerRecommendations
            ).map(recProd => (
              <ProductCard
                key={recProd.id}
                product={recProd}
                onSelect={id => {
                  if (onSelectProduct) {
                    onSelectProduct(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* 3. MOBILE STICKY PURCHASE ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DDD2] p-3 px-4 sm:hidden shadow-[0_-4px_16px_rgba(41,37,34,0.08)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={product.images[0] || '/src/assets/images/gloss_gems_radiance.jpg'}
            alt={product.name}
            className="w-10 h-10 object-contain bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs shrink-0 p-0.5"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-[#292522] truncate">{product.name}</h4>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-[#292522] tabular-nums">₹{activePrice.toLocaleString('en-IN')}</span>
              <span className="text-[#756B63] text-[10px]">({selectedSize})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              addToCart(product, selectedSize, quantity);
              showToast(`${product.name} added to bag`, 'success');
            }}
            disabled={isOutOfStock}
            className="px-3 py-2 bg-[#292522] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs disabled:opacity-50 flex items-center gap-1 cursor-pointer hover:bg-[#B8945F] transition-colors"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>ADD</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="px-3.5 py-2 bg-[#B8945F] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs disabled:opacity-50 cursor-pointer hover:bg-[#292522] transition-colors"
          >
            <span>BUY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
