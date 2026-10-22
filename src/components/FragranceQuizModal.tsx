import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Star,
  ShoppingBag,
  Heart,
  Droplets,
  Clock,
  Compass,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface FragranceQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (productId: string) => void;
}

export const FragranceQuizModal: React.FC<FragranceQuizModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');

  if (!isOpen) return null;

  // Options configuration matching Phase 11
  const moods = [
    { id: 'Fresh', label: 'Fresh', desc: 'Solar citrus, sea mist & morning radiance' },
    { id: 'Romantic', label: 'Romantic', desc: 'Soft petals, velvety twilight & intimacy' },
    { id: 'Calm', label: 'Calm', desc: 'Grounding woods, clean linen & serenity' },
    { id: 'Bold', label: 'Bold', desc: 'Commanding spices, regal sillage & poise' },
    { id: 'Sensual', label: 'Sensual', desc: 'Warm ambers, second-skin musks & magnetic pull' },
    { id: 'Mysterious', label: 'Mysterious', desc: 'Aged agarwood, smoked resins & nocturnal intrigue' },
    { id: 'Playful', label: 'Playful', desc: 'Effervescent fruits, sweet almond & spirited joy' },
    { id: 'Elegant', label: 'Elegant', desc: 'Powdered iris, white tea & understated luxury' },
  ];

  const personalities = [
    { id: 'Minimal', label: 'Minimal', desc: 'Clean lines, intimate presence, effortless beauty' },
    { id: 'Confident', label: 'Confident', desc: 'Unapologetic presence that leaves an enduring memory' },
    { id: 'Creative', label: 'Creative', desc: 'Complex layered harmonies and unconventional accords' },
    { id: 'Classic', label: 'Classic', desc: 'Timeless French haute parfumerie architecture' },
    { id: 'Adventurous', label: 'Adventurous', desc: 'Exotic spice trade harvests and wild resin notes' },
    { id: 'Sophisticated', label: 'Sophisticated', desc: 'Refined distinction suited for private salons' },
  ];

  const families = [
    { id: 'Floral', label: 'Floral', desc: 'Damask rose, nocturnal jasmine & white neroli' },
    { id: 'Woody', label: 'Woody', desc: 'Mysore sandalwood, cedarwood & smoked vetiver' },
    { id: 'Fresh', label: 'Fresh', desc: 'Marine ozone, coastal citrus & dewy violet leaf' },
    { id: 'Oriental', label: 'Oriental', desc: 'Molten golden amber, aged oudh & warm saffron' },
    { id: 'Musky', label: 'Musky', desc: 'Silky cashmere musk, solar iris & skin warmth' },
    { id: 'Gourmand', label: 'Gourmand', desc: 'Bourbon vanilla bean, toasted tonka & bitter almond' },
  ];

  const noteOptions = [
    'Calabrian Bergamot',
    'Damask Rose',
    'Night-Blooming Jasmine',
    'Mysore Sandalwood',
    'Australian Sandalwood',
    'Golden Amber',
    'Kashmiri Saffron',
    'Smoky Aged Oudh',
    'Bourbon Vanilla',
    'White Musk',
    'Cotton Flower',
    'Marine Ozone',
    'Roasted Tonka Bean',
    'Cardamom Pods',
  ];

  const intensities = [
    { id: 'Soft', label: 'Soft & Intimate', desc: 'Close skin scent for personal contemplation (Arms length)' },
    { id: 'Moderate', label: 'Moderate & Elegant', desc: 'Subtle noticeable aura throughout the workday (1–2 meters)' },
    { id: 'Strong', label: 'Strong & Radiant', desc: 'Expressive projection that fills intimate rooms gracefully' },
    { id: 'Intense', label: 'Intense (Extrait)', desc: 'Supreme concentration lasting 14–24 hours with commanding sillage' },
  ];

  const occasions = [
    { id: 'Everyday', label: 'Everyday', desc: 'Effortless signature for daily moments' },
    { id: 'Work', label: 'Work & Professional', desc: 'Polished, focused and dignified elegance' },
    { id: 'Date Night', label: 'Date Night', desc: 'Magnetic intimacy and hypnotic skin warmth' },
    { id: 'Evening', label: 'Evening Events', desc: 'Rich depth tailored for twilight gatherings' },
    { id: 'Party', label: 'Party & Celebrations', desc: 'High-energy vibrancy that shines all night' },
    { id: 'Wedding', label: 'Wedding & Galas', desc: 'Couture elegance crafted for sacred memories' },
    { id: 'Vacation', label: 'Vacation & Escapes', desc: 'Breezy coastal freedom and solar ease' },
    { id: 'Self-Care', label: 'Self-Care & Quiet', desc: 'Calming, meditative sanctuary at home' },
  ];

  const budgets = [
    { id: 'accessible', label: 'Accessible Luxury (₹2,999 – ₹3,499)', desc: 'Luminous 50ml flacons with 120-day natural aging' },
    { id: 'signature', label: 'Signature Editions (₹3,500 – ₹3,999)', desc: 'Complex bouquets with rare botanical extractions' },
    { id: 'luxe', label: 'Haute Extrait Reserve (₹4,000+)', desc: 'Masterpiece 28% pure oil extraits with aged agarwoods' },
    { id: 'all', label: 'Explore All Price Points', desc: 'Recommend purely on olfactory harmony and presence' },
  ];

  const toggleNote = (note: string) => {
    setSelectedNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  // Algorithm to compute top 3–5 real ELASIRS matches
  const matchResults = useMemo(() => {
    if (currentStep < 8) return [];

    return products
      .map(product => {
        let score = 50; // base score
        const reasons: string[] = [];

        // Fragrance family match
        if (selectedFamily && product.family.toLowerCase() === selectedFamily.toLowerCase()) {
          score += 35;
          reasons.push(`Masterfully crafted in your preferred ${product.family} family.`);
        }

        // Intensity / Type match
        if (selectedIntensity) {
          if (
            (selectedIntensity === 'Intense' || selectedIntensity === 'Strong') &&
            product.type.toLowerCase().includes('extrait')
          ) {
            score += 20;
            reasons.push('Features high Extrait de Parfum concentration for lasting power.');
          } else if (
            (selectedIntensity === 'Moderate' || selectedIntensity === 'Soft') &&
            product.type.toLowerCase().includes('eau de parfum')
          ) {
            score += 20;
            reasons.push('Offers a harmonious Eau de Parfum sillage ideal for intimate everyday wear.');
          }
        }

        // Notes overlap
        const allProductNotes = [
          ...product.notes.top,
          ...product.notes.heart,
          ...product.notes.base,
        ].map(n => n.toLowerCase());

        let matchedNoteCount = 0;
        selectedNotes.forEach(sn => {
          if (allProductNotes.some(pn => pn.includes(sn.toLowerCase()) || sn.toLowerCase().includes(pn))) {
            matchedNoteCount++;
          }
        });

        if (matchedNoteCount > 0) {
          score += Math.min(matchedNoteCount * 12, 30);
          reasons.push(`Enriched with your chosen accords: ${selectedNotes.slice(0, 2).join(' and ')}.`);
        }

        // Occasion match
        if (selectedOccasion) {
          const occMatches = (product.occasions || []).some(o =>
            o.toLowerCase().includes(selectedOccasion.toLowerCase())
          );
          if (occMatches) {
            score += 15;
            reasons.push(`Designed specifically for ${selectedOccasion} moments.`);
          }
        }

        // Budget match
        if (selectedBudget === 'accessible' && product.price <= 3499) score += 15;
        if (selectedBudget === 'signature' && product.price > 3499 && product.price <= 3999) score += 15;
        if (selectedBudget === 'luxe' && product.price >= 4000) score += 15;
        if (selectedBudget === 'all') score += 10;

        // Mood alignment
        if (selectedMood) {
          const moodStr = (product.description + ' ' + product.story + ' ' + product.howItSmells).toLowerCase();
          if (moodStr.includes(selectedMood.toLowerCase())) {
            score += 10;
            reasons.push(`Evokes an authentic ${selectedMood.toLowerCase()} emotional aura.`);
          }
        }

        // Default reason if empty
        if (reasons.length === 0) {
          reasons.push(`Harmonizes with your sensory preferences via ${product.family} accords.`);
        }

        return {
          product,
          matchScore: Math.min(Math.round(score), 99),
          whyItMatches: reasons.slice(0, 2).join(' '),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4); // Top 3–5 actual ELASIRS products
  }, [
    products,
    currentStep,
    selectedMood,
    selectedPersonality,
    selectedFamily,
    selectedNotes,
    selectedIntensity,
    selectedOccasion,
    selectedBudget,
  ]);

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedMood('');
    setSelectedPersonality('');
    setSelectedFamily('');
    setSelectedNotes([]);
    setSelectedIntensity('');
    setSelectedOccasion('');
    setSelectedBudget('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#292522]/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xl rounded-sm my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD2] bg-[#FAF3EC]/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8945F]" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#B8945F]">
              FIND YOUR FRAGRANCE · SENSORY ADVISOR
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentStep > 1 && currentStep < 8 && (
              <button
                onClick={handleReset}
                className="text-[11px] uppercase tracking-wider text-[#756B63] hover:text-[#292522] flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#756B63] hover:text-[#292522] rounded-full hover:bg-white transition-colors cursor-pointer"
              aria-label="Close quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar (Steps 1–7) */}
        {currentStep <= 7 && (
          <div className="px-6 sm:px-10 pt-6 pb-2 border-b border-[#E8DDD2]/60 bg-white">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono text-[#B8945F] font-semibold text-[11px] uppercase tracking-wider">
                Step 0{currentStep} of 07
              </span>
              <span className="text-[#756B63] text-xs">
                {currentStep === 1 && 'Mood Discovery'}
                {currentStep === 2 && 'Personality'}
                {currentStep === 3 && 'Fragrance Family'}
                {currentStep === 4 && 'Botanical Notes'}
                {currentStep === 5 && 'Sillage & Intensity'}
                {currentStep === 6 && 'Ideal Occasion'}
                {currentStep === 7 && 'Preferred Tier'}
              </span>
            </div>

            {/* Stepper Dots / Bars */}
            <div className="grid grid-cols-7 gap-1.5 h-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map(s => (
                <div
                  key={s}
                  className={`rounded-full transition-all duration-300 ${
                    s === currentStep
                      ? 'bg-[#B8945F]'
                      : s < currentStep
                      ? 'bg-[#292522]'
                      : 'bg-[#E8DDD2]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          {/* STEP 1: MOOD */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  01 · Atmosphere & Sensation
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                  What mood do you want your fragrance to evoke?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                  Select the emotional aura you wish to inhabit when entering a room.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {moods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMood(m.id);
                      setCurrentStep(2);
                    }}
                    className={`p-4 rounded-xs border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedMood === m.id
                        ? 'border-[#292522] bg-[#FAF3EC] text-[#292522] shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-luxury text-lg text-[#292522]">{m.label}</span>
                      {selectedMood === m.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-[11px] text-[#756B63] leading-relaxed font-light">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PERSONALITY */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                    02 · Identity & Character
                  </span>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                    Which phrase best describes your personal style?
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                    Fragrance is invisible couture—align it with your natural poise.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {personalities.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPersonality(p.id);
                      setCurrentStep(3);
                    }}
                    className={`p-4 rounded-xs border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedPersonality === p.id
                        ? 'border-[#292522] bg-[#FAF3EC] text-[#292522] shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-luxury text-lg text-[#292522]">{p.label}</span>
                      {selectedPersonality === p.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-[11px] text-[#756B63] leading-relaxed font-light">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: FRAGRANCE FAMILY */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  03 · Olfactory Realm
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                  Which fragrance family naturally attracts you?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                  Each family represents a distinct realm of extraction and botanical materials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {families.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFamily(f.id);
                      setCurrentStep(4);
                    }}
                    className={`p-4 rounded-xs border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedFamily === f.id
                        ? 'border-[#292522] bg-[#FAF3EC] text-[#292522] shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-luxury text-lg text-[#292522]">{f.label}</span>
                      {selectedFamily === f.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-[11px] text-[#756B63] leading-relaxed font-light">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: FAVORITE NOTES */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  04 · Raw Materials & Accords
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                  Select the notes you love to smell on your skin
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                  Choose 1 to 3 notes. We will cross-reference our botanical formulations.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {noteOptions.map(note => {
                  const isSelected = selectedNotes.includes(note);
                  return (
                    <button
                      key={note}
                      onClick={() => toggleNote(note)}
                      className={`px-4 py-2.5 rounded-xs border text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#292522] bg-[#292522] text-white shadow-xs'
                          : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]'
                      }`}
                    >
                      <span>{note}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#B8945F]" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: INTENSITY */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  05 · Sillage & Concentration
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                  What intensity and projection do you desire?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                  From subtle intimate second-skin aura to commanding grand sillage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {intensities.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      setSelectedIntensity(i.id);
                      setCurrentStep(6);
                    }}
                    className={`p-4 rounded-xs border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedIntensity === i.id
                        ? 'border-[#292522] bg-[#FAF3EC] text-[#292522] shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-luxury text-lg text-[#292522]">{i.label}</span>
                      {selectedIntensity === i.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-[11px] text-[#756B63] leading-relaxed font-light">{i.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: OCCASION */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  06 · Setting & Occasion
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                  For what occasion will you primarily wear this scent?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                  Choose the setting where you want this fragrance to shine brightest.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {occasions.map(occ => (
                  <button
                    key={occ.id}
                    onClick={() => {
                      setSelectedOccasion(occ.id);
                      setCurrentStep(7);
                    }}
                    className={`p-4 rounded-xs border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedOccasion === occ.id
                        ? 'border-[#292522] bg-[#FAF3EC] text-[#292522] shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-luxury text-lg text-[#292522]">{occ.label}</span>
                      {selectedOccasion === occ.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-[11px] text-[#756B63] leading-relaxed font-light">{occ.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: BUDGET & TIER */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                  07 · Collection Tier
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#292522]">
                  Select your preferred formulation range
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#756B63] font-light">
                  Every ELASIRS flacon is aged for 120 days in Grasse cellars regardless of tier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {budgets.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBudget(b.id);
                      setCurrentStep(8);
                    }}
                    className={`p-4 rounded-xs border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${
                      selectedBudget === b.id
                        ? 'border-[#292522] bg-[#FAF3EC] text-[#292522] shadow-xs'
                        : 'border-[#E8DDD2] bg-white text-[#292522] hover:border-[#B8945F] hover:bg-[#FAF3EC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-luxury text-lg text-[#292522]">{b.label}</span>
                      {selectedBudget === b.id && <Check className="w-4 h-4 text-[#B8945F]" />}
                    </div>
                    <span className="text-[11px] text-[#756B63] leading-relaxed font-light">{b.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: YOUR MATCHES */}
          {currentStep === 8 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs text-[#B8945F] text-[11px] uppercase tracking-[0.25em] font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalized Olfactory Matches</span>
                </div>
                <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#292522] uppercase tracking-wide">
                  YOUR PERFECT MATCHES
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light leading-relaxed">
                  Based on your affinity for {selectedMood || 'refined'} aura, {selectedFamily || 'artisanal'} accords, and {selectedOccasion || 'signature'} moments, our noses recommend these authentic ELASIRS creations.
                </p>
              </div>

              {/* Recommendation Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {matchResults.map(({ product, matchScore, whyItMatches }) => (
                  <div
                    key={product.id}
                    className="p-5 sm:p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-sm flex flex-col justify-between hover:border-[#B8945F] transition-all duration-300"
                  >
                    <div>
                      {/* Top match score badge & family */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-0.5 bg-[#FAF3EC] border border-[#B8945F]/30 text-[#B8945F] text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs">
                          {matchScore}% Match Harmony
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-[#756B63] font-medium">
                          {product.family} · {product.type}
                        </span>
                      </div>

                      {/* Large prominent bottle visual */}
                      <div
                        onClick={() => {
                          onSelectProduct(product.id);
                          onClose();
                        }}
                        className="relative h-48 w-full bg-[#FAF3EC] rounded-xs overflow-hidden flex items-center justify-center p-4 cursor-pointer group mb-4 border border-[#E8DDD2]/60"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,253,249,0.95)_0%,_rgba(250,243,236,0.85)_55%,_rgba(245,232,220,0.5)_100%)]" />
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="relative z-10 max-h-[88%] object-contain drop-shadow-[0_12px_24px_rgba(41,37,34,0.15)] transition-transform duration-500 group-hover:scale-106"
                        />
                        <div className="absolute bottom-3 w-1/2 h-2.5 bg-[#756B63]/12 rounded-[100%] blur-sm pointer-events-none" />
                      </div>

                      {/* Product Name & Details */}
                      <h4
                        onClick={() => {
                          onSelectProduct(product.id);
                          onClose();
                        }}
                        className="font-serif-luxury text-xl text-[#292522] cursor-pointer hover:text-[#B8945F] transition-colors truncate"
                      >
                        {product.name}
                      </h4>

                      {/* Rating & Price */}
                      <div className="flex items-center justify-between mt-1.5 pb-3 border-b border-[#E8DDD2]">
                        <div className="flex items-center gap-1.5 text-xs text-[#756B63]">
                          <Star className="w-3.5 h-3.5 fill-[#B8945F] text-[#B8945F]" />
                          <span className="font-semibold text-[#292522]">{product.rating.toFixed(1)}</span>
                          <span>({product.reviewCount} reviews)</span>
                        </div>
                        <span className="font-semibold text-sm text-[#292522] tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* WHY IT MATCHES */}
                      <div className="mt-3 p-3 bg-[#FAF3EC] border border-[#E8DDD2]/80 rounded-xs">
                        <span className="text-[10px] uppercase tracking-widest text-[#B8945F] font-semibold block mb-0.5">
                          Why It Matches
                        </span>
                        <p className="text-xs text-[#292522] font-light leading-relaxed">
                          {whyItMatches}
                        </p>
                      </div>
                    </div>

                    {/* Actions: VIEW PRODUCT & ADD TO CART */}
                    <div className="mt-5 grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          onSelectProduct(product.id);
                          onClose();
                        }}
                        className="w-full py-2.5 bg-white border border-[#292522] text-[#292522] text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF3EC] transition-colors rounded-xs cursor-pointer text-center"
                      >
                        VIEW PRODUCT
                      </button>
                      <button
                        onClick={() => {
                          addToCart(product, product.variants[0]?.size || '50ml');
                          showToast(`${product.name} added to your shopping bag`, 'success');
                        }}
                        className="w-full py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors rounded-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ADD TO CART</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Conclusion footer */}
              <div className="pt-6 border-t border-[#E8DDD2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#756B63] hover:text-[#292522] cursor-pointer font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Fragrance Quiz</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border border-[#E8DDD2] text-xs uppercase tracking-wider text-[#292522] hover:border-[#292522] transition-colors cursor-pointer rounded-xs"
                >
                  Explore Entire Collection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Stepper Navigation (Step 2 to 7) */}
        {currentStep > 1 && currentStep < 8 && (
          <div className="px-6 sm:px-10 py-3.5 border-t border-[#E8DDD2] bg-[#FAF3EC]/50 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="text-xs uppercase tracking-widest text-[#756B63] hover:text-[#292522] flex items-center gap-1 cursor-pointer font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <span className="text-[11px] text-[#756B63] font-light hidden sm:inline">
              Curated by Maison ELASIRS master noses in Grasse
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
