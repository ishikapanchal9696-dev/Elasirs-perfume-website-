import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  X,
  Mail,
  ArrowRight,
  Instagram,
  Facebook,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface FooterProps {
  onNavigate: (view: string, category?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [modalPolicy, setModalPolicy] = useState<{ title: string; content: string } | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please provide a valid email address', 'error');
      return;
    }
    setNewsletterSubscribed(true);
    showToast('Privileged invitation confirmed. Check your inbox for code WELCOME10.', 'success');
  };

  const policyDetails: Record<string, { title: string; content: string }> = {
    privacy: {
      title: 'Privacy Policy',
      content:
        'Maison ELASIRS respects your privacy. We process personal data solely to fulfill fragrance orders, deliver authentic custom blends, and provide client concierge support. We do not sell or trade your personal information to third parties. All transactions are protected via 256-bit SSL encryption.',
    },
    terms: {
      title: 'Terms & Conditions',
      content:
        'All ELASIRS perfumes are formulated using pure botanical concentrates and cosmetic-grade alcohol. Orders over ₹4,000 qualify for complimentary insured priority delivery. Unopened flacons in original packaging may be returned within 14 days of receipt.',
    },
    cookies: {
      title: 'Cookie & Session Policy',
      content:
        'We utilize essential session cookies to remember your shopping cart items, authenticate patron logins, and store your bespoke fragrance studio preferences. No intrusive ad tracking networks are deployed.',
    },
    shipping: {
      title: 'Shipping Policy',
      content:
        'Orders are dispatched via temperature-controlled express couriers within 24–48 hours from our Mumbai and Grasse fulfillment hubs. Delivery takes 2–4 business days across India. Complimentary tracking is provided via SMS and email.',
    },
    returns: {
      title: 'Returns & Discovery Trial',
      content:
        'Every 50ml or 100ml flacon includes a complimentary 2ml matching sample. We invite you to test the sample first. If the scent does not suit your skin chemistry, return the unopened full flacon within 14 days for a full refund or exchange.',
    },
  };

  return (
    <>
      <footer className="bg-[#FAF3EC] text-[#292522] border-t border-[#E8DDD2] pt-16 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#E8DDD2]">
            
            {/* Column 1 & 2: Brand Story & Newsletter (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <button
                onClick={() => onNavigate('home')}
                className="font-serif-luxury text-3xl tracking-[0.2em] text-[#292522] hover:text-[#B8945F] transition-colors uppercase block text-left cursor-pointer"
              >
                ELASIRS
              </button>
              <p className="text-xs text-[#756B63] max-w-sm leading-relaxed font-light">
                Haute parfumerie bridging classical French craftsmanship with contemporary minimalism. Formulated with authentic botanical essences aged for 120 days for all-day elegance.
              </p>

              {/* Guarantees */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#756B63] pt-1">
                <span className="flex items-center gap-1.5 text-[#292522] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
                  <span>100% Cruelty-Free</span>
                </span>
                <span className="text-[#E8DDD2]">·</span>
                <span className="flex items-center gap-1.5 text-[#292522] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B8945F]" />
                  <span>Free Insured Delivery Over ₹4,000</span>
                </span>
              </div>

              {/* Newsletter Subscription Strip */}
              <div className="pt-3 max-w-sm">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] font-semibold block mb-2">
                  Privileged Olfactory Access
                </span>
                {newsletterSubscribed ? (
                  <div className="flex items-center gap-2 p-2.5 bg-white border border-[#E8DDD2] rounded-xs text-xs text-[#292522]">
                    <CheckCircle2 className="w-4 h-4 text-[#B8945F]" />
                    <span>Welcome to Maison ELASIRS inner circle.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="flex-1 bg-white border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] placeholder-[#756B63]/60 outline-none focus:border-[#292522] rounded-xs shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#292522] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors rounded-xs cursor-pointer shadow-2xs shrink-0"
                    >
                      Join
                    </button>
                  </form>
                )}
              </div>

              {/* Social Media Links */}
              <div className="pt-3 flex items-center gap-3 text-[#756B63]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ELASIRS on Instagram"
                  className="p-2 bg-white border border-[#E8DDD2] hover:border-[#B8945F] hover:text-[#292522] transition-colors rounded-full shadow-2xs"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ELASIRS on Facebook"
                  className="p-2 bg-white border border-[#E8DDD2] hover:border-[#B8945F] hover:text-[#292522] transition-colors rounded-full shadow-2xs"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] font-mono tracking-widest text-[#756B63] ml-1">
                  @ELASIRSFRAGRANCE
                </span>
              </div>
            </div>

            {/* Column 2: Collections & Shop (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <h4 className="text-xs uppercase tracking-[0.22em] text-[#292522] font-semibold mb-4">
                Collections
              </h4>
              <ul className="space-y-2.5 text-xs text-[#756B63]">
                <li>
                  <button
                    onClick={() => onNavigate('collections', 'all')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    All Collections
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('collections', 'everyday')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Everyday Collection
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('collections', 'signature')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Signature Icons
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('collections', 'luxe')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Luxe Extraits Reserve
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left font-medium text-[#292522]"
                  >
                    Bestsellers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('collections', 'floral')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Fragrance Families
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Atelier & Maison (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <h4 className="text-xs uppercase tracking-[0.22em] text-[#292522] font-semibold mb-4">
                Atelier
              </h4>
              <ul className="space-y-2.5 text-xs text-[#756B63]">
                <li>
                  <button
                    onClick={() => onNavigate('bespoke-scent')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Create Your Scent
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('about')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    About Us & Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('journal')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    The Scent Journal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Private Consultation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Complete Flacon Catalog
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Client Services & Policies (lg:col-span-3) */}
            <div className="lg:col-span-3">
              <h4 className="text-xs uppercase tracking-[0.22em] text-[#292522] font-semibold mb-4">
                Client Care
              </h4>
              <ul className="space-y-2.5 text-xs text-[#756B63]">
                <li>
                  <button
                    onClick={() => setModalPolicy(policyDetails.shipping)}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Shipping & Delivery
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalPolicy(policyDetails.returns)}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Shipping & Returns (14-Day Trial)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('faq')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    FAQs & Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Contact Atelier
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('account')}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Track Order Status
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalPolicy(policyDetails.privacy)}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalPolicy(policyDetails.terms)}
                    className="hover:text-[#292522] transition-colors cursor-pointer text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Payment Badges & Copyright Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-[#756B63]">
            <div>
              <p>© {new Date().getFullYear()} MAISON ELASIRS HAUTE PARFUMERIE. All rights reserved.</p>
              <p className="mt-0.5 text-[10px] text-[#756B63]/80">
                Grasse · Paris · Mumbai · Worldwide Botanical Extractions
              </p>
            </div>

            {/* Payment Method Badges & Discreet Admin Link */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-[#E8DDD2] text-[10px] font-semibold text-[#292522] rounded-xs shadow-2xs">
                  VISA
                </span>
                <span className="px-2.5 py-1 bg-white border border-[#E8DDD2] text-[10px] font-semibold text-[#292522] rounded-xs shadow-2xs">
                  Mastercard
                </span>
                <span className="px-2.5 py-1 bg-white border border-[#E8DDD2] text-[10px] font-semibold text-[#292522] rounded-xs shadow-2xs">
                  UPI / GPay
                </span>
                <span className="px-2.5 py-1 bg-white border border-[#E8DDD2] text-[10px] font-semibold text-[#292522] rounded-xs shadow-2xs">
                  RuPay
                </span>
                <span className="px-2.5 py-1 bg-white border border-[#E8DDD2] text-[10px] font-semibold text-[#292522] rounded-xs shadow-2xs">
                  NetBanking
                </span>
                <span className="px-2.5 py-1 bg-[#FAF3EC] border border-[#B8945F]/30 text-[10px] font-semibold text-[#B8945F] rounded-xs shadow-2xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#B8945F]" />
                  <span>256-bit SSL</span>
                </span>
              </div>

              {/* Discreet Admin Login (Separated from Customer Links) */}
              <div className="pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-[#E8DDD2]">
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[10px] uppercase font-mono tracking-wider text-[#756B63]/60 hover:text-[#B8945F] transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-xs"
                  title="Restricted Maison Administration Portal"
                  aria-label="Admin Login Portal"
                >
                  <Lock className="w-3 h-3 text-[#B8945F]/70" />
                  <span>Admin Login</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Policy Modal Overlay */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 sm:p-8 rounded-sm max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setModalPolicy(null)}
              className="absolute top-4 right-4 p-1 text-[#756B63] hover:text-[#292522] cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif-luxury text-2xl text-[#292522] mb-3">
              {modalPolicy.title}
            </h3>
            <p className="text-xs text-[#756B63] leading-relaxed font-light">
              {modalPolicy.content}
            </p>
            <div className="mt-6 pt-4 border-t border-[#E8DDD2] text-right">
              <button
                onClick={() => setModalPolicy(null)}
                className="px-5 py-2 bg-[#292522] text-white text-xs uppercase tracking-wider font-semibold rounded-xs cursor-pointer hover:bg-[#B8945F] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
