import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, productId?: string) => void;
  products: Product[];
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, products }) => {
  const { totalItems, openCart, addToCart } = useCart();
  const { wishlist, user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
    { label: 'Collections', view: 'collections' },
    { label: 'Create Your Signature Scent', view: 'bespoke-scent' },
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' },
  ];

  // Filtered search results
  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes.top.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.notes.heart.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.notes.base.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#FAF3EC] border-b border-[#E8DDD2] text-[#756B63] text-[11px] tracking-[0.16em] uppercase py-2 text-center font-medium">
        <span>Complimentary luxury travel flacon & bespoke sample with orders above ₹4,000</span>
      </div>

      {/* Main Sticky Header with subtle transition */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DDD2] shadow-xs py-3.5'
            : 'bg-[#FFFDF9] border-b border-[#E8DDD2]/80 py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-[#292522] hover:text-[#B8945F] transition-colors cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Wordmark Logo */}
          <div className="flex-1 md:flex-none text-center md:text-left">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl sm:text-3xl font-serif-luxury font-normal tracking-[0.25em] text-[#292522] hover:text-[#B8945F] transition-colors uppercase inline-block cursor-pointer"
            >
              ELASIRS
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.view)}
                className={`text-[11px] lg:text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-200 relative py-1 cursor-pointer ${
                  currentView === link.view
                    ? 'text-[#B8945F]'
                    : 'text-[#756B63] hover:text-[#292522]'
                }`}
              >
                {link.label}
                {currentView === link.view && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#B8945F]" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#292522] hover:text-[#B8945F] transition-colors cursor-pointer"
              aria-label="Search fragrances"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-[#292522] hover:text-[#B8945F] transition-colors relative cursor-pointer"
              aria-label="View Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#292522] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account / Sign In */}
            <button
              onClick={() => onNavigate('account')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[#292522] hover:text-[#B8945F] hover:bg-[#FAF3EC] border border-[#E8DDD2] transition-colors relative cursor-pointer rounded-xs"
              aria-label={user ? `Account (${user.name})` : 'Account / Sign In'}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8945F]" />
              <span className="text-[11px] font-semibold tracking-wider uppercase">
                {user ? (user.name.split(' ')[0] || 'Account') : 'Sign In'}
              </span>
              {user && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" title="Signed In" />
              )}
            </button>

            {/* Shopping Bag / Cart */}
            <button
              onClick={openCart}
              className="p-2 text-[#292522] hover:text-[#B8945F] transition-colors relative cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#292522] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#292522]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#FFFDF9] border-r border-[#E8DDD2] p-6 flex flex-col justify-between h-full z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#E8DDD2]">
                <span className="font-serif-luxury text-xl tracking-[0.2em] text-[#292522]">
                  ELASIRS
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#756B63] hover:text-[#292522]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="mt-6 flex flex-col gap-4">
                {navLinks.map(link => (
                  <button
                    key={link.label}
                    onClick={() => {
                      onNavigate(link.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left text-sm uppercase tracking-[0.2em] font-semibold transition-colors py-1 ${
                      currentView === link.view
                        ? 'text-[#B8945F]'
                        : 'text-[#756B63] hover:text-[#292522]'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-[#E8DDD2] flex flex-col gap-3.5">
                <button
                  onClick={() => {
                    onNavigate('account');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs uppercase tracking-wider text-[#756B63] hover:text-[#292522] flex items-center gap-2 font-medium"
                >
                  <User className="w-4 h-4 text-[#B8945F]" />
                  <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('wishlist');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs uppercase tracking-wider text-[#756B63] hover:text-[#292522] flex items-center gap-2 font-medium"
                >
                  <Heart className="w-4 h-4 text-[#B8945F]" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8DDD2] text-[11px] text-[#756B63]">
              <p>Maison ELASIRS · Haute Parfumerie</p>
              <p className="mt-0.5 text-[#B8945F]">concierge@elasirs.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Luxury Search Overlay with Live Suggestions & Quick Add to Cart */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#292522]/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-[#E8DDD2] shadow-2xl p-6 sm:p-8 rounded-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD2]">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold">
                Search Collections & Notes
              </span>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#756B63] hover:text-[#292522] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 border-b border-[#E8DDD2] pb-3">
              <Search className="w-5 h-5 text-[#B8945F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by perfume name, notes (Bergamot, Jasmine), or family..."
                autoFocus
                className="w-full bg-transparent text-sm sm:text-base text-[#292522] placeholder-[#756B63]/60 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#756B63] hover:text-[#292522] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Preview */}
            <div className="mt-6 max-h-80 overflow-y-auto space-y-3">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-xs text-[#756B63]">
                  <p className="font-semibold text-[#292522] mb-1">Discover by Popular Olfactory Notes:</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {['Bergamot', 'Sandalwood', 'Damask Rose', 'Oudh', 'Amber', 'Citrus', 'Vanilla'].map(note => (
                      <button
                        key={note}
                        onClick={() => setSearchQuery(note)}
                        className="px-2.5 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] text-[11px] rounded-xs cursor-pointer"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#756B63] space-y-3">
                  <p className="font-serif-luxury text-base font-normal text-[#292522]">No fragrance found for "{searchQuery}".</p>
                  <p className="text-xs text-[#756B63]">Try Floral, Woody, Fresh, or Gourmand:</p>
                  <div className="flex flex-wrap gap-2 justify-center pt-1">
                    {['Floral', 'Woody', 'Fresh', 'Gourmand', 'Oriental', 'Musky'].map(family => (
                      <button
                        key={family}
                        onClick={() => setSearchQuery(family)}
                        className="px-3 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] text-xs rounded-xs cursor-pointer font-medium"
                      >
                        {family}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onNavigate('product-detail', prod.id);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-3 hover:bg-[#FAF3EC] transition-colors cursor-pointer border-b border-[#E8DDD2]/60 last:border-0 rounded-xs"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-12 h-14 object-contain bg-[#FAF3EC] p-1 border border-[#E8DDD2] rounded-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-luxury text-base text-[#292522] truncate">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#756B63] mt-0.5">
                        <span className="text-[#B8945F] font-semibold uppercase">{prod.family}</span>
                        <span>·</span>
                        <div className="flex items-center text-[#B8945F]">
                          <Star className="w-3 h-3 fill-[#B8945F]" />
                          <span className="ml-1 text-[#292522] font-semibold">{prod.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#292522] tabular-nums">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod, prod.variants[0]?.size || '50ml');
                          showToast(`${prod.name} added to bag`, 'success');
                        }}
                        className="p-1.5 bg-[#292522] text-white hover:bg-[#B8945F] rounded-xs transition-colors cursor-pointer"
                        title="Add to cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
