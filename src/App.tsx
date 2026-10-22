import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, Order, Review } from './types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS } from './data/initialData';

// Layout & Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollection } from './components/FeaturedCollection';
import { ProductCategories } from './components/ProductCategories';
import { FeaturedProduct } from './components/FeaturedProduct';
import { BrandStory } from './components/BrandStory';
import { FragranceFinder } from './components/FragranceFinder';
import { Testimonials } from './components/Testimonials';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { ConciergeChat } from './components/ConciergeChat';
import { CreateSignatureScentSection } from './components/CreateSignatureScentSection';
import { EverydayAccessibleSection } from './components/EverydayAccessibleSection';
import { NewArrivalsSection } from './components/NewArrivalsSection';
import { AccessibleDiscoverySection } from './components/AccessibleDiscoverySection';
import { WhyElasirsSection } from './components/WhyElasirsSection';
import { HomeFAQSection } from './components/HomeFAQSection';
import { AnnouncementRibbon } from './components/AnnouncementRibbon';

// Pages
import { ShopPage } from './pages/ShopPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { BrandStoryPage } from './pages/BrandStoryPage';
import { JournalPage } from './pages/JournalPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { BespokeScentPage } from './pages/BespokeScentPage';
import { FragranceQuizModal } from './components/FragranceQuizModal';

