import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Product, Order, Address, ReturnRequest, ReturnType } from '../types';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  KeyRound,
  Tag,
  Star,
  Compass,
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface AccountPageProps {
  products: Product[];
  orders: Order[];
  onSelectProduct: (productId: string) => void;
  onNavigateShop: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  products,
  orders,
  onSelectProduct,
  onNavigateShop,
}) => {
  const {
    user,
    login,
    signup,
    logout,
    wishlist,
    toggleWishlist,
    addAddress,
    removeAddress,
    setDefaultAddress,
  } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    | 'profile'
    | 'orders'
    | 'track'
    | 'returns'
    | 'wishlist'
    | 'reviews'
    | 'addresses'
    | 'custom-perfumes'
    | 'coupons'
    | 'change-password'
  >('profile');

  // Return & Exchange Requests state
  const [userReturns, setUserReturns] = useState<ReturnRequest[]>([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnSelectedOrderNumber, setReturnSelectedOrderNumber] = useState('');
  const [returnSelectedProductId, setReturnSelectedProductId] = useState('');
  const [returnType, setReturnType] = useState<ReturnType>('RETURN');
  const [returnReason, setReturnReason] = useState('Skin Chemistry / Discovery Sample (14-Day Guarantee)');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnImageUrl, setReturnImageUrl] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Auth form states (for unauthenticated users)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Address modal form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');

  // Password change form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.mobile || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Order tracking search
  const [trackingSearchId, setTrackingSearchId] = useState('');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  // Filtered orders for this customer
  const userOrders = user
    ? orders.filter(
        o => o.email.toLowerCase() === user.email.toLowerCase() || o.userId === user.id
      )
    : [];

  // Filter wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Promotional Offers / Coupons
  const availableCoupons = [
    {
      code: 'WELCOME10',
      discount: '10% OFF',
      desc: 'Exclusive inaugural patron discount on your first artisanal flacon.',
      minOrder: '₹2,500',
      validTill: 'Dec 31, 2026',
    },
    {
      code: 'BESPOKE15',
      discount: '15% OFF',
      desc: 'Applicable on Create Your Signature Scent custom atelier creations.',
      minOrder: '₹4,000',
      validTill: 'Ongoing',
    },
    {
      code: 'LUXEHARVEST',
      discount: '₹750 OFF',
      desc: 'Privileged curations discount on our Pure Extrait de Parfum edition.',
      minOrder: '₹5,000',
      validTill: 'Nov 30, 2026',
    },
  ];

  // Saved bespoke formulations from localStorage
  const [customPerfumes, setCustomPerfumes] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('elasirs_bespoke_formulas');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'bespoke-patron-01',
        name: 'Élixir de Soie',
        date: 'Oct 2, 2026',
        personality: 'Quiet Elegance & Poise',
        family: 'Woody Floral',
        notes: ['Calabrian Bergamot', 'Damask Rose', 'Mysore Sandalwood', 'Cashmere Musk'],
        concentration: 'Extrait de Parfum (28%)',
        bottleSize: '50ml Flacon',
        price: 4499,
        status: 'Archived Formula',
      },
    ];
  });

  // Fetch returns for patron
  React.useEffect(() => {
    if (user?.email) {
      fetch(`/api/returns?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setUserReturns(data.data);
          }
        })
        .catch(() => {});
    }
  }, [user?.email]);

  const handleCopyOrderId = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderId(orderNum);
    showToast(`Order reference ${orderNum} copied`, 'success');
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const handleOpenReturnModal = (orderNum?: string, prodId?: string) => {
    if (orderNum) setReturnSelectedOrderNumber(orderNum);
    else if (userOrders.length > 0) setReturnSelectedOrderNumber(userOrders[0].orderNumber);
    if (prodId) setReturnSelectedProductId(prodId);
    else {
      const selectedOrd = userOrders.find(o => o.orderNumber === (orderNum || userOrders[0]?.orderNumber));
      if (selectedOrd && selectedOrd.items.length > 0) {
        setReturnSelectedProductId(selectedOrd.items[0].productId);
      }
    }
    setShowReturnModal(true);
  };

  const handleSubmitReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnSelectedOrderNumber || !returnSelectedProductId || !returnReason || !returnDescription) {
      showToast('Please complete all required fields for the return request', 'error');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: returnSelectedOrderNumber,
          productId: returnSelectedProductId,
          type: returnType,
          reason: returnReason,
          description: returnDescription,
          imageUrl: returnImageUrl,
          userEmail: user?.email,
          customerName: user?.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUserReturns(prev => [data.data, ...prev]);
        setShowReturnModal(false);
        setReturnDescription('');
        setReturnImageUrl('');
        setActiveTab('returns');
        showToast(`${returnType} request submitted successfully`, 'success');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not submit request', 'error');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    await login(loginEmail);
    showToast('Welcome back to Maison ELASIRS', 'success');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail) return;
    // Switch to simulated OTP flow
    setAuthMode('otp');
    showToast('Verification code dispatched to ' + signupEmail, 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      showToast('Please enter the 4-digit verification code', 'error');
      return;
    }
    await signup(signupName, signupEmail);
    showToast('Patron registration verified successfully', 'success');
    setAuthMode('login');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    showToast('Password recovery instructions dispatched to your inbox', 'success');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newLine1 || !newCity || !newState || !newPostal) {
      showToast('All address fields are required', 'error');
      return;
    }
    addAddress({
      fullName: newFullName,
      phone: newPhone,
      addressLine1: newLine1,
      addressLine2: newLine2,
      city: newCity,
      state: newState,
      postalCode: newPostal,
    });
    setShowAddressModal(false);
    setNewFullName('');
    setNewPhone('');
    setNewLine1('');
    setNewLine2('');
    setNewCity('');
    setNewState('');
    setNewPostal('');
    showToast('Delivery destination recorded', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPwd || newPwd.length < 6) {
      showToast('New password must contain at least 6 characters', 'error');
      return;
    }
    if (newPwd !== confirmPwd) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Credentials updated successfully', 'success');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Code "${text}" copied to clipboard`, 'success');
  };

  // ----------------------------------------------------
  // UNAUTHENTICATED CLIENT PORTAL (Soft Nude Luxury)
  // ----------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-[#292522]">
        <div className="w-full max-w-md bg-white border border-[#E8DDD2] p-8 sm:p-10 shadow-xl rounded-sm">
          
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
              Privileged Sanctuary
            </span>
            <h1 className="text-3xl font-serif-luxury text-[#292522] uppercase tracking-wide font-normal">
              {authMode === 'login'
                ? 'SIGN IN'
                : authMode === 'signup'
                ? 'REGISTER'
                : authMode === 'otp'
                ? 'EMAIL OTP'
                : 'RESET ACCESS'}
            </h1>
            <p className="mt-2 text-xs text-[#756B63] leading-relaxed">
              {authMode === 'login'
                ? 'Access your private orders, saved addresses, custom formulas, and wishlist.'
                : authMode === 'signup'
                ? 'Join the circle of Maison ELASIRS patrons for complimentary discovery privileges.'
                : authMode === 'otp'
                ? `Enter the 4-digit verification code sent to ${signupEmail}.`
                : 'Enter your email to receive secure recovery instructions.'}
            </p>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="patron@example.com"
                  className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[#756B63] uppercase tracking-wider font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-[11px] text-[#B8945F] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#292522] text-white font-semibold uppercase tracking-[0.2em] hover:bg-[#B8945F] transition-colors mt-2 cursor-pointer rounded-xs shadow-xs"
              >
                SIGN IN
              </button>

              {/* Demo Quick Login Button */}
              <div className="pt-4 border-t border-[#E8DDD2] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('ishikadarra03@gmail.com');
                    login('ishikadarra03@gmail.com', 'admin');
                    showToast('Logged in as Atelier Owner (Ishika Darra)', 'success');
                  }}
                  className="text-[11px] uppercase tracking-wider text-[#B8945F] hover:underline cursor-pointer font-semibold"
                >
                  ⚡ Quick Demo Login as Owner (Ishika Darra)
                </button>
              </div>

              <p className="text-center text-[#756B63] mt-4 text-[11px]">
                New to ELASIRS?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-[#292522] font-semibold hover:underline cursor-pointer"
                >
                  Create an Account
                </button>
              </p>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="e.g. Maharani Gayatri"
                  className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="patron@example.com"
                  className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#292522] text-white font-semibold uppercase tracking-[0.2em] hover:bg-[#B8945F] transition-colors mt-2 cursor-pointer rounded-xs shadow-xs"
              >
                PROCEED TO OTP VERIFICATION
              </button>

              <p className="text-center text-[#756B63] mt-4 text-[11px]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[#292522] font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* OTP VERIFICATION */}
          {authMode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs text-center text-[#756B63] text-xs">
                <span>Demo Code: </span>
                <strong className="text-[#292522] font-mono tracking-widest text-sm">4821</strong>
              </div>

              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium text-center">
                  Enter 4-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="••••"
                  className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] text-center font-mono tracking-[0.5em] text-lg rounded-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#292522] text-white font-semibold uppercase tracking-[0.2em] hover:bg-[#B8945F] transition-colors cursor-pointer rounded-xs shadow-xs"
              >
                VERIFY & COMPLETE REGISTRATION
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-[11px] text-[#756B63] hover:text-[#292522] cursor-pointer"
                >
                  Back to Registration
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <div className="space-y-4 text-xs">
              {forgotSent ? (
                <div className="p-6 bg-[#FAF3EC] border border-[#E8DDD2] text-center rounded-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#B8945F] mx-auto mb-2" />
                  <p className="text-xs text-[#292522]">
                    Instructions dispatched to <strong className="text-[#B8945F]">{forgotEmail}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSent(false);
                      setAuthMode('login');
                    }}
                    className="mt-4 text-xs text-[#292522] uppercase tracking-wider font-semibold hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#292522] text-white font-semibold uppercase tracking-[0.2em] hover:bg-[#B8945F] transition-colors cursor-pointer rounded-xs shadow-xs"
                  >
                    DISPATCH RECOVERY LINK
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-[11px] text-[#756B63] hover:text-[#292522] cursor-pointer"
                    >
                      Cancel and return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED PATRON DASHBOARD (Full 10 Sections)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 lg:py-16 text-[#292522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Welcome Banner */}
        <div className="p-6 sm:p-8 bg-white border border-[#E8DDD2] rounded-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF3EC] border border-[#B8945F] flex items-center justify-center text-2xl font-serif-luxury text-[#B8945F]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#B8945F] font-semibold">
                Maison Patron Sanctuary
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif-luxury font-normal text-[#292522]">
                {user.name}
              </h1>
              <p className="text-xs text-[#756B63] mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateShop}
              className="px-5 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer"
            >
              Explore Fragrances
            </button>
            <button
              onClick={() => {
                if (window.confirm('Do you wish to sign out of your patron account?')) {
                  logout();
                  showToast('Signed out successfully', 'info');
                }
              }}
              className="px-4 py-2.5 border border-[#E8DDD2] text-[#756B63] hover:text-red-600 hover:border-red-300 transition-colors text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-white border border-[#E8DDD2] rounded-sm p-3 shadow-xs">
            <nav className="flex flex-col gap-1 text-xs">
              {[
                { id: 'profile', label: 'PROFILE', icon: User },
                { id: 'orders', label: `ORDERS (${userOrders.length})`, icon: Package },
                { id: 'track', label: 'TRACK ORDER', icon: Truck },
                { id: 'returns', label: `RETURNS & REFUNDS (${userReturns.length})`, icon: RefreshCw },
                { id: 'wishlist', label: `WISHLIST (${wishlist.length})`, icon: Heart },
                { id: 'reviews', label: 'REVIEWS & RATING', icon: Star },
                { id: 'addresses', label: `ADDRESSES (${user.addresses?.length || 0})`, icon: MapPin },
                { id: 'custom-perfumes', label: `MY CUSTOM PERFUMES (${customPerfumes.length})`, icon: Compass },
                { id: 'coupons', label: 'COUPONS / OFFERS', icon: Tag },
                { id: 'change-password', label: 'CHANGE PASSWORD', icon: KeyRound },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#292522] text-white shadow-xs'
                        : 'text-[#756B63] hover:text-[#292522] hover:bg-[#FAF3EC]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8945F]' : 'text-[#756B63]'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 mt-2 border-t border-[#E8DDD2]">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out?')) {
                      logout();
                      showToast('Logged out', 'info');
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors rounded-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area (lg:col-span-9) */}
          <div className="lg:col-span-9 bg-white border border-[#E8DDD2] rounded-sm p-6 sm:p-8 shadow-xs min-h-[500px]">
            
            {/* 1. PROFILE SECTION */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Account Overview
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    PATRON PROFILE
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#756B63] font-medium">Full Name</span>
                    <p className="text-sm font-semibold text-[#292522]">{user.name}</p>
                  </div>

                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#756B63] font-medium">Email Address</span>
                    <p className="text-sm font-semibold text-[#292522]">{user.email}</p>
                  </div>

                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#756B63] font-medium">Patron Status</span>
                    <p className="text-sm font-semibold text-[#B8945F] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Artisanal Inner Circle</span>
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#756B63] font-medium">Default Delivery Destination</span>
                    <p className="text-sm font-semibold text-[#292522]">
                      {user.addresses?.find(a => a.isDefault)?.city || 'None set yet'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8DDD2] flex items-center justify-between">
                  <div className="text-xs text-[#756B63]">
                    <p>Protected by 256-bit encryption. Account data is never distributed.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('change-password')}
                    className="px-4 py-2 border border-[#292522] text-[#292522] hover:bg-[#292522] hover:text-white transition-colors text-xs uppercase tracking-wider rounded-xs cursor-pointer"
                  >
                    Update Credentials
                  </button>
                </div>
              </div>
            )}

            {/* 2. ORDERS SECTION */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2] flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                      History & Acquisition
                    </span>
                    <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                      YOUR ORDERS
                    </h2>
                  </div>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-16 p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs">
                    <Package className="w-12 h-12 text-[#B8945F]/60 stroke-1 mx-auto mb-3" />
                    <h4 className="font-serif-luxury text-xl text-[#292522]">No recorded orders yet</h4>
                    <p className="text-xs text-[#756B63] mt-1 max-w-sm mx-auto">
                      Your inaugural order will appear here with live tracking and consignment details.
                    </p>
                    <button
                      onClick={onNavigateShop}
                      className="mt-6 px-6 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#B8945F] transition-colors rounded-xs cursor-pointer shadow-xs"
                    >
                      Explore Boutique
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-5 bg-white border border-[#E8DDD2] rounded-xs space-y-4 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8DDD2] text-xs">
                          <div>
                            <span className="text-[#756B63] block text-[11px]">Order Reference</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono font-semibold text-[#292522]">
                                {order.orderNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(order.orderNumber)}
                                className="p-0.5 text-[#B8945F] hover:text-[#292522] cursor-pointer"
                                title="Copy order number"
                              >
                                {copiedOrderId === order.orderNumber ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[#756B63] block text-[11px]">Date Placed</span>
                            <span className="text-[#292522]">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div>
                            <span className="text-[#756B63] block text-[11px]">Status</span>
                            <span className="inline-block px-2.5 py-0.5 bg-[#FAF3EC] border border-[#B8945F]/40 text-[#B8945F] font-semibold uppercase text-[10px] tracking-wider rounded-xs">
                              {order.status}
                            </span>
                          </div>

                          <div>
                            <span className="text-[#756B63] block text-[11px]">Total</span>
                            <span className="font-semibold text-[#292522] tabular-nums">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 items-center bg-[#FAF3EC] p-2.5 border border-[#E8DDD2] rounded-xs"
                            >
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-12 h-14 object-contain bg-white p-1 border border-[#E8DDD2] rounded-xs shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="font-serif-luxury text-sm text-[#292522] truncate">
                                  {item.productName}
                                </h5>
                                <p className="text-[10px] text-[#756B63] uppercase tracking-wider">
                                  {item.size} · Qty {item.quantity} · ₹{item.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DDD2]/60">
                          <button
                            type="button"
                            onClick={() => handleOpenReturnModal(order.orderNumber, order.items[0]?.productId)}
                            className="text-xs uppercase tracking-wider font-semibold text-[#756B63] hover:text-[#292522] flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[#B8945F]" />
                            <span>Request Return / Exchange</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForTracking(order);
                              setActiveTab('track');
                            }}
                            className="text-xs uppercase tracking-wider font-semibold text-[#B8945F] hover:text-[#292522] flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Live Courier Tracking</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ORDER TRACKING SECTION (Requirement #12) */}
            {activeTab === 'track' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Consignment Dispatch
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    LIVE ORDER TRACKING
                  </h2>
                </div>

                {/* Search / Select Order Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-[#B8945F] absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Enter Order Number (e.g. EL-82910) or Tracking ID..."
                      value={trackingSearchId}
                      onChange={e => setTrackingSearchId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-xs text-[#292522] rounded-xs outline-none focus:border-[#292522]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const found = orders.find(
                        o =>
                          o.orderNumber.toLowerCase() === trackingSearchId.trim().toLowerCase() ||
                          (o.trackingNumber &&
                            o.trackingNumber.toLowerCase() === trackingSearchId.trim().toLowerCase())
                      );
                      if (found) {
                        setSelectedOrderForTracking(found);
                      } else {
                        showToast('Order reference not located in system', 'error');
                      }
                    }}
                    className="px-6 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer"
                  >
                    Track Shipment
                  </button>
                </div>

                {/* Display active order for tracking */}
                {(() => {
                  const targetOrder =
                    selectedOrderForTracking || userOrders[0] || orders[0] || null;

                  if (!targetOrder) {
                    return (
                      <div className="text-center py-12 text-xs text-[#756B63]">
                        <p>No current orders available to track.</p>
                      </div>
                    );
                  }

                  // Timeline steps
                  const timeline = [
                    { label: 'ORDER PLACED', key: 'Placed', done: true, time: 'Day 1 · Confirmed' },
                    {
                      label: 'ORDER CONFIRMED',
                      key: 'Confirmed',
                      done: true,
                      time: 'Day 1 · Verified',
                    },
                    {
                      label: 'PROCESSING',
                      key: 'Processing',
                      done: targetOrder.status !== 'Pending',
                      time: 'Day 2 · Cellar Selected',
                    },
                    {
                      label: 'SHIPPED',
                      key: 'Shipped',
                      done: ['Shipped', 'Out for Delivery', 'Delivered'].includes(targetOrder.status),
                      time: 'Day 3 · In Transit',
                    },
                    {
                      label: 'OUT FOR DELIVERY',
                      key: 'Out for Delivery',
                      done: ['Out for Delivery', 'Delivered'].includes(targetOrder.status),
                      time: 'Day 4 · Courier Assigned',
                    },
                    {
                      label: 'DELIVERED',
                      key: 'Delivered',
                      done: targetOrder.status === 'Delivered',
                      time: 'Recipient Signature',
                    },
                  ];

                  return (
                    <div className="p-6 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-6">
                      {/* Meta Information Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pb-4 border-b border-[#E8DDD2]">
                        <div>
                          <span className="text-[#756B63] block text-[11px] uppercase tracking-wider">
                            Order ID
                          </span>
                          <span className="font-mono font-semibold text-[#292522]">
                            {targetOrder.orderNumber}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#756B63] block text-[11px] uppercase tracking-wider">
                            Tracking Number
                          </span>
                          <span className="font-mono font-semibold text-[#B8945F]">
                            {targetOrder.trackingNumber || 'Assigned at dispatch'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#756B63] block text-[11px] uppercase tracking-wider">
                            Estimated Delivery
                          </span>
                          <span className="font-semibold text-[#292522]">
                            {targetOrder.estimatedDelivery || '2–4 Business Days'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#756B63] block text-[11px] uppercase tracking-wider">
                            Current Status
                          </span>
                          <span className="font-semibold text-[#B8945F] uppercase">
                            {targetOrder.status}
                          </span>
                        </div>
                      </div>

                      {/* Six-Stage Timeline UI */}
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-[#292522] font-semibold mb-6">
                          Consignment Milestone Journey
                        </h4>

                        <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
                          {timeline.map((step, idx) => (
                            <div
                              key={step.label}
                              className="flex md:flex-col items-center gap-3 md:text-center flex-1"
                            >
                              <div
                                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  step.done
                                    ? 'bg-[#292522] border-[#292522] text-[#B8945F]'
                                    : 'bg-white border-[#E8DDD2] text-[#756B63]/40'
                                }`}
                              >
                                {step.done ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="text-xs font-semibold">{idx + 1}</span>
                                )}
                              </div>

                              <div>
                                <span
                                  className={`block text-[11px] uppercase tracking-wider font-semibold ${
                                    step.done ? 'text-[#292522]' : 'text-[#756B63]/60'
                                  }`}
                                >
                                  {step.label}
                                </span>
                                <span className="block text-[10px] text-[#756B63] mt-0.5">
                                  {step.time}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address summary */}
                      <div className="pt-4 border-t border-[#E8DDD2] text-xs text-[#756B63] flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <strong className="text-[#292522] block font-medium">Destination:</strong>
                          <span>
                            {targetOrder.shippingAddress.addressLine1}, {targetOrder.shippingAddress.city},{' '}
                            {targetOrder.shippingAddress.postalCode}
                          </span>
                        </div>
                        <div className="sm:text-right">
                          <strong className="text-[#292522] block font-medium">Courier Partner:</strong>
                          <span>Blue Dart Express (Insured Luxury Fragrance Protocol)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* RETURNS & REFUNDS SECTION */}
            {activeTab === 'returns' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
                  <div>
                    <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                      Client Guarantee · 14-Day Trial
                    </span>
                    <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                      RETURNS & REFUNDS
                    </h2>
                  </div>
                  <button
                    onClick={() => handleOpenReturnModal()}
                    className="px-5 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer flex items-center gap-2 shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Initiate Request</span>
                  </button>
                </div>

                {/* 14-Day Discovery Policy Banner */}
                <div className="p-4 bg-[#FAF3EC] border border-[#B8945F]/30 rounded-xs text-xs space-y-1.5 leading-relaxed text-[#756B63]">
                  <div className="flex items-center gap-2 text-[#292522] font-semibold uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-[#B8945F]" />
                    <span>The ELASIRS Discovery Guarantee</span>
                  </div>
                  <p className="font-light">
                    Every 50ml and 100ml flacon is accompanied by a complimentary matching 2ml trial vial. We invite you to experience the scent on your skin first. If it does not resonate with you, the unopened full-size flacon in original cellophane packaging may be returned within 14 days for a full refund or exchange.
                  </p>
                </div>

                {userReturns.length === 0 ? (
                  <div className="text-center py-16 p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs">
                    <RefreshCw className="w-12 h-12 text-[#B8945F]/60 stroke-1 mx-auto mb-3" />
                    <h4 className="font-serif-luxury text-xl text-[#292522]">No Return Requests Recorded</h4>
                    <p className="text-xs text-[#756B63] mt-1 max-w-sm mx-auto">
                      All your flacon orders are in pristine standing. If you need to exchange or return a creation, tap Initiate Request above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReturns.map(ret => (
                      <div
                        key={ret.id}
                        className="p-5 bg-white border border-[#E8DDD2] rounded-xs space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8DDD2] text-xs">
                          <div>
                            <span className="text-[#756B63] block text-[10px] uppercase">Request ID</span>
                            <span className="font-mono font-semibold text-[#292522]">{ret.id}</span>
                          </div>
                          <div>
                            <span className="text-[#756B63] block text-[10px] uppercase">Order Ref</span>
                            <span className="font-mono font-semibold text-[#B8945F]">{ret.orderNumber}</span>
                          </div>
                          <div>
                            <span className="text-[#756B63] block text-[10px] uppercase">Type</span>
                            <span className="font-semibold text-[#292522] uppercase">{ret.type}</span>
                          </div>
                          <div>
                            <span className="text-[#756B63] block text-[10px] uppercase">Status</span>
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

                        <div className="flex items-start justify-between gap-4 text-xs">
                          <div>
                            <h5 className="font-serif-luxury text-sm text-[#292522]">{ret.productName} ({ret.size})</h5>
                            <p className="text-[#756B63] mt-0.5">
                              <strong>Reason:</strong> {ret.reason}
                            </p>
                            <p className="text-[#756B63] mt-1 font-light italic">
                              "{ret.description}"
                            </p>
                            {ret.adminNote && (
                              <div className="mt-2 p-2 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs text-[11px] text-[#292522]">
                                <span className="font-semibold text-[#B8945F]">Atelier Response: </span>
                                {ret.adminNote}
                              </div>
                            )}
                          </div>
                          {ret.refundAmount && (
                            <div className="text-right shrink-0">
                              <span className="text-[#756B63] block text-[10px] uppercase">Value</span>
                              <span className="font-semibold text-[#292522] text-sm tabular-nums">
                                ₹{ret.refundAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 text-[10px] text-[#756B63] border-t border-[#E8DDD2]/60 flex justify-between items-center">
                          <span>Submitted on {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[#B8945F] font-medium">Maison Client Care</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST SECTION */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Saved Treasures
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    YOUR CURATED WISHLIST
                  </h2>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-16 p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs">
                    <Heart className="w-12 h-12 text-[#B8945F]/60 stroke-1 mx-auto mb-3" />
                    <h4 className="font-serif-luxury text-xl text-[#292522]">Your wishlist is pristine</h4>
                    <p className="text-xs text-[#756B63] mt-1 max-w-sm mx-auto">
                      Explore our olfactory spectrum and tap the heart icon on any flacon to preserve it here.
                    </p>
                    <button
                      onClick={onNavigateShop}
                      className="mt-6 px-6 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#B8945F] transition-colors rounded-xs cursor-pointer shadow-xs"
                    >
                      Browse Boutique
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map(prod => (
                      <div
                        key={prod.id}
                        className="p-4 bg-white border border-[#E8DDD2] rounded-xs flex flex-col justify-between shadow-xs hover:border-[#B8945F]/60 transition-colors"
                      >
                        <div
                          className="aspect-[3/4] bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs p-4 flex items-center justify-center cursor-pointer mb-3"
                          onClick={() => onSelectProduct(prod.id)}
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="max-h-full object-contain drop-shadow-sm hover:scale-105 transition-transform"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] font-semibold">
                            {prod.family}
                          </span>
                          <h4
                            className="font-serif-luxury text-lg text-[#292522] cursor-pointer hover:text-[#B8945F] transition-colors"
                            onClick={() => onSelectProduct(prod.id)}
                          >
                            {prod.name}
                          </h4>
                          <span className="text-xs font-semibold text-[#292522] tabular-nums block mt-1">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E8DDD2] flex items-center gap-2">
                          <button
                            onClick={() => {
                              addToCart(prod, prod.variants[0]?.size || '50ml');
                              showToast(`${prod.name} moved to shopping bag`, 'success');
                            }}
                            className="flex-1 py-2 bg-[#292522] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </button>
                          <button
                            onClick={() => {
                              toggleWishlist(prod.id);
                              showToast(`${prod.name} removed from wishlist`, 'info');
                            }}
                            className="p-2 border border-[#E8DDD2] text-[#756B63] hover:text-red-600 hover:border-red-300 transition-colors rounded-xs cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. REVIEWS SECTION */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Patron Voice
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    YOUR SUBMITTED REVIEWS
                  </h2>
                </div>

                <div className="p-6 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif-luxury text-lg text-[#292522]">Review Guidelines</h4>
                      <p className="text-[#756B63] mt-0.5">
                        Reviews submitted for verified flacon purchases earn 250 patron loyalty reward points.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white border border-[#B8945F] text-[#B8945F] text-[11px] uppercase tracking-wider font-semibold rounded-xs">
                      Verified Patron
                    </span>
                  </div>
                </div>

                <div className="text-center py-12 p-6 bg-white border border-[#E8DDD2] rounded-xs">
                  <Star className="w-8 h-8 text-[#B8945F] mx-auto mb-2 fill-[#B8945F]" />
                  <p className="text-xs text-[#756B63]">
                    You can submit detailed sensory impressions directly on each fragrance product page.
                  </p>
                  <button
                    onClick={onNavigateShop}
                    className="mt-4 px-5 py-2 bg-[#292522] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer"
                  >
                    Select a Fragrance to Review
                  </button>
                </div>
              </div>
            )}

            {/* 6. ADDRESSES SECTION */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2] flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                      Saved Destinations
                    </span>
                    <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                      DELIVERY ADDRESS BOOK
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors flex items-center gap-1.5 rounded-xs cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-12 p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs text-xs text-[#756B63]">
                    <MapPin className="w-8 h-8 text-[#B8945F]/60 mx-auto mb-2" />
                    <p>No delivery destinations saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map(addr => (
                      <div
                        key={addr.id}
                        className={`p-5 bg-white border rounded-xs flex flex-col justify-between text-xs space-y-3 ${
                          addr.isDefault ? 'border-[#292522] shadow-xs' : 'border-[#E8DDD2]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-[#292522]">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B8945F] bg-[#FAF3EC] px-2 py-0.5 border border-[#B8945F]/30 rounded-xs">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[#756B63]">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-[#756B63]">{addr.addressLine2}</p>}
                          <p className="text-[#756B63]">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-[#756B63] mt-1 font-mono">Phone: {addr.phone}</p>
                        </div>

                        <div className="pt-3 border-t border-[#E8DDD2] flex items-center justify-between">
                          {!addr.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[11px] text-[#B8945F] hover:underline cursor-pointer font-semibold uppercase tracking-wider"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => removeAddress(addr.id)}
                            className="text-red-500 hover:text-red-700 text-xs ml-auto cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. MY CUSTOM PERFUMES */}
            {activeTab === 'custom-perfumes' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Bespoke Scent Studio
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    MY CUSTOM FORMULATIONS
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customPerfumes.map(item => (
                    <div
                      key={item.id}
                      className="p-5 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B8945F]">
                          {item.concentration}
                        </span>
                        <span className="text-[11px] text-[#756B63]">{item.date}</span>
                      </div>

                      <h4 className="font-serif-luxury text-xl text-[#292522]">
                        "{item.name}"
                      </h4>

                      <div className="space-y-1 text-[#756B63]">
                        <p><strong>Olfactory Accord:</strong> {item.family}</p>
                        <p><strong>Essence Notes:</strong> {item.notes.join(' · ')}</p>
                        <p><strong>Flacon Size:</strong> {item.bottleSize}</p>
                      </div>

                      <div className="pt-3 border-t border-[#E8DDD2] flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#292522] tabular-nums">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => {
                            showToast(`Formula "${item.name}" sent to reorder preparation`, 'success');
                          }}
                          className="px-3.5 py-1.5 bg-[#292522] text-white text-[11px] font-semibold uppercase tracking-wider rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer"
                        >
                          Reorder Batch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. COUPONS / OFFERS */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Privileged Invitations
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    COUPONS & OFFERS
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableCoupons.map(coupon => (
                    <div
                      key={coupon.code}
                      className="p-5 bg-white border border-[#E8DDD2] rounded-xs flex flex-col justify-between space-y-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-serif-luxury font-bold text-[#B8945F]">
                            {coupon.discount}
                          </span>
                          <span className="text-[10px] text-[#756B63] uppercase tracking-wider font-mono">
                            Expires {coupon.validTill}
                          </span>
                        </div>
                        <p className="text-xs text-[#756B63] leading-relaxed">
                          {coupon.desc}
                        </p>
                        <span className="text-[10px] text-[#756B63] mt-2 block">
                          Min Order: {coupon.minOrder}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-[#E8DDD2] flex items-center justify-between">
                        <code className="text-xs font-mono font-bold text-[#292522] bg-[#FAF3EC] px-2.5 py-1 rounded-xs border border-[#E8DDD2]">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-xs uppercase tracking-wider text-[#B8945F] hover:text-[#292522] flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. CHANGE PASSWORD */}
            {activeTab === 'change-password' && (
              <div className="space-y-6 max-w-md">
                <div className="pb-4 border-b border-[#E8DDD2]">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                    Security Credentials
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-[#292522] font-normal uppercase">
                    CHANGE PASSWORD
                  </h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPwd}
                      onChange={e => setCurrentPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs focus:border-[#292522]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs focus:border-[#292522]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs focus:border-[#292522]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#292522] text-white font-semibold uppercase tracking-[0.2em] rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer shadow-xs"
                  >
                    SAVE NEW PASSWORD
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8DDD2] p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs rounded-sm shadow-2xl">
            <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase">
              Add Delivery Destination
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="e.g. Maharani Gayatri"
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1">
                  Street Address / Villa *
                </label>
                <input
                  type="text"
                  required
                  value={newLine1}
                  onChange={e => setNewLine1(e.target.value)}
                  placeholder="Plot 18, Worli Sea Face"
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1">
                  Apartment / Suite (Optional)
                </label>
                <input
                  type="text"
                  value={newLine2}
                  onChange={e => setNewLine2(e.target.value)}
                  placeholder="Floor 4, Penthouse B"
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#756B63] uppercase tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#756B63] uppercase tracking-wider mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#756B63] uppercase tracking-wider mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={newPostal}
                    onChange={e => setNewPostal(e.target.value)}
                    placeholder="400018"
                    className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#292522] text-white font-semibold uppercase tracking-widest hover:bg-[#B8945F] transition-colors cursor-pointer rounded-xs"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-3 border border-[#E8DDD2] text-[#756B63] uppercase tracking-wider rounded-xs hover:border-[#292522] hover:text-[#292522] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return / Exchange / Refund Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8DDD2] p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="pb-3 border-b border-[#E8DDD2]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
                Maison Discovery Trial & Exchange
              </span>
              <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase mt-0.5">
                Initiate Return / Exchange
              </h3>
            </div>

            <form onSubmit={handleSubmitReturnRequest} className="space-y-3.5">
              {/* Select Order */}
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Select Order *
                </label>
                <select
                  value={returnSelectedOrderNumber}
                  onChange={e => {
                    setReturnSelectedOrderNumber(e.target.value);
                    const selectedOrd = userOrders.find(o => o.orderNumber === e.target.value);
                    if (selectedOrd && selectedOrd.items.length > 0) {
                      setReturnSelectedProductId(selectedOrd.items[0].productId);
                    }
                  }}
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs font-mono"
                  required
                >
                  {userOrders.map(o => (
                    <option key={o.id} value={o.orderNumber}>
                      {o.orderNumber} · {new Date(o.createdAt).toLocaleDateString('en-IN')} (₹{o.total.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Product */}
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Select Flacon / Product *
                </label>
                <select
                  value={returnSelectedProductId}
                  onChange={e => setReturnSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs font-serif-luxury"
                  required
                >
                  {(() => {
                    const selectedOrd = userOrders.find(o => o.orderNumber === returnSelectedOrderNumber) || userOrders[0];
                    if (!selectedOrd) return <option value="">No products found</option>;
                    return selectedOrd.items.map(item => (
                      <option key={item.productId} value={item.productId}>
                        {item.productName} ({item.size}) · Qty {item.quantity} · ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              {/* Request Type */}
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Request Nature *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['RETURN', 'EXCHANGE', 'REFUND'] as ReturnType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReturnType(type)}
                      className={`p-2 border text-[11px] font-semibold uppercase tracking-wider rounded-xs cursor-pointer transition-colors ${
                        returnType === type
                          ? 'bg-[#292522] border-[#292522] text-white'
                          : 'bg-[#FAF3EC] border-[#E8DDD2] text-[#756B63] hover:border-[#292522]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Primary Reason *
                </label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                >
                  <option value="Skin Chemistry / Discovery Sample (14-Day Guarantee)">
                    Trial sample did not suit skin chemistry (14-Day Guarantee)
                  </option>
                  <option value="Exchange for Alternate Fragrance Profile">
                    Exchange for another fragrance profile / family
                  </option>
                  <option value="Damaged in Courier Transit">
                    Flacon presentation box damaged in courier transit
                  </option>
                  <option value="Defective Atomizer Spray Mechanism">
                    Defective atomizer spray mechanism
                  </option>
                  <option value="Incorrect Flacon Dispatched">
                    Incorrect flacon edition dispatched
                  </option>
                  <option value="Other Patron Service Inquiry">
                    Other patron service inquiry
                  </option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Detailed Explanation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnDescription}
                  onChange={e => setReturnDescription(e.target.value)}
                  placeholder="Please describe condition of the unopened flacon and tamper-evident seal..."
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                />
              </div>

              {/* Image URL (Optional) */}
              <div>
                <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                  Optional Photograph Link / Reference
                </label>
                <input
                  type="text"
                  value={returnImageUrl}
                  onChange={e => setReturnImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg (optional)"
                  className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                />
              </div>

              <div className="pt-3 flex gap-3 border-t border-[#E8DDD2]">
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="flex-1 py-3 bg-[#292522] text-white font-semibold uppercase tracking-widest hover:bg-[#B8945F] transition-colors cursor-pointer rounded-xs disabled:opacity-50"
                >
                  {isSubmittingReturn ? 'Submitting Request...' : `Submit ${returnType}`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-6 py-3 border border-[#E8DDD2] text-[#756B63] uppercase tracking-wider rounded-xs hover:border-[#292522] hover:text-[#292522] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
