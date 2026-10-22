import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface FragranceFinderProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
}

export const FragranceFinder: React.FC<FragranceFinderProps> = ({ products, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<{
    mood: string;
    notes: string;
    occasion: string;
  }>({
    mood: '',
    notes: '',
    occasion: '',
  });

  const moods = [
    { id: 'Fresh', label: 'Fresh & Uplifting', desc: 'Crisp, invigorating, and solar' },
    { id: 'Romantic', label: 'Romantic & Sensual', desc: 'Soft, intimate, and enchanting' },
    { id: 'Mysterious', label: 'Mysterious & Enigmatic', desc: 'Dark, smoky, and compelling' },
    { id: 'Bold', label: 'Bold & Regal', desc: 'Commanding, opulent, and grand' },
    { id: 'Calm', label: 'Calm & Meditative', desc: 'Serene, grounding, and tranquil' },
  ];

  const notePreferences = [
    { id: 'Floral', label: 'Floral', desc: 'Damask rose, jasmine, orange blossom' },
    { id: 'Woody', label: 'Woody', desc: 'Sandalwood, cedar, smoked vetiver' },
    { id: 'Citrus', label: 'Citrus', desc: 'Calabrian bergamot, grapefruit, neroli' },
    { id: 'Vanilla', label: 'Vanilla', desc: 'Madagascar bourbon vanilla, tonka bean' },
    { id: 'Amber', label: 'Amber', desc: 'Golden benzoin, warm resins, labdanum' },
    { id: 'Musk', label: 'Musk', desc: 'Cashmere musk, clean skin accords' },
  ];

  const occasions = [
    { id: 'Everyday', label: 'Everyday Signature', desc: 'Effortless all-day presence' },
    { id: 'Date night', label: 'Intimate Date Nights', desc: 'Magnetic sillage in close proximity' },
    { id: 'Work', label: 'Executive & Creative Work', desc: 'Polished, focused, and sophisticated' },
    { id: 'Special occasions', label: 'Grand Evenings & Galas', desc: 'Unforgettable, high-projection aura' },
  ];

  // Scoring algorithm to determine best fragrance match
  const getRecommendation = (): { product: Product; matchScore: number; reason: string } => {
    // Default fallback to signature
    let match = products.find(p => p.id === 'elasirs-01') || products[0];
    let score = 96;
    let reason = 'A versatile masterpiece harmonizing radiant florals with deep sandalwood.';

    if (answers.mood === 'Romantic' || answers.notes === 'Floral') {
      const floral = products.find(p => p.family === 'Floral' && p.id === 'fleur-blanche');
      if (floral) {
        match = floral;
        score = 98;
        reason = 'Opulent white petals and velvety tuberose tailored to your romantic sensibility.';
      }
    } else if (answers.mood === 'Calm' || answers.notes === 'Woody' || answers.occasion === 'Work') {
      const woody = products.find(p => p.family === 'Woody');
      if (woody) {
        match = woody;
        score = 97;
        reason = 'Sacred Australian sandalwood and smoked cedar provide a grounding, magnetic presence.';
      }
    } else if (answers.mood === 'Bold' || answers.mood === 'Mysterious' || answers.notes === 'Amber') {
      const oriental = products.find(p => p.family === 'Oriental' && p.id === 'velvet-oudh');
      if (oriental) {
        match = oriental;
        score = 99;
        reason = 'Extrait-strength oudh and molten amber create an intoxicating, noble signature.';
      }
    } else if (answers.mood === 'Fresh' || answers.notes === 'Citrus' || answers.occasion === 'Everyday') {
      const fresh = products.find(p => p.family === 'Fresh');
      if (fresh) {
        match = fresh;
        score = 95;
        reason = 'Marine ozone and Italian grapefruit deliver effortless clarity and vibrancy.';
      }
    }

    return { product: match, matchScore: score, reason };
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({ mood: '', notes: '', occasion: '' });
  };

  const recommended = step === 4 ? getRecommendation() : null;

  return (
    <section className="py-20 lg:py-28 bg-[#FFFDF9] border-b border-[#B8945F]/15">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#B8945F] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Olfactory Consultation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.1em] text-[#292522] uppercase">
            FIND YOUR SIGNATURE SCENT
          </h2>
          <p className="mt-3 text-sm text-[#292522]/70 max-w-xl mx-auto">
            Answer three sensory questions to reveal the fragrance that resonates with your presence.
          </p>
        </div>

        {/* Quiz Container Box */}
        <div className="bg-[#FFFFFF] border border-[#B8945F]/30 p-6 sm:p-10 shadow-2xl relative">
          {/* Progress Indicator */}
          {step <= 3 && (
            <div className="mb-8 flex items-center justify-between border-b border-[#B8945F]/20 pb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#B8945F]">
                Step 0{step} of 03
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(s => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === s ? 'w-8 bg-[#B8945F]' : s < step ? 'w-4 bg-[#B8945F]/60' : 'w-4 bg-[#FFFDF9]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Question 1: Mood */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-serif-luxury text-[#292522]">
                1. What mood do you want your fragrance to create?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {moods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, mood: m.id }));
                      setStep(2);
                    }}
                    className={`p-4 text-left border transition-all duration-200 cursor-pointer ${
                      answers.mood === m.id
                        ? 'border-[#B8945F] bg-[#FFFDF9] text-[#292522]'
                        : 'border-[#B8945F]/20 bg-[#FFFDF9]/50 text-[#292522]/80 hover:border-[#B8945F]/60 hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tracking-wide text-[#292522]">
                        {m.label}
                      </span>
                      {answers.mood === m.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-xs text-[#292522]/60 mt-1 block font-light">
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 2: Notes */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-serif-luxury text-[#292522]">
                  2. Which olfactory notes do you prefer?
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs uppercase tracking-widest text-[#B8945F] hover:underline"
                >
                  ← Back
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {notePreferences.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, notes: n.id }));
                      setStep(3);
                    }}
                    className={`p-4 text-left border transition-all duration-200 cursor-pointer ${
                      answers.notes === n.id
                        ? 'border-[#B8945F] bg-[#FFFDF9] text-[#292522]'
                        : 'border-[#B8945F]/20 bg-[#FFFDF9]/50 text-[#292522]/80 hover:border-[#B8945F]/60 hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tracking-wide text-[#292522]">
                        {n.label}
                      </span>
                      {answers.notes === n.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-xs text-[#292522]/60 mt-1 block font-light">
                      {n.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 3: Occasion */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-serif-luxury text-[#292522]">
                  3. When will you wear it?
                </h3>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs uppercase tracking-widest text-[#B8945F] hover:underline"
                >
                  ← Back
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {occasions.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, occasion: o.id }));
                      setStep(4);
                    }}
                    className={`p-4 text-left border transition-all duration-200 cursor-pointer ${
                      answers.occasion === o.id
                        ? 'border-[#B8945F] bg-[#FFFDF9] text-[#292522]'
                        : 'border-[#B8945F]/20 bg-[#FFFDF9]/50 text-[#292522]/80 hover:border-[#B8945F]/60 hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tracking-wide text-[#292522]">
                        {o.label}
                      </span>
                      {answers.occasion === o.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-xs text-[#292522]/60 mt-1 block font-light">
                      {o.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Bespoke Recommendation Result */}
          {step === 4 && recommended && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between pb-6 border-b border-[#B8945F]/20">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] block">
                    Your Personalized Match
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif-luxury text-[#292522] uppercase mt-1">
                    THE PERFECT ELASIRS MATCH
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif-luxury text-[#B8945F] tabular-nums">
                    {recommended.matchScore}%
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#292522]/60 block">
                    Affinity Score
                  </span>
                </div>
              </div>

              {/* Match Card Layout */}
              <div className="mt-8 flex flex-col md:flex-row gap-8 items-center bg-[#FFFDF9] border border-[#B8945F]/30 p-6">
                <img
                  src={recommended.product.images[0]}
                  alt={recommended.product.name}
                  referrerPolicy="no-referrer"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-cover border border-[#B8945F]/20"
                />

                <div className="flex-1 text-left">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#B8945F]">
                    {recommended.product.family} · {recommended.product.type}
                  </div>
                  <h4 className="text-2xl font-serif-luxury text-[#292522] mt-1">
                    {recommended.product.name}
                  </h4>
                  <p className="mt-2 text-xs text-[#292522]/80 leading-relaxed font-light">
                    {recommended.reason}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#B8945F]/15 text-xs text-[#292522]/70">
                    <strong className="text-[#B8945F]">Signature Notes:</strong>{' '}
                    {recommended.product.notes.top[0]} · {recommended.product.notes.heart[0]} ·{' '}
                    {recommended.product.notes.base[0]}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-serif-luxury text-[#292522] tabular-nums">
                      ₹{recommended.product.price.toLocaleString('en-IN')}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => addToCart(recommended.product)}
                        className="px-5 py-2.5 bg-[#B8945F] text-[#FFFDF9] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#292522] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        onClick={() => onSelectProduct(recommended.product.id)}
                        className="px-4 py-2.5 border border-[#B8945F]/40 text-[#292522] text-xs uppercase tracking-widest hover:border-[#B8945F] transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retake button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#292522]/60 hover:text-[#B8945F] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Scent Consultation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
