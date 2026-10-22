import React, { useState, useMemo } from 'react';
import { Product, FragranceFamily } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, X, RotateCcw, Check, Star } from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  initialCategory?: string;
  onSelectProduct: (productId: string) => void;
  onQuickView: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  initialCategory,
  onSelectProduct,
  onQuickView,
}) => {
  const [selectedFamily, setSelectedFamily] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'recommended' | 'bestselling' | 'newest' | 'price-asc' | 'price-desc' | 'rating'
  >('recommended');
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('All');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const families = ['All', 'Floral', 'Woody', 'Fresh', 'Oriental', 'Musky', 'Gourmand'];
  const sizes = ['All', '50ml', '100ml', '10ml Travel'];
  const occasions = ['All', 'Signature Daily', 'Evening Events', 'Special Occasions', 'High Summer Days'];
  const intensities = ['All', 'Eau de Parfum', 'Extrait de Parfum'];

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Family filter
    if (selectedFamily !== 'All') {
      result = result.filter(p => p.family.toLowerCase() === selectedFamily.toLowerCase());
    }

    // Price filter
    result = result.filter(p => p.price <= maxPrice);

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Size filter
    if (selectedSize !== 'All') {
      result = result.filter(p => p.variants.some(v => v.size.toLowerCase().includes(selectedSize.toLowerCase())));
    }

    // Availability filter
    if (onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Occasion filter
    if (selectedOccasion !== 'All') {
      result = result.filter(p =>
        (p.occasions || []).some(occ => occ.toLowerCase().includes(selectedOccasion.toLowerCase()))
      );
    }

    // Intensity / Concentration filter
    if (selectedIntensity !== 'All') {
      result = result.filter(p => p.type.toLowerCase().includes(selectedIntensity.toLowerCase()));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.family.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.notes.top.some(n => n.toLowerCase().includes(q)) ||
          p.notes.heart.some(n => n.toLowerCase().includes(q)) ||
          p.notes.base.some(n => n.toLowerCase().includes(q))
      );
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
      case 'recommended':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
        break;
    }

    return result;
  }, [
    products,
    selectedFamily,
    maxPrice,
    minRating,
    selectedSize,
    onlyInStock,
    selectedOccasion,
    selectedIntensity,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedFamily('All');
    setSearchQuery('');
    setMaxPrice(7000);
    setMinRating(0);
    setSelectedSize('All');
    setOnlyInStock(false);
    setSelectedOccasion('All');
    setSelectedIntensity('All');
    setSortBy('recommended');
  };

  const hasActiveFilters =
    selectedFamily !== 'All' ||
    searchQuery !== '' ||
    maxPrice < 7000 ||
    minRating > 0 ||
    selectedSize !== 'All' ||
    onlyInStock ||
    selectedOccasion !== 'All' ||
    selectedIntensity !== 'All';

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 lg:py-16 text-[#292522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="border-b border-[#E8DDD2] pb-6 mb-8">
          <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
            Haute Parfumerie Boutique
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.06em] text-[#292522] uppercase">
            THE FRAGRANCE CATALOG
          </h1>
          <p className="mt-2 text-sm text-[#756B63] max-w-2xl font-light">
            Indulge in our spectrum of artisanal perfumes, crafted with Grasse raw botanicals, formulated for all-day elegance.
          </p>
        </div>

        {/* Top Controls Bar: Search, Category Buttons, Sort Dropdown */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-[#E8DDD2]">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#B8945F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by notes (Bergamot, Amber) or perfume name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DDD2] text-xs text-[#292522] placeholder-[#756B63]/60 outline-none focus:border-[#292522] transition-colors rounded-xs shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756B63] hover:text-[#292522] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Category Filter Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs">
            {families.map(fam => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase transition-colors cursor-pointer rounded-xs ${
                  selectedFamily === fam
                    ? 'bg-[#292522] text-white shadow-xs'
                    : 'text-[#756B63] hover:text-[#292522]'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>

          {/* Mobile Filter toggle + Sort dropdown */}
          <div className="flex items-center justify-between lg:justify-end gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#E8DDD2] text-xs font-semibold text-[#292522] rounded-xs shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B8945F]" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#756B63] uppercase tracking-wider hidden sm:inline font-medium">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-white border border-[#E8DDD2] text-xs text-[#292522] px-3 py-2.5 outline-none focus:border-[#292522] tracking-wider cursor-pointer rounded-xs shadow-xs"
              >
                <option value="recommended">Recommended</option>
                <option value="bestselling">Bestselling</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Extended Filters Strip (Desktop & Mobile expanded) */}
        {mobileFilterOpen && (
          <div className="p-6 my-6 bg-[#FAF3EC] border border-[#E8DDD2] rounded-sm space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
              <h3 className="font-serif-luxury text-xl text-[#292522]">Refine Fragrances</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-xs text-[#756B63] hover:text-[#292522] flex items-center gap-1 cursor-pointer font-semibold"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              {/* Fragrance Family */}
              <div>
                <span className="block uppercase tracking-wider font-semibold text-[#756B63] mb-2">
                  Fragrance Family
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {families.map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFamily(f)}
                      className={`px-2.5 py-1 text-[11px] uppercase rounded-xs border cursor-pointer ${
                        selectedFamily === f
                          ? 'bg-[#292522] text-white border-[#292522]'
                          : 'bg-white text-[#756B63] border-[#E8DDD2]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity / Concentration */}
              <div>
                <span className="block uppercase tracking-wider font-semibold text-[#756B63] mb-2">
                  Intensity
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {intensities.map(inte => (
                    <button
                      key={inte}
                      onClick={() => setSelectedIntensity(inte)}
                      className={`px-2.5 py-1 text-[11px] uppercase rounded-xs border cursor-pointer ${
                        selectedIntensity === inte
                          ? 'bg-[#292522] text-white border-[#292522]'
                          : 'bg-white text-[#756B63] border-[#E8DDD2]'
                      }`}
                    >
                      {inte}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presentation Size */}
              <div>
                <span className="block uppercase tracking-wider font-semibold text-[#756B63] mb-2">
                  Flacon Size
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-2.5 py-1 text-[11px] uppercase rounded-xs border cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#292522] text-white border-[#292522]'
                          : 'bg-white text-[#756B63] border-[#E8DDD2]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating & Availability */}
              <div>
                <span className="block uppercase tracking-wider font-semibold text-[#756B63] mb-2">
                  Rating & Stock
                </span>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {[0, 4.8, 4.9].map(r => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`px-2.5 py-1 text-[11px] rounded-xs border cursor-pointer ${
                          minRating === r
                            ? 'bg-[#292522] text-white border-[#292522]'
                            : 'bg-white text-[#756B63] border-[#E8DDD2]'
                        }`}
                      >
                        {r === 0 ? 'All Ratings' : `${r}+ Stars`}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-[#292522] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={e => setOnlyInStock(e.target.checked)}
                      className="accent-[#292522]"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Occasions strip */}
            <div className="pt-3 border-t border-[#E8DDD2] flex flex-wrap items-center gap-2">
              <span className="text-[#756B63] uppercase tracking-wider text-[11px] font-semibold mr-2">
                Occasion:
              </span>
              {occasions.map(occ => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-3 py-1 text-[11px] rounded-xs border cursor-pointer ${
                    selectedOccasion === occ
                      ? 'bg-[#292522] text-white border-[#292522]'
                      : 'bg-white text-[#756B63] border-[#E8DDD2]'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Slider Bar & Active Filter Chips */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#756B63] uppercase tracking-wider font-medium">Max Price:</span>
            <input
              type="range"
              min="2500"
              max="7000"
              step="100"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-32 sm:w-44 accent-[#292522] cursor-pointer"
            />
            <span className="text-[#292522] font-semibold tabular-nums">
              ₹{maxPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#756B63]">
              Showing <strong className="text-[#292522] tabular-nums">{filteredProducts.length}</strong> creations
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#B8945F] hover:underline cursor-pointer font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Applied Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-4">
            <span className="text-[11px] uppercase tracking-wider text-[#756B63] font-semibold mr-1">
              Active Filters:
            </span>
            {selectedFamily !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>Family: {selectedFamily}</span>
                <button onClick={() => setSelectedFamily('All')} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>Query: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSize !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>Size: {selectedSize}</span>
                <button onClick={() => setSelectedSize('All')} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedOccasion !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>Occasion: {selectedOccasion}</span>
                <button onClick={() => setSelectedOccasion('All')} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>In Stock Only</span>
                <button onClick={() => setOnlyInStock(false)} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {maxPrice < 7000 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>Under ₹{maxPrice.toLocaleString('en-IN')}</span>
                <button onClick={() => setMaxPrice(7000)} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E8DDD2] text-xs text-[#292522] rounded-xs shadow-2xs">
                <span>{minRating}+ Stars</span>
                <button onClick={() => setMinRating(0)} className="text-[#756B63] hover:text-[#292522] cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#E8DDD2] p-8 my-8 rounded-sm shadow-xs">
            <p className="font-serif-luxury text-2xl text-[#292522]">
              No fragrances meet your filter criteria
            </p>
            <p className="mt-2 text-xs text-[#756B63] max-w-sm mx-auto font-light">
              Try adjusting your price threshold or clearing some filters to explore our creations.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#B8945F] transition-colors cursor-pointer rounded-xs"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-4">
            {filteredProducts.map(product => (
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
};
