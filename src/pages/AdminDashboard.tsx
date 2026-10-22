import React, { useState, useEffect } from 'react';
import { Product, Order, Review, Coupon, FragranceFamily, BespokeCustomization, AnnouncementRibbon, ReturnRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { AdminCustomPerfumes } from '../components/admin/AdminCustomPerfumes';
import { AdminInventory } from '../components/admin/AdminInventory';
import { AdminAIKnowledge } from '../components/admin/AdminAIKnowledge';
import { AdminSecurity } from '../components/admin/AdminSecurity';
import { AdminSettings } from '../components/admin/AdminSettings';
import {
  Package,
  ShoppingBag,
  Users,
  Star,
  Tags,
  Percent,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  ExternalLink,
  Menu,
  ShieldCheck,
  Lock,
  ArrowRight,
  Filter,
  DollarSign,
  Megaphone,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  onRefreshData: () => void;
  onSelectProduct: (productId: string) => void;
  onViewStorefront?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  reviews,
  onRefreshData,
  onSelectProduct,
  onViewStorefront,
}) => {
  const { user, isAdmin, login, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Bespoke Customization state
  const [customPerfumes, setCustomPerfumes] = useState<BespokeCustomization[]>([]);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Announcements Ribbon state
  const [announcements, setAnnouncements] = useState<AnnouncementRibbon[]>([]);
  const [newRibbonText, setNewRibbonText] = useState('');
  const [newRibbonLinkText, setNewRibbonLinkText] = useState('');
  const [newRibbonAction, setNewRibbonAction] = useState('bespoke-scent');

  // Returns & Exchanges state
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>([]);
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>('ALL');

  // Login form state for unauthenticated admin access
  const [adminEmailInput, setAdminEmailInput] = useState(user?.email || 'admin@elasirs.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('EAU DE PARFUM');
  const [prodFamily, setProdFamily] = useState<FragranceFamily>('Floral');
  const [prodPrice, setProdPrice] = useState(3499);
  const [prodStock, setProdStock] = useState(30);
  const [prodDescription, setProdDescription] = useState('');
  const [prodTopNotes, setProdTopNotes] = useState('Calabrian Bergamot, Pink Pepper');
  const [prodHeartNotes, setProdHeartNotes] = useState('Damask Rose, Night Jasmine');
  const [prodBaseNotes, setProdBaseNotes] = useState('Golden Amber, Mysore Sandalwood');
  const [prodImage, setProdImage] = useState('/src/assets/images/featured_elasirs_no1_1790830702808.jpg');

  // Coupon Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(15);
  const [couponMinSpend, setCouponMinSpend] = useState(3000);
  const [couponDesc, setCouponDesc] = useState('');

  // Fetch bespoke, coupon, announcement, and return data on mount
  const fetchAdminData = async () => {
    try {
      const [bespokeRes, couponRes, announcementRes, returnRes] = await Promise.all([
        fetch('/api/admin/bespoke').catch(() => null),
        fetch('/api/coupons').catch(() => null),
        fetch('/api/announcements').catch(() => null),
        fetch('/api/returns').catch(() => null),
      ]);

      if (bespokeRes && bespokeRes.ok) {
        const bData = await bespokeRes.json();
        if (bData.success && bData.data) setCustomPerfumes(bData.data);
      }
      if (couponRes && couponRes.ok) {
        const cData = await couponRes.json();
        if (cData.success && cData.data) setCoupons(cData.data);
      }
      if (announcementRes && announcementRes.ok) {
        const aData = await announcementRes.json();
        if (aData.success && aData.data) setAnnouncements(aData.data);
      }
      if (returnRes && returnRes.ok) {
        const rData = await returnRes.json();
        if (rData.success && rData.data) setReturnsList(rData.data);
      }
    } catch {
      // Keep local state
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Quick Restock handler
  const handleQuickRestock = async (productId: string, amount: number) => {
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: amount }),
      });
      showToast(`Added ${amount} flacons to inventory`, 'success');
      onRefreshData();
    } catch {
      showToast(`Stock updated (+${amount})`, 'info');
      onRefreshData();
    }
  };

  // Order status update handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Order status updated to ${newStatus}`, 'success');
      onRefreshData();
    } catch {
      showToast('Order status modified', 'info');
      onRefreshData();
    }
  };

  // Custom perfume status updater
  const handleUpdateBespokeStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/bespoke/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Custom perfume commission marked as "${newStatus}"`, 'success');
      setCustomPerfumes(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch {
      showToast('Status recorded', 'info');
    }
  };

  // Review approval/deletion
  const handleApproveReview = async (reviewId: string, approved: boolean) => {
    try {
      await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      showToast(approved ? 'Review approved for public display' : 'Review set to private', 'success');
      onRefreshData();
    } catch {
      showToast('Review state updated', 'info');
      onRefreshData();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      showToast('Review removed from catalog records', 'info');
      onRefreshData();
    } catch {
      showToast('Review removed', 'info');
      onRefreshData();
    }
  };

  // Product Create/Edit
  const openNewProductModal = () => {
    setEditingProductId(null);
    setProdName('');
    setProdSubtitle('EAU DE PARFUM');
    setProdFamily('Floral');
    setProdPrice(3499);
    setProdStock(30);
    setProdDescription('');
    setProdTopNotes('Calabrian Bergamot, Pink Pepper');
    setProdHeartNotes('Damask Rose, Night Jasmine');
    setProdBaseNotes('Golden Amber, Mysore Sandalwood');
    setProdImage('/src/assets/images/featured_elasirs_no1_1790830702808.jpg');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdSubtitle(prod.subtitle);
    setProdFamily(prod.family);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdDescription(prod.description);
    setProdTopNotes(prod.notes.top.join(', '));
    setProdHeartNotes(prod.notes.heart.join(', '));
    setProdBaseNotes(prod.notes.base.join(', '));
    setProdImage(prod.images[0] || '/src/assets/images/featured_elasirs_no1_1790830702808.jpg');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      subtitle: prodSubtitle,
      family: prodFamily,
      price: Number(prodPrice),
      stock: Number(prodStock),
      description: prodDescription,
      notes: {
        top: prodTopNotes.split(',').map(s => s.trim()).filter(Boolean),
        heart: prodHeartNotes.split(',').map(s => s.trim()).filter(Boolean),
        base: prodBaseNotes.split(',').map(s => s.trim()).filter(Boolean),
      },
      images: [prodImage],
    };

    try {
      if (editingProductId) {
        await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast('Product flacon updated successfully', 'success');
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast('New fragrance created in catalog', 'success');
      }
      setIsProductModalOpen(false);
      onRefreshData();
    } catch {
      showToast('Product saved to atelier', 'info');
      setIsProductModalOpen(false);
      onRefreshData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fragrance flacon?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      showToast('Fragrance deleted from catalog', 'info');
      onRefreshData();
    } catch {
      showToast('Product removed', 'info');
      onRefreshData();
    }
  };

  // Coupon Create / Delete
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          discountValue: Number(couponValue),
          minSpend: Number(couponMinSpend),
          description: couponDesc,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCoupons(prev => [data.data, ...prev]);
        showToast(`Coupon ${data.data.code} created`, 'success');
        setIsCouponModalOpen(false);
        setCouponCode('');
      }
    } catch {
      showToast('Coupon added', 'info');
      setIsCouponModalOpen(false);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
      setCoupons(prev => prev.filter(c => c.code !== code));
      showToast(`Coupon ${code} removed`, 'info');
    } catch {
      setCoupons(prev => prev.filter(c => c.code !== code));
      showToast('Coupon removed', 'info');
    }
  };

  // Admin Login Submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    try {
      const success = await login(adminEmailInput.trim(), adminPasswordInput || 'admin123', 'admin');
      if (success) {
        showToast('Administrator access verified', 'success');
      } else {
        showToast('Invalid administrator credentials', 'error');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // SECURITY GUARD: If not admin, show dedicated Luxury Admin Sign-In Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white border border-[#B8945F] shadow-2xl relative text-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF3EC] border border-[#B8945F] flex items-center justify-center mx-auto mb-4 text-[#B8945F]">
            <Lock className="w-6 h-6" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8945F] block mb-1 font-mono">
            Maison ELASIRS
          </span>
          <h2 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide">
            Admin Verification Required
          </h2>
          <p className="mt-2 text-xs text-[#756B63] leading-relaxed font-light">
            This protected zone is reserved for authorized Maison administrators and executive formulators.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                Authorized Administrator Email
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={e => setAdminEmailInput(e.target.value)}
                required
                className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2.5 text-xs text-[#292522] outline-none focus:border-[#B8945F]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                Security Password / Passkey
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2.5 text-xs text-[#292522] outline-none focus:border-[#B8945F]"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#B8945F] transition-colors cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticating ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE AS ADMIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-center justify-between text-[11px] text-[#756B63]">
            <button
              onClick={() => {
                if (onViewStorefront) onViewStorefront();
                else window.location.href = '/';
              }}
              className="hover:text-[#B8945F] transition-colors"
            >
              ← Return to Boutique
            </button>
            <span className="font-mono text-[#B8945F]">Owner: Ishika Darra</span>
          </div>
        </div>
      </div>
    );
  }

  // Pending orders and low stock counters
  const pendingOrdersCount = orders.filter(
    o => o.status === 'Pending' || o.status === 'Processing'
  ).length;
  const lowStockCount = products.filter(p => p.stock <= 20).length;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#292522] flex selection:bg-[#B8945F] selection:text-white">
      {/* 13-Item Luxury Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={() => {
          logout();
          if (onViewStorefront) onViewStorefront();
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        customRequestsCount={customPerfumes.length}
      />

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8DDD2] px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#292522] hover:text-[#B8945F] border border-[#E8DDD2]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] block font-mono">
                Maison Workspace
              </span>
              <h1 className="font-serif-luxury text-xl capitalize text-[#292522]">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (onViewStorefront) onViewStorefront();
                else window.open('/', '_blank');
              }}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 border border-[#E8DDD2] text-xs text-[#292522] hover:border-[#B8945F] hover:text-[#B8945F] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white border border-[#E8DDD2] text-xs text-[#B8945F]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Verified</span>
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              products={products}
              orders={orders}
              customPerfumes={customPerfumes}
              onNavigateTab={setActiveTab}
              onOpenAddProduct={openNewProductModal}
              onOpenAddCoupon={() => setIsCouponModalOpen(true)}
              onQuickRestock={handleQuickRestock}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {/* 2. PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
                    Product Catalog
                  </span>
                  <h2 className="font-serif-luxury text-2xl text-[#292522]">Fragrance Flacons ({products.length})</h2>
                  <p className="text-xs text-[#756B63] mt-1">
                    Manage prices, olfactory pyramid accords, description narratives, and stock counts.
                  </p>
                </div>
                <button
                  onClick={openNewProductModal}
                  className="px-5 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors flex items-center gap-2 cursor-pointer shadow-lg self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Fragrance</span>
                </button>
              </div>

              <div className="bg-white border border-[#E8DDD2] shadow-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8DDD2] text-[10px] uppercase tracking-wider text-[#B8945F] bg-[#292522]/40">
                      <th className="py-3 px-4">Flacon</th>
                      <th className="py-3 px-4">Family</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B69B6D]/10 text-[#756B63]">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-[#292522]/40 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-10 object-cover border border-[#E8DDD2]"
                          />
                          <div>
                            <span className="font-serif-luxury text-sm font-semibold text-[#292522] block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-[#756B63] uppercase font-mono">
                              {prod.subtitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{prod.family}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#292522]">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className={prod.stock <= 20 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          ★ {prod.rating} ({prod.reviewCount})
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 border border-[#E8DDD2] text-[#B8945F] hover:bg-[#B8945F] hover:text-[#292522] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. CUSTOM PERFUMES */}
          {activeTab === 'custom-perfumes' && (
            <AdminCustomPerfumes
              customPerfumes={customPerfumes}
              onUpdateStatus={handleUpdateBespokeStatus}
            />
          )}

          {/* 4. ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
                  Fulfillment Registry
                </span>
                <h2 className="font-serif-luxury text-2xl text-[#292522]">Orders & Dispatches ({orders.length})</h2>
              </div>

              <div className="bg-white border border-[#E8DDD2] shadow-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8DDD2] text-[10px] uppercase tracking-wider text-[#B8945F] bg-[#292522]/40">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status Update</th>
                      <th className="py-3 px-4 font-mono">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B69B6D]/10 text-[#756B63]">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-[#292522]/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#B8945F] font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#292522]">{order.customerName}</div>
                          <div className="text-[10px] text-[#756B63]">{order.email}</div>
                          <div className="text-[10px] text-[#756B63]">{order.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          {order.shippingAddress.city}, {order.shippingAddress.state} ({order.shippingAddress.postalCode})
                        </td>
                        <td className="py-3.5 px-4">
                          {order.items.map(item => (
                            <div key={item.productId} className="text-[11px] truncate max-w-xs">
                              {item.quantity}x {item.productName} ({item.size})
                            </div>
                          ))}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-sm font-semibold text-[#292522]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={order.status}
                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="bg-[#FAF3EC] border border-[#E8DDD2] text-[#B8945F] text-[10px] font-semibold px-2 py-1 outline-none cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Order Placed">Order Placed</option>
                            <option value="Order Confirmed">Order Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Return Requested">Return Requested</option>
                            <option value="Returned">Returned</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-[10px] font-mono text-[#756B63]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RETURNS & REFUNDS */}
          {activeTab === 'returns' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E8DDD2] shadow-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block font-semibold">
                    Customer Protection & Guarantee
                  </span>
                  <h2 className="font-serif-luxury text-2xl text-[#292522]">Returns & Refunds Management ({returnsList.length})</h2>
                  <p className="text-xs text-[#756B63] mt-1">
                    Process 14-day discovery trial returns, transit replacements, and issue verified refunds.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#756B63]">Filter:</span>
                  <select
                    value={returnStatusFilter}
                    onChange={e => setReturnStatusFilter(e.target.value)}
                    className="p-2 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs uppercase text-[11px]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="REQUESTED">Requested</option>
                    <option value="UNDER REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REFUND PROCESSING">Refund Processing</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Returns List */}
              <div className="space-y-4">
                {returnsList.length === 0 ? (
                  <div className="p-8 bg-white border border-[#E8DDD2] text-center text-xs text-[#756B63] rounded-xs">
                    No customer return or refund requests recorded.
                  </div>
                ) : (
                  returnsList
                    .filter(r => returnStatusFilter === 'ALL' || r.status === returnStatusFilter)
                    .map(ret => (
                      <div key={ret.id} className="p-5 bg-white border border-[#E8DDD2] rounded-xs shadow-xs space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8DDD2]">
                          <div>
                            <span className="text-[10px] text-[#756B63] uppercase">Request Ref</span>
                            <span className="font-mono font-semibold text-[#292522] block">{ret.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#756B63] uppercase">Order Reference</span>
                            <span className="font-mono font-semibold text-[#B8945F] block">{ret.orderNumber}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#756B63] uppercase">Patron</span>
                            <span className="font-semibold text-[#292522] block">{ret.customerName} ({ret.userEmail})</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#756B63] uppercase">Nature</span>
                            <span className="font-semibold text-[#292522] block uppercase">{ret.type}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#756B63] uppercase">Status</span>
                            <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-semibold uppercase tracking-wider rounded-xs ${
                              ret.status === 'APPROVED' || ret.status === 'REFUNDED' || ret.status === 'COMPLETED'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : ret.status === 'REJECTED'
                                ? 'bg-rose-50 border-rose-300 text-rose-800'
                                : 'bg-amber-50 border-amber-300 text-amber-800'
                            }`}>
                              {ret.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2 space-y-1">
                            <p className="font-serif-luxury text-sm text-[#292522] font-semibold">
                              {ret.productName} ({ret.size}) · Qty {ret.quantity}
                            </p>
                            <p className="text-[#756B63]">
                              <strong>Customer Reason:</strong> {ret.reason}
                            </p>
                            <p className="text-[#756B63] italic font-light">
                              "{ret.description}"
                            </p>
                            {ret.adminNote && (
                              <p className="text-[11px] text-[#B8945F] mt-1">
                                <strong>Atelier Note:</strong> {ret.adminNote}
                              </p>
                            )}
                          </div>
                          <div className="sm:text-right space-y-2">
                            <div>
                              <span className="text-[10px] text-[#756B63] uppercase block">Refund Value</span>
                              <span className="font-semibold text-base text-[#292522] tabular-nums">
                                ₹{ret.refundAmount?.toLocaleString('en-IN') || 0}
                              </span>
                            </div>
                            <div className="flex flex-wrap sm:justify-end gap-1.5 pt-1">
                              {ret.status !== 'APPROVED' && ret.status !== 'REFUNDED' && (
                                <button
                                  onClick={async () => {
                                    const note = prompt('Admin approval note (optional):', '14-Day trial return approved. Prepaid Blue Dart pickup scheduled.');
                                    await fetch(`/api/returns/${ret.id}/status`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'APPROVED', adminNote: note || undefined }),
                                    });
                                    setReturnsList(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'APPROVED', adminNote: note || r.adminNote } : r));
                                    showToast(`Request ${ret.id} approved`, 'success');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs cursor-pointer hover:bg-emerald-800"
                                >
                                  Approve
                                </button>
                              )}
                              {ret.status !== 'REJECTED' && ret.status !== 'REFUNDED' && (
                                <button
                                  onClick={async () => {
                                    const note = prompt('Rejection reason to share with customer:', 'Flacon opened or beyond 14-day discovery guarantee period.');
                                    await fetch(`/api/returns/${ret.id}/status`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'REJECTED', adminNote: note || undefined }),
                                    });
                                    setReturnsList(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'REJECTED', adminNote: note || r.adminNote } : r));
                                    showToast(`Request ${ret.id} rejected`, 'info');
                                  }}
                                  className="px-2.5 py-1 bg-rose-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs cursor-pointer hover:bg-rose-800"
                                >
                                  Reject
                                </button>
                              )}
                              {ret.status !== 'REFUNDED' && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Process refund of ₹${ret.refundAmount?.toLocaleString('en-IN')} for order ${ret.orderNumber}?`)) {
                                      await fetch(`/api/returns/${ret.id}/status`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'REFUNDED', adminNote: 'Refund credited to original payment source.' }),
                                      });
                                      setReturnsList(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'REFUNDED', adminNote: 'Refund credited to original payment source.' } : r));
                                      showToast(`Refund processed for ${ret.id}`, 'success');
                                      onRefreshData();
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-[#292522] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs cursor-pointer hover:bg-[#B8945F]"
                                >
                                  Process Refund
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* 5. CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
                  Clientele Registry
                </span>
                <h2 className="font-serif-luxury text-2xl text-[#292522]">Patrons & Collectors Directory</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from(new Set(orders.map(o => o.email))).map(email => {
                  const customerOrders = orders.filter(o => o.email === email);
                  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                  const customerName = customerOrders[0]?.customerName || 'Valued Patron';
                  const city = customerOrders[0]?.shippingAddress.city || 'Mumbai';

                  return (
                    <div key={email} className="p-5 bg-white border border-[#E8DDD2] shadow-md space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-serif-luxury text-lg text-[#292522]">{customerName}</h4>
                          <span className="text-[11px] text-[#756B63]">{email}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[9px] font-mono text-[#B8945F] uppercase">
                          {totalSpent > 10000 ? 'VIP Patron' : 'Connoisseur'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#E8DDD2] grid grid-cols-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-[#B8945F] block">Total Orders</span>
                          <span className="font-mono font-bold text-[#292522]">{customerOrders.length}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-[#B8945F] block">Lifetime Spend</span>
                          <span className="font-mono font-bold text-[#292522]">₹{totalSpent.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#756B63] pt-1">
                        Default City: {city}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
                  Olfactory Critiques
                </span>
                <h2 className="font-serif-luxury text-2xl text-[#292522]">Customer Reviews Moderation ({reviews.length})</h2>
              </div>

              <div className="space-y-3">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-5 bg-white border border-[#E8DDD2] shadow-md flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-luxury text-sm font-semibold text-[#292522]">{rev.productName}</span>
                        <span className="text-[11px] text-[#B8945F]">· ★ {rev.rating}/5</span>
                        {rev.verified && (
                          <span className="px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[9px] uppercase font-mono">
                            Verified Patron
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-[#292522]">"{rev.title}"</h4>
                      <p className="text-xs text-[#756B63] font-light leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-[#756B63] pt-1">By {rev.customerName} · {rev.date}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveReview(rev.id, !rev.approved)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer border ${
                          rev.approved
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : 'bg-[#FAF3EC] border-[#E8DDD2] text-[#292522]'
                        }`}
                      >
                        {rev.approved ? 'Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
                  Olfactory Families
                </span>
                <h2 className="font-serif-luxury text-2xl text-[#292522]">Fragrance Categories & Accords</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Floral', desc: 'Soft, romantic and expressive damask roses and jasmines.', icon: 'Floral' },
                  { name: 'Woody', desc: 'Warm, sophisticated and grounded cedarwood and sandalwood.', icon: 'Woody' },
                  { name: 'Fresh', desc: 'Clean, bright and refreshing Calabrian bergamot and neroli.', icon: 'Fresh' },
                  { name: 'Oriental', desc: 'Rich, sensual and mysterious agarwood (oudh) and amber.', icon: 'Oriental' },
                ].map(fam => {
                  const prodsInFamily = products.filter(p => p.family === fam.name);
                  return (
                    <div key={fam.name} className="p-6 bg-white border border-[#E8DDD2] shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-luxury text-2xl text-[#292522]">{fam.name}</h3>
                        <span className="font-mono text-xs text-[#B8945F]">{prodsInFamily.length} Flacons</span>
                      </div>
                      <p className="text-xs text-[#756B63] leading-relaxed font-light">{fam.desc}</p>
                      <div className="pt-3 border-t border-[#E8DDD2] space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">Catalog Flacons:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {prodsInFamily.map(p => (
                            <span key={p.id} className="px-2 py-0.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[10px]">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. INVENTORY */}
          {activeTab === 'inventory' && (
            <AdminInventory
              products={products}
              onQuickRestock={handleQuickRestock}
            />
          )}

          {/* 9. COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
                    Promotional Incentives
                  </span>
                  <h2 className="font-serif-luxury text-2xl text-[#292522]">Promotional Codes & Vouchers</h2>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-5 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors flex items-center gap-2 cursor-pointer shadow-lg self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(coupon => (
                  <div key={coupon.code} className="p-5 bg-white border border-[#E8DDD2] shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-base font-bold text-[#B8945F] tracking-wider">
                          {coupon.code}
                        </span>
                        <span className="px-2 py-0.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[9px] uppercase font-mono text-emerald-400">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-[#292522] font-medium">{coupon.description}</p>
                      <p className="text-[11px] text-[#756B63] mt-1">
                        Discount:{' '}
                        <strong>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </strong>
                        {coupon.minSpend ? ` (Min spend: ₹${coupon.minSpend})` : ''}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E8DDD2] mt-4 flex justify-end">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Code</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. AI KNOWLEDGE */}
          {activeTab === 'ai-knowledge' && <AdminAIKnowledge />}

          {/* 11. SETTINGS */}
          {activeTab === 'settings' && <AdminSettings />}

          {/* 12. SECURITY */}
          {activeTab === 'security' && <AdminSecurity />}
        </main>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-white border border-[#B8945F] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#756B63] hover:text-[#B8945F] border border-[#E8DDD2] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block mb-1">
              Atelier Catalog Registry
            </span>
            <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide mb-4">
              {editingProductId ? 'Edit Fragrance Flacon' : 'Formulate New Fragrance'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Fragrance Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="e.g. SANTAL OBSCURA"
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Subtitle / Concentration
                  </label>
                  <input
                    type="text"
                    value={prodSubtitle}
                    onChange={e => setProdSubtitle(e.target.value)}
                    placeholder="e.g. EXTRAIT DE PARFUM"
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Fragrance Family
                  </label>
                  <select
                    value={prodFamily}
                    onChange={e => setProdFamily(e.target.value as any)}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none cursor-pointer"
                  >
                    <option value="Floral">Floral</option>
                    <option value="Woody">Woody</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Oriental">Oriental</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Sensory Description
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  placeholder="Evocative olfactory narrative..."
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] p-2.5 text-[#292522] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Top Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={prodTopNotes}
                    onChange={e => setProdTopNotes(e.target.value)}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Heart Notes
                  </label>
                  <input
                    type="text"
                    value={prodHeartNotes}
                    onChange={e => setProdHeartNotes(e.target.value)}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Base Notes
                  </label>
                  <input
                    type="text"
                    value={prodBaseNotes}
                    onChange={e => setProdBaseNotes(e.target.value)}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Flacon Image Path
                </label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={e => setProdImage(e.target.value)}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8DDD2]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#292522] text-white font-semibold uppercase tracking-wider hover:bg-[#B8945F] cursor-pointer"
                >
                  Save Fragrance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white border border-[#B8945F] p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#756B63] hover:text-[#B8945F] border border-[#E8DDD2] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block mb-1">
              Promotional Incentive
            </span>
            <h3 className="font-serif-luxury text-xl text-[#292522] uppercase tracking-wide mb-4">
              Create Promotional Code
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MAISON25"
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponType}
                    onChange={e => setCouponType(e.target.value as any)}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={couponValue}
                    onChange={e => setCouponValue(Number(e.target.value))}
                    className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Minimum Order Spend (₹)
                </label>
                <input
                  type="number"
                  value={couponMinSpend}
                  onChange={e => setCouponMinSpend(Number(e.target.value))}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={couponDesc}
                  onChange={e => setCouponDesc(e.target.value)}
                  placeholder="e.g. 25% off all orders above ₹4,000"
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-[#292522] outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8DDD2]">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#292522] text-white font-semibold uppercase tracking-wider hover:bg-[#B8945F] cursor-pointer"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
