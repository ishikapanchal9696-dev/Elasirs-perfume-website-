import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Star,
  Layers,
  Heart,
  Droplets,
  Clock,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { Product, FragranceFamily } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CollectionsPageProps {
  products: Product[];
  activeCollectionId?: string;
  onSelectCollection: (collectionId: string) => void;
  onSelectProduct: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onNavigateShop: () => void;
  onOpenQuiz: () => void;
}

interface CollectionMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'tier' | 'family' | 'occasion' | 'mood';
  image: string;
  accentBg: string;
  filterFn: (p: Product) => boolean;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  products,
  activeCollectionId = 'all',
  onSelectCollection,
  onSelectProduct,
  onQuickView,
  onNavigateShop,
  onOpenQuiz,
}) => {
  // Sort and filter state for collection detail view
  const [sortBy, setSortBy] = useState<
    'featured' | 'bestselling' | 'newest' | 'price-asc' | 'price-desc' | 'rating'
  >('featured');
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedIntensity, setSelectedIntensity] = useState<string>('All');

  // Metadata mapping for all collections
  const collectionsRegistry: Record<string, CollectionMeta> = useMemo(() => ({
    // Tiers
    everyday: {
      id: 'everyday',
      title: 'THE EVERYDAY COLLECTION',
      subtitle: 'Accessible Luxury for Daily Radiance',
      description: 'Effortless fragrances made for everyday moments. Subtle, balanced, and composed with fresh botanical harmonies that elevate the ordinary into understated elegance.',
      type: 'tier',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      accentBg: 'bg-[#FAF3EC]',
      filterFn: (p: Product) => p.price <= 3299,
    },
    signature: {
      id: 'signature',
      title: 'THE SIGNATURE COLLECTION',
      subtitle: 'Iconic Creations of Maison ELASIRS',
      description: 'Distinctive scents that become part of your identity. Masterfully balanced formulations crafted around rare Grasse blossoms and sacred aged woods.',
      type: 'tier',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      accentBg: 'bg-[#F5E8DC]/80',
      filterFn: (p: Product) => p.price > 3299 && p.price <= 3699,
    },
    luxe: {
      id: 'luxe',
      title: 'THE LUXE COLLECTION',
      subtitle: 'Haute Extrait Reserve Extractions',
      description: 'Rich, sophisticated fragrances for unforgettable moments. Concentrated Extrait de Parfum compositions featuring 24%+ pure perfume oils, aged agarwood, and rare ambers.',
      type: 'tier',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E6D0B8]/50',
      filterFn: (p: Product) => p.price > 3699,
    },

    // Families
    floral: {
      id: 'floral',
      title: 'FLORAL COLLECTION',
      subtitle: 'Heirloom Petals & Twilight Intimacy',
      description: 'Soft, romantic and expressive. Luminous nocturnal bouquets featuring heirloom Damask rose, white Grasse neroli, French tuberose, and velvety white petals.',
      type: 'family',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      accentBg: 'bg-[#E8C5C0]/30',
      filterFn: (p: Product) => p.family.toLowerCase() === 'floral',
    },
    woody: {
      id: 'woody',
      title: 'WOODY COLLECTION',
      subtitle: 'Sacred Woods & Meditative Depth',
      description: 'Warm, sophisticated and grounded. Centered upon authentic Mysore and Australian sandalwood, Virginia cedarwood, smoked Haitian vetiver, and velvet suede.',
      type: 'family',
      image: '/src/assets/images/perfume_woody_flacon_1790830726060.jpg',
      accentBg: 'bg-[#F5E8DC]/80',
      filterFn: (p: Product) => p.family.toLowerCase() === 'woody',
    },
    fresh: {
      id: 'fresh',
      title: 'FRESH COLLECTION',
      subtitle: 'Solar Citrus & Saline Sea Mist',
      description: 'Clean, bright and refreshing. Rejuvenating compositions blending Calabrian citrus zest, marine sea spray, crushed herbs, and crystalline white driftwood.',
      type: 'family',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      accentBg: 'bg-[#FAF3EC]',
      filterFn: (p: Product) => p.family.toLowerCase() === 'fresh',
    },
    oriental: {
      id: 'oriental',
      title: 'ORIENTAL COLLECTION',
      subtitle: 'Molten Resins & Nocturnal Spices',
      description: 'Rich, sensual and mysterious. An intoxicating tapestry of golden benzoin resins, aged Kashmiri saffron, decadent dark honey, and wild agarwood oudh.',
      type: 'family',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E6D0B8]/40',
      filterFn: (p: Product) => p.family.toLowerCase() === 'oriental',
    },
    musky: {
      id: 'musky',
      title: 'MUSKY COLLECTION',
      subtitle: 'Intimate Second-Skin Velvety Aura',
      description: 'Smooth, intimate and elegant. Delicate second-skin silhouetted accords featuring silky cotton flower, powdered solar iris, and sheer botanical cashmere musk.',
      type: 'family',
      image: '/src/assets/images/gloss_gems_radiance.jpg',
      accentBg: 'bg-[#F5E8DC]/50',
      filterFn: (p: Product) => p.family.toLowerCase() === 'musky',
    },
    gourmand: {
      id: 'gourmand',
      title: 'GOURMAND COLLECTION',
      subtitle: 'Bourbon Vanilla & Toasted Tonka Nectar',
      description: 'Sweet, warm and indulgent. A decadent confection of slow-cured Bourbon vanilla pods, caramelized tonka bean, bitter almond, and roasted coffee accords.',
      type: 'family',
      image: '/src/assets/images/download-1.jpg',
      accentBg: 'bg-[#F3D8CC]/40',
      filterFn: (p: Product) => p.family.toLowerCase() === 'gourmand',
    },

    // Occasions
    'occasion-everyday': {
      id: 'occasion-everyday',
      title: 'EVERYDAY FRAGRANCES',
      subtitle: 'Effortless Daily Sophistication',
      description: 'Creations formulated for effortless all-day presence, combining fresh clarity with subtle warm skin dry-downs.',
      type: 'occasion',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      accentBg: 'bg-[#FAF3EC]',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('daily') || o.toLowerCase().includes('everyday')),
    },
    'occasion-work': {
      id: 'occasion-work',
      title: 'WORK & CREATIVE ATELIER',
      subtitle: 'Polished Focus & Executive Poise',
      description: 'Fragrances designed to radiate quiet competence and polished refinement in professional and creative settings.',
      type: 'occasion',
      image: '/src/assets/images/perfume_woody_flacon_1790830726060.jpg',
      accentBg: 'bg-[#F5E8DC]',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('work') || o.toLowerCase().includes('creative') || o.toLowerCase().includes('office')),
    },
    'occasion-date-night': {
      id: 'occasion-date-night',
      title: 'DATE NIGHT & INTIMACY',
      subtitle: 'Magnetic Close-Proximity Sillage',
      description: 'Romantic, seductive blends formulated to draw others closer with velvety petals, warm skin ambers, and sweet spices.',
      type: 'occasion',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E8C5C0]/40',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('date') || o.toLowerCase().includes('romantic') || o.toLowerCase().includes('dinner')),
    },
    'occasion-evening': {
      id: 'occasion-evening',
      title: 'EVENING & NOCTURNE',
      subtitle: 'Opulent Twilight Formulations',
      description: 'Compelling flacons crafted for twilight dinners, candlelit soirees, and commanding dusk projection.',
      type: 'occasion',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E6D0B8]/40',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('evening') || o.toLowerCase().includes('nocturnal')),
    },
    'occasion-party': {
      id: 'occasion-party',
      title: 'PARTY & CELEBRATIONS',
      subtitle: 'Vibrant Magnetic Projection',
      description: 'Effervescent and hypnotic compositions that maintain radiant energy throughout the night.',
      type: 'occasion',
      image: '/src/assets/images/download-1.jpg',
      accentBg: 'bg-[#F3D8CC]/40',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('party') || o.toLowerCase().includes('celebration')),
    },
    'occasion-wedding': {
      id: 'occasion-wedding',
      title: 'WEDDING & CEREMONIES',
      subtitle: 'Sacred Romance & Couture Poise',
      description: 'Ethereal florals and precious Mysore sandalwood formulated for momentous life ceremonies and enduring photo memories.',
      type: 'occasion',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      accentBg: 'bg-[#E8C5C0]/30',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('wedding') || o.toLowerCase().includes('ceremony') || o.toLowerCase().includes('formal')),
    },
    'occasion-vacation': {
      id: 'occasion-vacation',
      title: 'VACATION & ESCAPES',
      subtitle: 'Sun-Drenched Coastal Freedom',
      description: 'Crisp saline breezes, ripe citrus peels, and buoyant floral airs that evoke Mediterranean coastal holidays.',
      type: 'occasion',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      accentBg: 'bg-[#FAF3EC]',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('summer') || o.toLowerCase().includes('vacation') || o.toLowerCase().includes('escape')),
    },
    'occasion-self-care': {
      id: 'occasion-self-care',
      title: 'SELF-CARE & SERENITY',
      subtitle: 'Quiet Meditative Comfort',
      description: 'Calming second-skin cashmere musks and soft lavender undertones for private moments of restoration.',
      type: 'occasion',
      image: '/src/assets/images/gloss_gems_radiance.jpg',
      accentBg: 'bg-[#F5E8DC]/60',
      filterFn: (p: Product) => (p.occasions || []).some(o => o.toLowerCase().includes('self-care') || o.toLowerCase().includes('quiet') || o.toLowerCase().includes('soiree')),
    },

    // Moods
    'mood-romantic': {
      id: 'mood-romantic',
      title: 'ROMANTIC MOOD',
      subtitle: 'Petals, Velvets & Intimate Whispers',
      description: 'Intoxicating Damask roses, soft white petals, and molten benzoin that invite closeness.',
      type: 'mood',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      accentBg: 'bg-[#E8C5C0]/30',
      filterFn: (p: Product) => p.family === 'Floral' || (p.story + p.description).toLowerCase().includes('romantic'),
    },
    'mood-elegant': {
      id: 'mood-elegant',
      title: 'ELEGANT MOOD',
      subtitle: 'Tailored Poise & Classical Grace',
      description: 'Crisp neroli, powdered Florentine iris, and creamy sandalwood with impeccably balanced sillage.',
      type: 'mood',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      accentBg: 'bg-[#FAF3EC]',
      filterFn: (p: Product) => (p.story + p.description).toLowerCase().includes('elegant') || p.rating >= 4.9,
    },
    'mood-fresh': {
      id: 'mood-fresh',
      title: 'FRESH MOOD',
      subtitle: 'Uplifting Clarity & Daylight Sparkle',
      description: 'Solar Calabrian citrus, crushed violet leaf, and crystalline sea ozone to awaken the spirit.',
      type: 'mood',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      accentBg: 'bg-[#FAF3EC]',
      filterFn: (p: Product) => p.family === 'Fresh' || (p.story + p.description).toLowerCase().includes('clean'),
    },
    'mood-mysterious': {
      id: 'mood-mysterious',
      title: 'MYSTERIOUS MOOD',
      subtitle: 'Shadowed Resins & Enigmatic Aura',
      description: 'Smoked frankincense, dark spices, aged agarwood, and midnight vanilla pods.',
      type: 'mood',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E6D0B8]/40',
      filterFn: (p: Product) => p.family === 'Oriental' || p.family === 'Woody',
    },
    'mood-bold': {
      id: 'mood-bold',
      title: 'BOLD MOOD',
      subtitle: 'Regal Sillage & Fearless Presence',
      description: 'Commanding Extrait de Parfum creations that proclaim arrival with opulence and majesty.',
      type: 'mood',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E6D0B8]/50',
      filterFn: (p: Product) => p.type.includes('Extrait') || p.price >= 3899,
    },
    'mood-warm': {
      id: 'mood-warm',
      title: 'WARM MOOD',
      subtitle: 'Cashmere Embers & Golden Nectar',
      description: 'Roasted tonka bean, ambergris, bourbon vanilla, and creamy Australian sandalwood.',
      type: 'mood',
      image: '/src/assets/images/download-1.jpg',
      accentBg: 'bg-[#F3D8CC]/40',
      filterFn: (p: Product) => p.family === 'Gourmand' || p.family === 'Woody' || (p.story + p.description).toLowerCase().includes('warm'),
    },
    'mood-playful': {
      id: 'mood-playful',
      title: 'PLAYFUL MOOD',
      subtitle: 'Spirited Nectar & Effervescent Charm',
      description: 'Spiced pink pepper, wild red berries, juicy pear, and sparkling citrus peels.',
      type: 'mood',
      image: '/src/assets/images/download-1.jpg',
      accentBg: 'bg-[#F3D8CC]/30',
      filterFn: (p: Product) => p.family === 'Gourmand' || p.family === 'Fresh' || (p.story + p.description).toLowerCase().includes('sparkling'),
    },
    'mood-calm': {
      id: 'mood-calm',
      title: 'CALM MOOD',
      subtitle: 'Serene Sanctuary & Meditative Quiet',
      description: 'Blonde cedar, sheer white musk, white tea, and soft cashmere wood chords.',
      type: 'mood',
      image: '/src/assets/images/gloss_gems_radiance.jpg',
      accentBg: 'bg-[#F5E8DC]/50',
      filterFn: (p: Product) => p.family === 'Musky' || p.family === 'Woody',
    },
    'mood-sensual': {
      id: 'mood-sensual',
      title: 'SENSUAL MOOD',
      subtitle: 'Hypnotic Magnetism & Skin Chemistry',
      description: 'Molten golden amber, second-skin cashmere musk, and honeyed florals that evolve with body heat.',
      type: 'mood',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E8C5C0]/40',
      filterFn: (p: Product) => p.family === 'Oriental' || p.family === 'Musky',
    },
    'mood-luxurious': {
      id: 'mood-luxurious',
      title: 'LUXURIOUS MOOD',
      subtitle: 'Supreme Haute Parfumerie Grandeur',
      description: 'The pinnacle of French craftsmanship—aged demijohn extractions in crystal presentation flacons.',
      type: 'mood',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      accentBg: 'bg-[#E6D0B8]/50',
      filterFn: (p: Product) => p.price >= 3699,
    },
  }), []);

  const isDetailView = activeCollectionId && activeCollectionId !== 'all';
  const currentCollection = isDetailView ? collectionsRegistry[activeCollectionId] : null;

  // Filtered products for active collection detail
  const collectionProducts = useMemo(() => {
    if (!currentCollection) return products;

    let result = products.filter(currentCollection.filterFn);

    // Filter by max price
    result = result.filter(p => p.price <= maxPrice);

    // Filter by min rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Filter by size
    if (selectedSize !== 'All') {
      result = result.filter(p => p.variants.some(v => v.size.toLowerCase().includes(selectedSize.toLowerCase())));
    }

    // Filter by stock
    if (onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Filter by intensity
    if (selectedIntensity !== 'All') {
      result = result.filter(p => p.type.toLowerCase().includes(selectedIntensity.toLowerCase()));
    }

    // Sorting
    switch (sortBy) {
      case 'bestselling':
        result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
        break;
    }

    return result;
  }, [
    products,
    currentCollection,
    maxPrice,
    minRating,
    selectedSize,
    onlyInStock,
    selectedIntensity,
    sortBy,
  ]);

  const hasActiveFilters =
    maxPrice < 7000 ||
    minRating > 0 ||
    selectedSize !== 'All' ||
    onlyInStock ||
    selectedIntensity !== 'All';

  const resetFilters = () => {
    setMaxPrice(7000);
    setMinRating(0);
    setSelectedSize('All');
    setOnlyInStock(false);
    setSelectedIntensity('All');
    setSortBy('featured');
  };

  // ============================================================================
  // RENDER: COLLECTION DETAIL VIEW (When an active collection is selected)
  // ============================================================================
  if (isDetailView && currentCollection) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-[#292522] py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#756B63] mb-8 font-medium">
            <button
              onClick={() => onSelectCollection('all')}
              className="hover:text-[#292522] transition-colors cursor-pointer"
            >
              Collections
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#E8DDD2]" />
            <span className="text-[#B8945F] font-semibold">{currentCollection.title}</span>
          </nav>

          {/* Collection Detail Hero Section */}
          <div className="relative overflow-hidden rounded-sm border border-[#E8DDD2] bg-white shadow-xs p-6 sm:p-10 lg:p-14 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Collection Narrative */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#B8945F] text-[11px] uppercase tracking-[0.25em] font-semibold rounded-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Collection</span>
                </div>

                <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#292522] uppercase tracking-[0.06em] leading-tight">
                  {currentCollection.title}
                </h1>

                <p className="font-serif-luxury italic text-base sm:text-lg text-[#B8945F] font-normal">
                  "{currentCollection.subtitle}"
                </p>

                <p className="text-sm sm:text-base text-[#756B63] font-light leading-relaxed max-w-2xl pt-1">
                  {currentCollection.description}
                </p>

                {/* Back to All Collections Action */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onSelectCollection('all')}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#756B63] hover:text-[#292522] pb-1 border-b border-[#E8DDD2] hover:border-[#292522] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#B8945F]" />
                    <span>View All Collections</span>
                  </button>

                  <button
                    onClick={onOpenQuiz}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF3EC] border border-[#E8DDD2] hover:border-[#B8945F] text-[#292522] text-xs font-semibold uppercase tracking-[0.18em] transition-colors rounded-xs cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#B8945F]" />
                    <span>Take Scent Quiz</span>
                  </button>
                </div>
              </div>

              {/* Right Column: LARGE Prominent Flacon Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-xs overflow-hidden border border-[#E8DDD2] bg-[#FAF3EC] flex items-center justify-center p-6 shadow-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,253,249,0.95)_0%,_rgba(250,243,236,0.85)_55%,_rgba(245,232,220,0.5)_100%)]" />
                  <img
                    src={currentCollection.image}
                    alt={currentCollection.title}
                    className="relative z-10 max-h-[88%] object-contain drop-shadow-[0_20px_35px_rgba(41,37,34,0.18)]"
                  />
                  <div className="absolute bottom-4 w-3/5 h-3 bg-[#756B63]/14 rounded-[100%] blur-sm pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Collection Filter & Sorting Controls */}
          <div className="pb-6 border-b border-[#E8DDD2] mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif-luxury text-[#292522] uppercase tracking-wide">
                  PRODUCTS IN THIS COLLECTION
                </h2>
                <span className="text-xs text-[#756B63] mt-0.5 block">
                  Showing <strong className="text-[#292522] tabular-nums font-semibold">{collectionProducts.length}</strong> creations matching criteria
                </span>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#756B63] uppercase tracking-wider font-medium hidden sm:inline">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#E8DDD2] text-xs text-[#292522] px-3 py-2 outline-none focus:border-[#292522] rounded-xs cursor-pointer shadow-2xs tracking-wider"
                >
                  <option value="featured">Featured Creations</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="newest">Newest Releases</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
              {/* Max Price slider */}
              <div className="flex items-center gap-2.5 bg-white border border-[#E8DDD2] px-3 py-1.5 rounded-xs shadow-2xs">
                <span className="text-[#756B63] uppercase tracking-wider text-[11px] font-medium">Max Price:</span>
                <input
                  type="range"
                  min="2500"
                  max="7000"
                  step="100"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-[#292522] cursor-pointer"
                />
                <span className="text-[#292522] font-semibold tabular-nums">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Rating selector */}
              <div className="flex items-center gap-1.5 bg-white border border-[#E8DDD2] px-3 py-1.5 rounded-xs shadow-2xs">
                <span className="text-[#756B63] uppercase tracking-wider text-[11px] font-medium mr-1">Rating:</span>
                {[0, 4.8, 4.9].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-2 py-0.5 text-[10px] rounded-xs transition-colors cursor-pointer ${
                      minRating === r
                        ? 'bg-[#292522] text-white font-semibold'
                        : 'text-[#756B63] hover:text-[#292522]'
                    }`}
                  >
                    {r === 0 ? 'All' : `${r}+★`}
                  </button>
                ))}
              </div>

              {/* In stock checkbox */}
              <label className="flex items-center gap-2 bg-white border border-[#E8DDD2] px-3 py-1.5 rounded-xs shadow-2xs cursor-pointer text-[#292522]">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="accent-[#292522]"
                />
                <span className="text-[11px] uppercase tracking-wider font-medium">In Stock Only</span>
              </label>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#B8945F] hover:underline cursor-pointer font-semibold ml-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Applied filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] uppercase tracking-wider text-[#756B63] font-semibold">
                  Applied Filters:
                </span>
                {maxPrice < 7000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[11px] text-[#292522] rounded-xs">
                    <span>Under ₹{maxPrice.toLocaleString('en-IN')}</span>
                    <button onClick={() => setMaxPrice(7000)} className="text-[#756B63] hover:text-[#292522] cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[11px] text-[#292522] rounded-xs">
                    <span>{minRating}+ Stars</span>
                    <button onClick={() => setMinRating(0)} className="text-[#756B63] hover:text-[#292522] cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {onlyInStock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[11px] text-[#292522] rounded-xs">
                    <span>In Stock Only</span>
                    <button onClick={() => setOnlyInStock(false)} className="text-[#756B63] hover:text-[#292522] cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Products Grid or Empty State */}
          {collectionProducts.length === 0 ? (
            <div className="py-20 text-center bg-white border border-[#E8DDD2] p-8 rounded-sm shadow-xs max-w-2xl mx-auto my-8">
              <Sparkles className="w-8 h-8 text-[#B8945F] mx-auto mb-3" />
              <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide">
                New fragrances are coming to this collection.
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light max-w-md mx-auto">
                Our master perfumers in Grasse are currently aging fresh seasonal harvests for this realm. Explore our full catalog or discover your personal blend.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-white border border-[#292522] text-[#292522] text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF3EC] transition-colors rounded-xs cursor-pointer"
                >
                  Reset Collection Filters
                </button>
                <button
                  onClick={onNavigateShop}
                  className="px-6 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors rounded-xs cursor-pointer"
                >
                  EXPLORE ALL FRAGRANCES
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {collectionProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN COLLECTIONS LANDING PAGE
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#292522]">
      {/* 1. COLLECTION HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FFFDF9] border-b border-[#E8DDD2] pt-10 pb-16 lg:py-24">
        {/* Ambient lighting glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-36 right-1/4 w-[550px] h-[550px] rounded-full bg-[#FAF3EC] blur-3xl opacity-80" />
          <div className="absolute bottom-0 right-10 w-[450px] h-[450px] rounded-full bg-[#F5E8DC]/60 blur-3xl" />
          <div className="absolute top-1/3 left-10 w-[380px] h-[380px] rounded-full bg-[#F3D8CC]/35 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Headline & Action Buttons */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
                <span>THE ELASIRS COLLECTIONS</span>
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-light text-[#292522] tracking-[0.02em] leading-[1.08]">
                Find The Fragrance
                <br />
                <span className="italic font-normal text-[#B8945F]">That Feels Like You.</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#756B63] max-w-xl font-light leading-relaxed">
                Explore the ELASIRS collections and discover a scent for every mood, moment and personality. Discover fragrances created for every version of you.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={onNavigateShop}
                  className="px-8 py-4 bg-[#292522] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
                >
                  <span>SHOP ALL FRAGRANCES</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenQuiz}
                  className="px-8 py-4 bg-white border border-[#E8DDD2] text-[#292522] text-xs font-semibold uppercase tracking-[0.22em] hover:border-[#292522] hover:bg-[#FAF3EC] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
                  <span>FIND YOUR FRAGRANCE</span>
                </button>
              </div>

              {/* Brand Pillars */}
              <div className="mt-10 pt-6 border-t border-[#E8DDD2] grid grid-cols-3 gap-4 text-left">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#292522]">120-Day Aging</h4>
                  <p className="text-[11px] text-[#756B63] mt-0.5">Cellar Maturation</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#292522]">Extrait Strength</h4>
                  <p className="text-[11px] text-[#756B63] mt-0.5">20%–28% Pure Oils</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#292522]">Discovery Trial</h4>
                  <p className="text-[11px] text-[#756B63] mt-0.5">Included with Order</p>
                </div>
              </div>
            </div>

            {/* Right Column: LARGE Prominent Perfume Flacon Visual (45–55% Visual Hero Area) */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center items-center">
              <div className="relative w-full max-w-lg lg:max-w-xl aspect-[4/5] min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] rounded-sm bg-gradient-to-b from-[#FAF3EC] via-[#F5E8DC]/80 to-[#FAF3EC] border border-[#E8DDD2] flex items-center justify-center p-8 sm:p-12 shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,253,249,0.95)_0%,_rgba(250,243,236,0.85)_50%,_rgba(245,232,220,0.6)_100%)]" />

                <div className="absolute top-5 left-5 z-20 text-[10px] uppercase tracking-[0.25em] text-[#756B63] font-mono">
                  THE ARCHIVES · HAUTE PARFUMERIE
                </div>

                <div className="absolute top-5 right-5 z-20 text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold bg-white/90 px-2.5 py-0.5 border border-[#E8DDD2] rounded-xs">
                  8 ARTISANAL HARVESTS
                </div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center cursor-pointer group" onClick={onNavigateShop}>
                  <img
                    src="/src/assets/images/featured_elasirs_no1_1790830702808.jpg"
                    alt="ELASIRS Haute Parfumerie Flacon"
                    className="max-h-[84%] sm:max-h-[88%] w-auto object-contain drop-shadow-[0_24px_40px_rgba(41,37,34,0.18)] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="w-3/5 h-4 bg-[#756B63]/15 rounded-[100%] blur-md mt-1" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED SIGNATURE TIERS (Everyday, Signature, Luxe) */}
      <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E8DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
              Formulation Tiers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
              THE SIGNATURE COLLECTIONS
            </h2>
            <p className="mt-3 text-sm text-[#756B63] font-light leading-relaxed">
              Curated by formulation strength, rare botanical harvests, and the intensity of your presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: EVERYDAY */}
            <div
              onClick={() => onSelectCollection('everyday')}
              className="group bg-[#FFFDF9] border border-[#E8DDD2] rounded-sm p-6 sm:p-8 flex flex-col justify-between hover:border-[#B8945F] hover:shadow-lg hover:shadow-[#292522]/5 transition-all duration-300 cursor-pointer"
            >
              <div>
                <div className="relative aspect-[4/3] w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-6 mb-6 border border-[#E8DDD2]/60">
                  <img
                    src="/src/assets/images/perfume_floral_flacon_1790830736168.jpg"
                    alt="EVERYDAY Collection"
                    className="max-h-[90%] object-contain drop-shadow-[0_12px_24px_rgba(41,37,34,0.14)] transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white px-2 py-0.5 border border-[#E8DDD2] text-[10px] uppercase font-mono tracking-widest text-[#756B63]">
                    {products.filter(p => p.price <= 3299).length} FRAGRANCES
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  TIER 01 · ACCESSIBLE LUXURY
                </span>
                <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                  EVERYDAY
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light leading-relaxed">
                  Effortless fragrances made for everyday moments. Subtle, radiant, and composed for personal intimacy.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-center justify-between">
                <span className="text-xs text-[#292522] font-semibold tabular-nums">From ₹2,999</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#292522] group-hover:text-[#B8945F] transition-colors">
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Card 2: SIGNATURE */}
            <div
              onClick={() => onSelectCollection('signature')}
              className="group bg-[#FFFDF9] border border-[#B8945F]/50 rounded-sm p-6 sm:p-8 flex flex-col justify-between hover:border-[#B8945F] hover:shadow-lg hover:shadow-[#292522]/5 transition-all duration-300 cursor-pointer relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B8945F] text-white px-3 py-0.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-xs">
                MOST COVETED
              </div>

              <div>
                <div className="relative aspect-[4/3] w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-6 mb-6 border border-[#E8DDD2]/60">
                  <img
                    src="/src/assets/images/featured_elasirs_no1_1790830702808.jpg"
                    alt="SIGNATURE Collection"
                    className="max-h-[90%] object-contain drop-shadow-[0_12px_24px_rgba(41,37,34,0.14)] transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white px-2 py-0.5 border border-[#E8DDD2] text-[10px] uppercase font-mono tracking-widest text-[#756B63]">
                    {products.filter(p => p.price > 3299 && p.price <= 3699).length} FRAGRANCES
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  TIER 02 · MAISON ICONS
                </span>
                <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                  SIGNATURE
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light leading-relaxed">
                  Distinctive scents that become part of your identity. Masterfully balanced accords that unfold with skin warmth.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-center justify-between">
                <span className="text-xs text-[#292522] font-semibold tabular-nums">From ₹3,499</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#292522] group-hover:text-[#B8945F] transition-colors">
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Card 3: LUXE */}
            <div
              onClick={() => onSelectCollection('luxe')}
              className="group bg-[#FFFDF9] border border-[#E8DDD2] rounded-sm p-6 sm:p-8 flex flex-col justify-between hover:border-[#B8945F] hover:shadow-lg hover:shadow-[#292522]/5 transition-all duration-300 cursor-pointer"
            >
              <div>
                <div className="relative aspect-[4/3] w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-6 mb-6 border border-[#E8DDD2]/60">
                  <img
                    src="/src/assets/images/hero_perfume_luxury_1790830691406.jpg"
                    alt="LUXE Collection"
                    className="max-h-[90%] object-contain drop-shadow-[0_12px_24px_rgba(41,37,34,0.14)] transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white px-2 py-0.5 border border-[#E8DDD2] text-[10px] uppercase font-mono tracking-widest text-[#756B63]">
                    {products.filter(p => p.price > 3699).length} FRAGRANCES
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  TIER 03 · HAUTE EXTRAIT RESERVE
                </span>
                <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                  LUXE
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light leading-relaxed">
                  Rich, sophisticated fragrances for unforgettable moments. Intense 24%+ Extrait de Parfum oil concentrations.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-center justify-between">
                <span className="text-xs text-[#292522] font-semibold tabular-nums">From ₹3,799</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#292522] group-hover:text-[#B8945F] transition-colors">
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FRAGRANCE FAMILY COLLECTIONS (Floral, Woody, Fresh, Oriental, Musky, Gourmand) */}
      <section className="py-16 lg:py-24 bg-[#FAF3EC] border-b border-[#E8DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
              The Olfactory Spectrum
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
              SHOP BY FRAGRANCE FAMILY
            </h2>
            <p className="mt-3 text-sm text-[#756B63] font-light leading-relaxed">
              Every ELASIRS creation belongs to an intentional botanical lineage harvested across France, India, and the Mediterranean.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'floral',
                name: 'FLORAL',
                desc: 'Soft, romantic and expressive.',
                image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
                accentBg: 'bg-[#E8C5C0]/25',
                family: 'Floral',
              },
              {
                id: 'woody',
                name: 'WOODY',
                desc: 'Warm, sophisticated and grounded.',
                image: '/src/assets/images/perfume_woody_flacon_1790830726060.jpg',
                accentBg: 'bg-[#F5E8DC]/70',
                family: 'Woody',
              },
              {
                id: 'fresh',
                name: 'FRESH',
                desc: 'Clean, bright and refreshing.',
                image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
                accentBg: 'bg-[#FAF3EC]',
                family: 'Fresh',
              },
              {
                id: 'oriental',
                name: 'ORIENTAL',
                desc: 'Rich, sensual and mysterious.',
                image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
                accentBg: 'bg-[#E6D0B8]/40',
                family: 'Oriental',
              },
              {
                id: 'musky',
                name: 'MUSKY',
                desc: 'Smooth, intimate and elegant.',
                image: '/src/assets/images/gloss_gems_radiance.jpg',
                accentBg: 'bg-[#F5E8DC]/50',
                family: 'Musky',
              },
              {
                id: 'gourmand',
                name: 'GOURMAND',
                desc: 'Sweet, warm and indulgent.',
                image: '/src/assets/images/download-1.jpg',
                accentBg: 'bg-[#F3D8CC]/40',
                family: 'Gourmand',
              },
            ].map(item => {
              const count = products.filter(p => p.family.toLowerCase() === item.family.toLowerCase()).length;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCollection(item.id)}
                  className="group bg-white border border-[#E8DDD2] rounded-sm p-5 sm:p-6 flex flex-col justify-between hover:border-[#B8945F] hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-20 h-24 sm:w-24 sm:h-28 rounded-xs overflow-hidden flex items-center justify-center p-2 border border-[#E8DDD2]/60 shrink-0 ${item.accentBg}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full object-contain drop-shadow-sm group-hover:scale-106 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-[#B8945F] font-mono font-semibold">
                          {count} {count === 1 ? 'Fragrance' : 'Fragrances'}
                        </span>
                      </div>
                      <h3 className="font-serif-luxury text-xl text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors mt-0.5">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#756B63] font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DDD2] flex items-center justify-between text-xs">
                    <span className="text-[#756B63] text-[11px]">Real Botanical Extracts</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#292522] group-hover:text-[#B8945F] transition-colors">
                      <span>EXPLORE</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. OCCASION COLLECTIONS (Fragrances For Every Moment) */}
      <section className="py-16 lg:py-24 bg-[#FFFDF9] border-b border-[#E8DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
              Life's Moments
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
              FRAGRANCES FOR EVERY MOMENT
            </h2>
            <p className="mt-3 text-sm text-[#756B63] font-light leading-relaxed">
              Tailored olfactory silhouettes crafted to resonate effortlessly with every chapter of your day.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { id: 'occasion-everyday', name: 'EVERYDAY', desc: 'Effortless Signature', matches: 3 },
              { id: 'occasion-work', name: 'WORK', desc: 'Poised & Creative', matches: 2 },
              { id: 'occasion-date-night', name: 'DATE NIGHT', desc: 'Intimate & Magnetic', matches: 3 },
              { id: 'occasion-evening', name: 'EVENING', desc: 'Commanding Depth', matches: 2 },
              { id: 'occasion-party', name: 'PARTY', desc: 'Vibrant Projection', matches: 1 },
              { id: 'occasion-wedding', name: 'WEDDING', desc: 'Sacred Romance', matches: 2 },
              { id: 'occasion-vacation', name: 'VACATION', desc: 'Solar Sea Mist', matches: 2 },
              { id: 'occasion-self-care', name: 'SELF-CARE', desc: 'Quiet Meditative', matches: 2 },
            ].map(item => {
              const meta = collectionsRegistry[item.id];
              const realCount = products.filter(meta?.filterFn || (() => false)).length;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCollection(item.id)}
                  className="p-5 bg-white border border-[#E8DDD2] rounded-sm hover:border-[#B8945F] hover:shadow-xs transition-all duration-200 cursor-pointer text-left flex flex-col justify-between h-36 group"
                >
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#B8945F] font-semibold block">
                      {realCount} {realCount === 1 ? 'Scent' : 'Scents'}
                    </span>
                    <h4 className="font-serif-luxury text-lg text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors mt-0.5">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#756B63] font-light mt-1">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#292522] group-hover:text-[#B8945F] flex items-center gap-1 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MOOD COLLECTIONS (Choose Your Mood) */}
      <section className="py-16 lg:py-24 bg-[#FAF3EC] border-b border-[#E8DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
              Emotional Aura
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
              CHOOSE YOUR MOOD
            </h2>
            <p className="mt-3 text-sm text-[#756B63] font-light leading-relaxed">
              Connect directly with how you feel right now—or the energy you want to summon into your presence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
            {[
              { id: 'mood-romantic', name: 'ROMANTIC', note: 'Velvety Damask Rose' },
              { id: 'mood-elegant', name: 'ELEGANT', note: 'Florentine Iris & Neroli' },
              { id: 'mood-fresh', name: 'FRESH', note: 'Calabrian Sea Ozone' },
              { id: 'mood-mysterious', name: 'MYSTERIOUS', note: 'Aged Oudh & Spices' },
              { id: 'mood-bold', name: 'BOLD', note: 'Extrait Projection' },
              { id: 'mood-warm', name: 'WARM', note: 'Bourbon Vanilla Pod' },
              { id: 'mood-playful', name: 'PLAYFUL', note: 'Bitter Almond & Berries' },
              { id: 'mood-calm', name: 'CALM', note: 'White Tea & Cedar' },
              { id: 'mood-sensual', name: 'SENSUAL', note: 'Cashmere Musk' },
              { id: 'mood-luxurious', name: 'LUXURIOUS', note: 'Demijohn Maturation' },
            ].map(m => {
              const meta = collectionsRegistry[m.id];
              const realCount = products.filter(meta?.filterFn || (() => false)).length;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectCollection(m.id)}
                  className="p-4 bg-white border border-[#E8DDD2] rounded-xs text-left hover:border-[#B8945F] hover:bg-[#FAF3EC]/50 transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 group shadow-2xs"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-serif-luxury text-base text-[#292522] group-hover:text-[#B8945F] transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#B8945F]">({realCount})</span>
                  </div>
                  <span className="text-[10px] text-[#756B63] font-light leading-tight">
                    {m.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. BESPOKE SCENT ATELIER BANNER CALLOUT */}
      <section className="py-16 bg-[#FFFDF9] border-b border-[#E8DDD2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs text-[#B8945F] text-[11px] uppercase tracking-[0.25em] font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Unsure which realm matches you?</span>
          </div>

          <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#292522] uppercase tracking-wide">
            LET OUR MASTER NOSES GUIDE YOUR JOURNEY
          </h3>

          <p className="text-sm text-[#756B63] font-light max-w-xl mx-auto leading-relaxed">
            Take our 60-second interactive fragrance consultation to discover your top 3 matching ELASIRS flacons based on mood, raw botanicals, and lifestyle occasions.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenQuiz}
              className="px-8 py-3.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-xs hover:bg-[#B8945F] transition-colors shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
              <span>START FRAGRANCE QUIZ</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
