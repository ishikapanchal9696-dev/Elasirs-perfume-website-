import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Sparkles, Search, MessageSquare } from 'lucide-react';

interface FAQPageProps {
  onBackToShop: () => void;
  onContactConcierge: () => void;
}

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  title: string;
  iconName?: string;
  items: FAQItem[];
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBackToShop, onContactConcierge }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIndex, setExpandedIndex] = useState<string | null>('products-0');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const faqData: FAQCategory[] = [
    {
      id: 'products',
      title: 'Products',
      items: [
        {
          q: 'What makes ELASIRS perfumes Haute Parfumerie grade?',
          a: 'Every ELASIRS creation is formulated with authentic raw harvests sourced from Grasse and Mysore. We employ high Extrait and Eau de Parfum concentrations (20% to 28% pure perfume oils) and age our blends in cellar demijohns for a minimum of 120 days to ensure exceptional roundness and longevity.',
        },
        {
          q: 'Are ELASIRS perfumes unisex?',
          a: 'Yes. Classical artisanal perfumery transcends traditional gender boundaries. Scent interacts uniquely with each individual’s skin pH, warmth, and chemistry. We encourage patrons to wear fragrances that evoke their desired mood and memory.',
        },
        {
          q: 'Are your fragrances vegan and cruelty-free?',
          a: 'Maison ELASIRS is 100% cruelty-free. We never test on animals, nor do we commission third parties to do so. We utilize botanical accords in place of animal-derived musks and civets.',
        },
      ],
    },
    {
      id: 'fragrance',
      title: 'Fragrance & Wear',
      items: [
        {
          q: 'How long do ELASIRS perfumes last on the skin?',
          a: 'Due to our 120-day natural maceration and high oil concentration, our Eau de Parfum creations consistently yield 8 to 10 hours of noticeable aura, while our Extrait de Parfum compositions offer 12 to 14+ hours of enduring presence.',
        },
        {
          q: 'How should I apply and store my flacon?',
          a: 'Spray onto pulse points—the base of the neck, inner wrists, and behind the ears. Avoid vigorously rubbing wrists together, as friction bruises delicate top citrus and floral notes. Store your glass flacon away from direct sunlight and sudden temperature spikes.',
        },
        {
          q: 'What is the olfactory pyramid (Top, Heart, Base)?',
          a: 'Top notes provide the initial radiance (first 15–30 minutes). Heart notes emerge as the core identity (2–5 hours). Base notes represent the rich, heavy resins, woods, and ambers that bond with your skin for the remainder of the day.',
        },
      ],
    },
    {
      id: 'orders',
      title: 'Orders',
      items: [
        {
          q: 'How can I check my order status?',
          a: 'You can track your order at any moment by navigating to Account > Track Order, or by entering your order reference number in the tracking portal.',
        },
        {
          q: 'Can I cancel or modify an order after placement?',
          a: 'Because our atelier dispatches orders quickly to preserve cellar freshness, please contact our concierge via live chat or email within 2 hours of placement to modify order details.',
        },
        {
          q: 'Is order confirmation provided immediately?',
          a: 'Yes. An automated dispatch confirmation containing your itemized receipt and unique order reference (e.g., EL-84291) is sent via email and SMS upon transaction authorization.',
        },
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping',
      items: [
        {
          q: 'What are the delivery timelines across India?',
          a: 'Standard courier delivery typically requires 2 to 4 business days. Priority climate-controlled delivery arrives in 24 to 48 hours in metro locations (Mumbai, Delhi NCR, Bangalore, Hyderabad, Chennai, Kolkata).',
        },
        {
          q: 'Is shipping complimentary?',
          a: 'Yes, all orders above ₹4,000 qualify for complimentary insured priority delivery. Orders below ₹4,000 incur a standard ₹149 delivery charge.',
        },
        {
          q: 'How are the bottles packaged for transit?',
          a: 'Each flacon is ensconced in custom shockproof archival boxes with tamper-evident seals to withstand regional courier handling and transit temperature variations.',
        },
      ],
    },
    {
      id: 'returns',
      title: 'Returns & Trials',
      items: [
        {
          q: 'What is the Discovery Trial return policy?',
          a: 'Every 50ml or 100ml full flacon is accompanied by a complimentary 2ml matching sample vial. We recommend testing the sample vial first. If the scent does not harmonize with your skin chemistry, return the unopened full flacon within 14 days for a full refund or exchange.',
        },
        {
          q: 'How do I initiate a return?',
          a: 'Visit your Account portal or message our concierge with your order number. We will arrange a complimentary courier pickup at your doorstep.',
        },
      ],
    },
    {
      id: 'payments',
      title: 'Payments',
      items: [
        {
          q: 'What payment methods are supported?',
          a: 'We accept all major UPI applications (Google Pay, PhonePe, Paytm), Visa, MasterCard, American Express, Net Banking, and Cash on Delivery (COD) for eligible domestic pin codes.',
        },
        {
          q: 'Is payment processing secure?',
          a: 'Yes. Transactions are routed through 256-bit SSL encrypted bank gateways backed by certified Razorpay and Stripe infrastructure. We never store raw credit card credentials.',
        },
      ],
    },
    {
      id: 'custom-perfumes',
      title: 'Custom Perfumes',
      items: [
        {
          q: 'How does "Create Your Signature Scent" work?',
          a: 'Our bespoke atelier guides you through 5 immersive sensory choices: your core personality essence, desired fragrance family, specific botanical heart notes, flacon silhouette, and custom engraved label name. Your unique formula is cataloged in your patron account for lifetime reordering.',
        },
        {
          q: 'Can I reorder my custom perfume later?',
          a: 'Absolutely. Every custom perfume formulation is cataloged in your account under "My Custom Perfumes." You can reorder an identical fresh batch anytime with one click.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          q: 'Do I need an account to place an order?',
          a: 'You can check out as a guest, but creating an account preserves your order tracking, custom bespoke formulas, address book, and grants access to exclusive patron discovery privileges.',
        },
        {
          q: 'How do I reset my account password?',
          a: 'Click "Sign In" in the header, select "Forgot Password", and enter your registered email. A secure recovery link will be dispatched immediately.',
        },
      ],
    },
  ];

  const categories = [
    { id: 'all', title: 'All Categories' },
    ...faqData.map(c => ({ id: c.id, title: c.title })),
  ];

  // Filter categories and items based on search and selected category
  const filteredCategories = faqData
    .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          !searchQuery.trim() ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 lg:py-20 text-[#292522]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#756B63] hover:text-[#292522] transition-colors mb-8 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-4 h-4 text-[#B8945F]" />
          <span>Back to Boutique</span>
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>Maison Concierge Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="mt-3 text-sm text-[#756B63] leading-relaxed">
            Everything you need to know about our natural French botanical formulations, bespoke flacon atelier, ordering, and delivery.
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-[#B8945F] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search questions (e.g. returns, longevity, bespoke)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DDD2] text-xs text-[#292522] outline-none rounded-xs focus:border-[#292522] shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-6 border-b border-[#E8DDD2]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#292522] text-white shadow-xs'
                  : 'bg-white border border-[#E8DDD2] text-[#756B63] hover:border-[#292522] hover:text-[#292522]'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#E8DDD2] rounded-xs p-8">
              <p className="text-sm text-[#756B63]">No questions found matching "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs uppercase tracking-wider font-semibold text-[#B8945F] hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredCategories.map(cat => (
              <div key={cat.id} className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold pl-1">
                  {cat.title}
                </h3>

                <div className="space-y-2.5">
                  {cat.items.map((item, idx) => {
                    const itemKey = `${cat.id}-${idx}`;
                    const isExpanded = expandedIndex === itemKey;

                    return (
                      <div
                        key={itemKey}
                        className="bg-white border border-[#E8DDD2] rounded-xs overflow-hidden transition-all duration-200 shadow-xs"
                      >
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : itemKey)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#FAF3EC]/50 transition-colors"
                        >
                          <span className="font-serif-luxury text-base sm:text-lg text-[#292522] font-normal">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#B8945F] shrink-0 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180 text-[#292522]' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-[#756B63] leading-relaxed border-t border-[#E8DDD2]/60 pt-3 animate-fade-in font-light">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions Concierge Card */}
        <div className="mt-16 p-8 bg-[#FAF3EC] border border-[#E8DDD2] rounded-sm text-center max-w-xl mx-auto space-y-3 shadow-xs">
          <MessageSquare className="w-8 h-8 text-[#B8945F] mx-auto" />
          <h4 className="font-serif-luxury text-2xl text-[#292522]">
            Need Private Olfactory Advice?
          </h4>
          <p className="text-xs text-[#756B63] leading-relaxed max-w-md mx-auto">
            Our master fragrance consultants and Grasse distillers are available for private consultations and custom commissions.
          </p>
          <div className="pt-2">
            <button
              onClick={onContactConcierge}
              className="px-6 py-3 bg-[#292522] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#B8945F] transition-colors rounded-xs shadow-xs cursor-pointer"
            >
              Contact Concierge
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