function MainApp() {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        return 'admin';
      }
      if (window.location.pathname === '/collections' || window.location.hash === '#collections') {
        return 'collections';
      }
    }
    return 'home';
  });
  const [selectedProductId, setSelectedProductId] = useState<string>('elasirs-01');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Core Data
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Load from API or fallback
  const fetchData = async () => {
    try {
      const [prodRes, ordRes, revRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/orders').catch(() => null),
        fetch('/api/reviews').catch(() => null),
      ]);

      if (prodRes && prodRes.ok) {
        const pData = await prodRes.json();
        if (pData.success && pData.data) setProducts(pData.data);
      }
      if (ordRes && ordRes.ok) {
        const oData = await ordRes.json();
        if (oData.success && oData.data) setOrders(oData.data);
      }
      if (revRes && revRes.ok) {
        const rData = await revRes.json();
        if (rData.success && rData.data) setReviews(rData.data);
      }
    } catch {
      // Keep initial data if API call fails
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL changes & popstate
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.pathname === '/collections' || window.location.hash === '#collections') {
        setCurrentView('collections');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProductId, selectedCollectionId]);

  const handleNavigate = (view: string, targetIdOrCategory?: string) => {
    if (view === 'product-detail' && targetIdOrCategory) {
      setSelectedProductId(targetIdOrCategory);
    } else if (view === 'shop' && targetIdOrCategory) {
      setSelectedCategoryFilter(targetIdOrCategory);
    } else if (view === 'collections') {
      setSelectedCollectionId(targetIdOrCategory || 'all');
      if (window.location.pathname !== '/collections') {
        window.history.pushState(null, '', '/collections');
      }
    }

    if (view === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else if (view !== 'collections' && (currentView === 'admin' || currentView === 'collections')) {
      window.history.pushState(null, '', '/');
    }

    setCurrentView(view);
  };

  const handleReviewSubmit = async (reviewData: {
    productId: string;
    customerName: string;
    rating: number;
    title: string;
    comment: string;
  }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReviews(prev => [data.data, ...prev]);
        fetchData();
      }
    } catch {
      // Local fallback
      const localRev: Review = {
        id: `rev-${Date.now()}`,
        productId: reviewData.productId,
        productName: products.find(p => p.id === reviewData.productId)?.name || 'ELASIRS Fragrance',
        customerName: reviewData.customerName,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        date: new Date().toISOString().split('T')[0],
        verified: true,
        approved: true,
      };
      setReviews(prev => [localRev, ...prev]);
    }
  };

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const signatureProduct = products.find(p => p.id === 'elasirs-01') || products[0];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#292522] flex flex-col font-sans selection:bg-[#B8945F] selection:text-white">
      {/* Top Header - Hidden in dedicated admin workspace */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          products={products}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            {/* 1. HERO */}
            <Hero
              onShopClick={() => handleNavigate('shop')}
              onDiscoverClick={() => handleNavigate('about')}
              onBespokeClick={() => handleNavigate('bespoke-scent')}
            />

            {/* 2. BESTSELLERS */}
            <FeaturedCollection
              products={products}
              onSelectProduct={id => handleNavigate('product-detail', id)}
              onQuickView={prod => setQuickViewProduct(prod)}
              onViewAll={() => handleNavigate('shop')}
            />

            {/* 3. SHOP BY FRAGRANCE FAMILY */}
            <ProductCategories
              onSelectCategory={family => {
                handleNavigate('collections', family.toLowerCase());
              }}
            />

            {/* 4. NEW ARRIVALS */}
            <NewArrivalsSection
              products={products}
              onSelectProduct={id => handleNavigate('product-detail', id)}
              onQuickView={prod => setQuickViewProduct(prod)}
              onViewAll={() => handleNavigate('shop')}
            />

            {/* 5. EVERYDAY / ACCESSIBLE LUXURY COLLECTION */}
            <EverydayAccessibleSection
              products={products}
              onSelectProduct={id => handleNavigate('product-detail', id)}
              onQuickView={prod => setQuickViewProduct(prod)}
              onViewAll={() => handleNavigate('shop')}
              onExploreCollection={tier => handleNavigate('collections', tier)}
            />

            {/* 6. CREATE YOUR SIGNATURE SCENT */}
            <CreateSignatureScentSection
              onCreatePerfume={() => handleNavigate('bespoke-scent')}
            />

            {/* 7. WHY ELASIRS */}
            <WhyElasirsSection />

            {/* 8. CUSTOMER REVIEWS */}
            <Testimonials reviews={reviews} />

            {/* 9. ABOUT ELASIRS */}
            <BrandStory onLearnMore={() => handleNavigate('about')} />

            {/* 10. FAQ */}
            <HomeFAQSection onViewAllFAQ={() => handleNavigate('faq')} />

            {/* 11. NEWSLETTER */}
            <Newsletter />
          </>
        )}

        {/* Collections Page */}
        {currentView === 'collections' && (
          <CollectionsPage
            products={products}
            activeCollectionId={selectedCollectionId}
            onSelectCollection={colId => setSelectedCollectionId(colId)}
            onSelectProduct={id => handleNavigate('product-detail', id)}
            onQuickView={prod => setQuickViewProduct(prod)}
            onNavigateShop={() => handleNavigate('shop')}
            onOpenQuiz={() => setIsQuizOpen(true)}
          />
        )}

        {/* 10. Shop Page */}
        {currentView === 'shop' && (
          <ShopPage
            products={products}
            initialCategory={selectedCategoryFilter}
            onSelectProduct={id => handleNavigate('product-detail', id)}
            onQuickView={prod => setQuickViewProduct(prod)}
          />
        )}

        {/* 11. Product Detail Page */}
        {currentView === 'product-detail' && currentProduct && (
          <ProductDetailPage
            product={currentProduct}
            allProducts={products}
            allReviews={reviews}
            onBack={() => handleNavigate('shop')}
            onSelectProduct={id => handleNavigate('product-detail', id)}
            onCheckoutDirect={() => handleNavigate('checkout')}
            onReviewSubmit={handleReviewSubmit}
          />
        )}

        {/* 13. Checkout Page */}
        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToShop={() => handleNavigate('shop')}
            onOrderPlaced={order => {
              setOrders(prev => [order, ...prev]);
            }}
            onNavigateOrders={() => handleNavigate('account')}
          />
        )}

        {/* 14. User Account & Wishlist */}
        {(currentView === 'account' || currentView === 'wishlist') && (
          <AccountPage
            products={products}
            orders={orders}
            onSelectProduct={id => handleNavigate('product-detail', id)}
            onNavigateShop={() => handleNavigate('shop')}
          />
        )}

        {/* About / Story Page */}
        {currentView === 'about' && (
          <BrandStoryPage onBackToShop={() => handleNavigate('shop')} />
        )}

        {/* Journal Page */}
        {currentView === 'journal' && (
          <JournalPage
            onBackToShop={() => handleNavigate('shop')}
            onSelectProduct={id => handleNavigate('product-detail', id)}
          />
        )}

        {/* Contact Page */}
        {currentView === 'contact' && (
          <ContactPage onBackToShop={() => handleNavigate('shop')} />
        )}

        {/* Dedicated FAQ Page */}
        {currentView === 'faq' && (
          <FAQPage
            onBackToShop={() => handleNavigate('shop')}
            onContactConcierge={() => handleNavigate('contact')}
          />
        )}

        {/* Create Your Signature Scent Customization Page */}
        {(currentView === 'bespoke-scent' || currentView === 'signature-scent') && (
          <BespokeScentPage
            onBack={() => handleNavigate('home')}
            onExploreShop={() => handleNavigate('shop')}
            onCheckoutDirect={() => handleNavigate('checkout')}
          />
        )}

        {/* 15. Admin Dashboard */}
        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            reviews={reviews}
            onRefreshData={fetchData}
            onSelectProduct={id => handleNavigate('product-detail', id)}
            onViewStorefront={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onExplore={() => handleNavigate('shop')}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFull={id => {
          setQuickViewProduct(null);
          handleNavigate('product-detail', id);
        }}
      />

      {/* Fragrance Discovery 8-Step Quiz Modal */}
      <FragranceQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        products={products}
        onSelectProduct={id => handleNavigate('product-detail', id)}
      />

      {/* Floating AI Fragrance Concierge - Hidden in admin */}
      {currentView !== 'admin' && (
        <ConciergeChat
          onNavigateProduct={id => handleNavigate('product-detail', id)}
          onNavigateShop={() => handleNavigate('shop')}
          onNavigateStory={() => handleNavigate('about')}
        />
      )}

      {/* Announcement Ribbon directly above Footer on customer pages */}
      {currentView !== 'admin' && (
        <AnnouncementRibbon
          onNavigateAction={action => {
            if (action === 'quiz') {
              setIsQuizOpen(true);
            } else if (action === 'bespoke-scent') {
              handleNavigate('bespoke-scent');
            } else if (action === 'collections') {
              handleNavigate('collections');
            } else if (action === 'faq') {
              handleNavigate('faq');
            } else if (action === 'shop') {
              handleNavigate('shop');
            }
          }}
        />
      )}

      {/* Footer - Hidden in admin */}
      {currentView !== 'admin' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
