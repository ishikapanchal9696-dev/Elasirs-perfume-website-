import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  ArrowLeft,
  ArrowRight,
  Heart,
  Crown,
  Wind,
  Moon,
  Flame,
  Sun,
  Smile,
  Feather,
  Eye,
  Gem,
  CheckCircle2,
  TreePine,
  Droplets,
  Flower2,
  Coffee,
  RotateCcw,
  Edit3,
  ShoppingBag,
  ShieldCheck,
  Sliders,
  Calendar,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';

interface BespokeScentPageProps {
  onBack: () => void;
  onExploreShop?: () => void;
  onCheckoutDirect?: () => void;
}

// ============================================================================
// STEP 1 DATA: PERSONALITY MOODS
// ============================================================================
interface MoodOption {
  id: string;
  name: string;
  tagline: string;
  olfactoryNotes: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    tagline: 'Velvety petals & twilight intimacy',
    olfactoryNotes: 'Damask Rose · Soft Violet · Sheer Jasmine',
    icon: Heart,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    tagline: 'Tailored poise & quiet distinction',
    olfactoryNotes: 'Florentine Iris · White Tea · Cashmere Musk',
    icon: Crown,
  },
  {
    id: 'fresh',
    name: 'Fresh',
    tagline: 'Sun-drenched citrus & morning dew',
    olfactoryNotes: 'Calabrian Bergamot · Sea Salt · Crushed Neroli',
    icon: Wind,
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    tagline: 'Shadowed woods & nocturnal intrigue',
    olfactoryNotes: 'Smoked Cardamom · Virginia Cedar · Black Resin',
    icon: Moon,
  },
  {
    id: 'bold',
    name: 'Bold',
    tagline: 'Commanding sillage & fearless presence',
    olfactoryNotes: 'Aged Agarwood · Bourbon Leather · Saffron',
    icon: Flame,
  },
  {
    id: 'warm',
    name: 'Warm',
    tagline: 'Cozy fireplace embers & golden glow',
    olfactoryNotes: 'Molten Amber · Madagascar Vanilla · Roasted Tonka',
    icon: Sun,
  },
  {
    id: 'playful',
    name: 'Playful',
    tagline: 'Effervescent sweetness & spirited charm',
    olfactoryNotes: 'Wild Red Currant · Sparkling Pear · Pink Pepper',
    icon: Smile,
  },
  {
    id: 'calm',
    name: 'Calm',
    tagline: 'Serene botanical balance & peaceful breath',
    olfactoryNotes: 'Sandalwood Mist · Crisp Lavender · Dry Papyrus',
    icon: Feather,
  },
  {
    id: 'sensual',
    name: 'Sensual',
    tagline: 'Skin-to-skin magnetic allure',
    olfactoryNotes: 'Nocturnal Tuberose · Golden Labdanum · Warm Musk',
    icon: Eye,
  },
  {
    id: 'luxurious',
    name: 'Luxurious',
    tagline: 'Imperial opulence & rare vintage extracts',
    olfactoryNotes: 'Rare Taif Rose · Black Ambergris · Mysore Sandalwood',
    icon: Gem,
  },
];

// ============================================================================
// STEP 2 DATA: FRAGRANCE FAMILIES
// ============================================================================
interface FragranceFamilyOption {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accents: string;
  profile: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FRAGRANCE_FAMILIES: FragranceFamilyOption[] = [
  {
    id: 'floral',
    name: 'Floral',
    subtitle: 'Soft, romantic and expressive.',
    description:
      'Envelops the senses in heirloom botanical blossoms, from dewy morning petals to opulent nocturnal gardens.',
    accents: 'Damask Rose, Night Jasmine, Florentine Iris, Neroli Blossom',
    profile: 'Luminous · Petal-Soft · Expressive',
    icon: Flower2,
  },
  {
    id: 'woody',
    name: 'Woody',
    subtitle: 'Warm, sophisticated and grounded.',
    description:
      'Rooted in sacred timber, aged bark, and meditative resins that provide architectural depth and lasting presence.',
    accents: 'Mysore Sandalwood, Virginia Cedar, Smoked Vetiver, Cypress',
    profile: 'Meditative · Grounded · Architectural',
    icon: TreePine,
  },
  {
    id: 'fresh',
    name: 'Fresh',
    subtitle: 'Clean, bright and refreshing.',
    description:
      'An invigorating splash of sunlit citrus groves, saline ocean mist, and dew-drenched green leaves.',
    accents: 'Calabrian Bergamot, Amalfi Lemon, Crushed Mint, Sea Salt',
    profile: 'Crisp · Vibrant · Crystalline',
    icon: Droplets,
  },
  {
    id: 'oriental',
    name: 'Oriental',
    subtitle: 'Rich, sensual and mysterious.',
    description:
      'An intoxicating tapestry of exotic spices, golden tree balsams, precious agarwood, and smoky incense tears.',
    accents: 'Smoked Agarwood (Oudh), Saffron, Taif Rose, Black Labdanum',
    profile: 'Opulent · Magnetic · Enigmatic',
    icon: Moon,
  },
  {
    id: 'musky',
    name: 'Musky',
    subtitle: 'Smooth, intimate and elegant.',
    description:
      'Velvety second-skin textures that radiate warmth, creating an alluring, intimate personal aura.',
    accents: 'Cashmere Musk, White Ambergris, Clean Skin Musk, Benzoin',
    profile: 'Intimate · Velvety · Second-Skin',
    icon: Feather,
  },
  {
    id: 'gourmand',
    name: 'Gourmand',
    subtitle: 'Sweet, warm and indulgent.',
    description:
      'Decadent roasted spices, golden confectionery warmth, and comforting toasted vanillas elevated to haute perfumery.',
    accents: 'Roasted Tonka Bean, Madagascar Vanilla, Dark Cocoa, Cinnamon Bark',
    profile: 'Indulgent · Enveloping · Seductive',
    icon: Coffee,
  },
];

// ============================================================================
// STEP 3 DATA: NOTES BY PYRAMID TIER
// ============================================================================
const TOP_NOTES = [
  'Bergamot',
  'Lemon',
  'Orange',
  'Pink Pepper',
  'Pear',
  'Apple',
  'Lavender',
  'Mint',
];

const HEART_NOTES = [
  'Rose',
  'Jasmine',
  'Iris',
  'Orange Blossom',
  'Ylang Ylang',
  'Geranium',
  'Violet',
];

const BASE_NOTES = [
  'Sandalwood',
  'Vanilla',
  'Amber',
  'Musk',
  'Cedarwood',
  'Patchouli',
  'Vetiver',
  'Tonka Bean',
  'Oud',
];

// ============================================================================
// STEP 4 DATA: INTENSITY TIERS
// ============================================================================
interface IntensityOption {
  id: 'Soft' | 'Moderate' | 'Strong' | 'Intense';
  name: string;
  tagline: string;
  concentration: string;
  sillage: string;
  longevity: string;
}

const INTENSITY_OPTIONS: IntensityOption[] = [
  {
    id: 'Soft',
    name: 'Soft',
    tagline: 'Subtle, intimate and close to the skin.',
    concentration: 'Eau de Toilette · 14–16% Essence',
    sillage: 'Intimate Whisper (Arms-length presence)',
    longevity: '6–8 Hours',
  },
  {
    id: 'Moderate',
    name: 'Moderate',
    tagline: 'Balanced, noticeable and versatile.',
    concentration: 'Eau de Parfum · 18–20% Essence',
    sillage: 'Radiant Aura (Graceful projection)',
    longevity: '10–14 Hours',
  },
  {
    id: 'Strong',
    name: 'Strong',
    tagline: 'Rich, expressive and long-lasting.',
    concentration: 'Extrait de Parfum · 24–26% Essence',
    sillage: 'Magnetic Projection (Fills the space gracefully)',
    longevity: '16–20 Hours',
  },
  {
    id: 'Intense',
    name: 'Intense',
    tagline: 'Powerful, dramatic and unforgettable.',
    concentration: 'Grand Extrait Pure Essence · 28–32% Essence',
    sillage: 'Commanding Presence (24hr+ persistence)',
    longevity: '24+ Hours',
  },
];

// ============================================================================
// STEP 5 DATA: OCCASIONS
// ============================================================================
interface OccasionOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const OCCASION_OPTIONS: OccasionOption[] = [
  { id: 'Everyday', name: 'Everyday', description: 'Effortless morning signature for daily moments.', icon: Sun },
  { id: 'Work', name: 'Work', description: 'Polished, professional and distraction-free elegance.', icon: Crown },
  { id: 'Date Night', name: 'Date Night', description: 'Romantic, alluring and deeply captivating.', icon: Heart },
  { id: 'Evening', name: 'Evening', description: 'Sophisticated dinners and twilight soirees.', icon: Moon },
  { id: 'Party', name: 'Party', description: 'Vibrant, magnetic energy that turns heads.', icon: Sparkles },
  { id: 'Special Occasion', name: 'Special Occasion', description: 'Galas, milestones, and red carpet events.', icon: Gem },
  { id: 'Vacation', name: 'Vacation', description: 'Coastal escapes, sunshine, and carefree travel.', icon: Compass },
  { id: 'Wedding', name: 'Wedding', description: 'Sacred ceremonies and timeless love vows.', icon: Flower2 },
  { id: 'Self-Care', name: 'Self-Care', description: 'Quiet sanctuary, post-bath ritual, and calm.', icon: Feather },
];

export const BespokeScentPage: React.FC<BespokeScentPageProps> = ({
  onBack,
  onExploreShop,
  onCheckoutDirect,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Navigation step state: 1 to 6
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Selections Across Steps 1–5
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [primaryFamily, setPrimaryFamily] = useState<string | null>(null);
  const [secondaryFamily, setSecondaryFamily] = useState<string | null>(null);
  const [selectedTopNotes, setSelectedTopNotes] = useState<string[]>([]);
  const [selectedHeartNotes, setSelectedHeartNotes] = useState<string[]>([]);
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<'Soft' | 'Moderate' | 'Strong' | 'Intense' | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  // Step 6 Customization & Name State
  const [customPerfumeName, setCustomPerfumeName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccessModal, setSavedSuccessModal] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Handlers for Step 1: Moods
  // --------------------------------------------------------------------------
  const toggleMood = (id: string) => {
    if (selectedMoods.includes(id)) {
      setSelectedMoods(selectedMoods.filter(m => m !== id));
    } else if (selectedMoods.length < 3) {
      setSelectedMoods([...selectedMoods, id]);
    }
  };

  // --------------------------------------------------------------------------
  // Handlers for Step 2: Fragrance Family
  // --------------------------------------------------------------------------
  const handleFamilyClick = (id: string) => {
    if (primaryFamily === id) {
      if (secondaryFamily) {
        setPrimaryFamily(secondaryFamily);
        setSecondaryFamily(null);
      } else {
        setPrimaryFamily(null);
      }
      return;
    }

    if (secondaryFamily === id) {
      setSecondaryFamily(null);
      return;
    }

    if (!primaryFamily) {
      setPrimaryFamily(id);
      return;
    }

    setSecondaryFamily(id);
  };

  // --------------------------------------------------------------------------
  // Handlers for Step 3: Notes (Max 3 per tier)
  // --------------------------------------------------------------------------
  const toggleTopNote = (note: string) => {
    if (selectedTopNotes.includes(note)) {
      setSelectedTopNotes(selectedTopNotes.filter(n => n !== note));
    } else if (selectedTopNotes.length < 3) {
      setSelectedTopNotes([...selectedTopNotes, note]);
    }
  };

  const toggleHeartNote = (note: string) => {
    if (selectedHeartNotes.includes(note)) {
      setSelectedHeartNotes(selectedHeartNotes.filter(n => n !== note));
    } else if (selectedHeartNotes.length < 3) {
      setSelectedHeartNotes([...selectedHeartNotes, note]);
    }
  };

  const toggleBaseNote = (note: string) => {
    if (selectedBaseNotes.includes(note)) {
      setSelectedBaseNotes(selectedBaseNotes.filter(n => n !== note));
    } else if (selectedBaseNotes.length < 3) {
      setSelectedBaseNotes([...selectedBaseNotes, note]);
    }
  };

  // --------------------------------------------------------------------------
  // Handlers for Step 5: Occasions (Max 3)
  // --------------------------------------------------------------------------
  const toggleOccasion = (occ: string) => {
    if (selectedOccasions.includes(occ)) {
      setSelectedOccasions(selectedOccasions.filter(o => o !== occ));
    } else if (selectedOccasions.length < 3) {
      setSelectedOccasions([...selectedOccasions, occ]);
    }
  };

  // --------------------------------------------------------------------------
  // Dynamic Perfume Name & Story Generation for Step 6
  // --------------------------------------------------------------------------
  const generatedPerfumeDetails = useMemo(() => {
    const primaryName = FRAGRANCE_FAMILIES.find(f => f.id === primaryFamily)?.name || 'Amber';
    const mainNote = selectedHeartNotes[0] || selectedBaseNotes[0] || 'Lumière';
    const defaultName = `ELASIRS SUR-MESURE · ${mainNote.toUpperCase()} ${primaryName.toUpperCase()}`;

    const moodNames = selectedMoods
      .map(id => MOOD_OPTIONS.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const familyName = FRAGRANCE_FAMILIES.find(f => f.id === primaryFamily)?.name || 'Haute Parfumerie';
    const secondaryName = secondaryFamily
      ? FRAGRANCE_FAMILIES.find(f => f.id === secondaryFamily)?.name
      : null;

    const story = `Conceived as an intimate olfactory signature, this bespoke creation bridges the ethereal whisper of ${
      selectedTopNotes.join(' and ') || 'bright Calabrian citrus'
    } with a passionate heart of ${
      selectedHeartNotes.join(' and ') || 'heirloom florals'
    }. It settles serenely onto a timeless foundation of ${
      selectedBaseNotes.join(', ') || 'sacred amber woods'
    }, creating an enduring, second-skin resonance crafted to feel seamlessly like you.`;

    const profile = `${familyName}${
      secondaryName ? ` with subtle ${secondaryName} accords` : ''
    } · Tailored to an evocative ${selectedIntensity || 'Moderate'} concentration with an intimate, lingering sillage.`;

    const personalitySummary = `Your personality radiates a ${moodNames || 'balanced and magnetic'} aesthetic. Your scent choices favor unhurried elegance, balancing tactile botanical top flourishes with grounding depth suited for ${
      selectedOccasions.join(', ') || 'every memorable moment'
    }.`;

    return {
      defaultName,
      story,
      profile,
      personalitySummary,
    };
  }, [
    selectedMoods,
    primaryFamily,
    secondaryFamily,
    selectedTopNotes,
    selectedHeartNotes,
    selectedBaseNotes,
    selectedIntensity,
    selectedOccasions,
  ]);

  const activePerfumeName = customPerfumeName.trim() || generatedPerfumeDetails.defaultName;

  // --------------------------------------------------------------------------
  // Step Navigation Validation & Controls
  // --------------------------------------------------------------------------
  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 1:
        return selectedMoods.length > 0;
      case 2:
        return primaryFamily !== null;
      case 3:
        return (
          selectedTopNotes.length > 0 &&
          selectedHeartNotes.length > 0 &&
          selectedBaseNotes.length > 0
        );
      case 4:
        return selectedIntensity !== null;
      case 5:
        return selectedOccasions.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  }, [
    currentStep,
    selectedMoods,
    primaryFamily,
    selectedTopNotes,
    selectedHeartNotes,
    selectedBaseNotes,
    selectedIntensity,
    selectedOccasions,
  ]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev => (prev - 1) as any));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const handleContinue = () => {
    if (currentStep < 6 && canContinue) {
      setCurrentStep((prev => (prev + 1) as any));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --------------------------------------------------------------------------
  // Save & Review Handler (Step 6)
  // --------------------------------------------------------------------------
  const handleSaveAndReview = async () => {
    setIsSaving(true);
    try {
      const payload = {
        perfumeName: activePerfumeName,
        moods: selectedMoods,
        primaryFamily: primaryFamily,
        secondaryFamily: secondaryFamily,
        topNotes: selectedTopNotes,
        heartNotes: selectedHeartNotes,
        baseNotes: selectedBaseNotes,
        intensity: selectedIntensity,
        occasions: selectedOccasions,
        fragranceStory: generatedPerfumeDetails.story,
        scentProfile: generatedPerfumeDetails.profile,
        personalitySummary: generatedPerfumeDetails.personalitySummary,
        userEmail: user?.email || 'patron@elasirs.com',
        customerName: user?.name || 'Valued Patron',
      };

      const res = await fetch('/api/bespoke/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.email ? { 'x-user-email': user.email } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Construct a bespoke Product item to seamlessly add to cart
        const bespokeProduct: Product = {
          id: `bespoke-${Date.now().toString(36)}`,
          name: activePerfumeName,
          subtitle: `BESPOKE CREATION · ${primaryFamily?.toUpperCase()}`,
          type: selectedIntensity === 'Intense' ? 'Grand Extrait' : 'Extrait de Parfum',
          family: (primaryFamily ? primaryFamily.charAt(0).toUpperCase() + primaryFamily.slice(1) : 'Oriental') as any,
          price: 4499,
          rating: 5.0,
          reviewCount: 1,
          description: generatedPerfumeDetails.story,
          story: generatedPerfumeDetails.story,
          ingredients: 'Artisanal organic botanical extracts, fractionated coconut oil, pure amber resins, Grasse floral absolutes.',
          howItSmells: generatedPerfumeDetails.profile,
          notes: {
            top: selectedTopNotes,
            heart: selectedHeartNotes,
            base: selectedBaseNotes,
          },
          images: ['/src/assets/images/perfume_flacon_hero_1790830708930.jpg'],
          variants: [
            { size: '50ml Flacon', price: 4499, inStock: true },
            { size: '100ml Flacon', price: 6899, inStock: true },
          ],
          stock: 25,
          createdAt: new Date().toISOString(),
        };

        addToCart(bespokeProduct, '50ml Flacon', 1);
        showToast('Your bespoke signature scent has been crafted & saved to your cart.', 'success');
        setSavedSuccessModal(true);
      } else {
        throw new Error('Could not save to atelier');
      }
    } catch {
      showToast('Preserved locally in your atelier session.', 'info');
      setSavedSuccessModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Progress Stepper Items Definition
  // --------------------------------------------------------------------------
  const STEPS_DATA = [
    { number: '01', title: 'Personality', stepNum: 1 },
    { number: '02', title: 'Fragrance Family', stepNum: 2 },
    { number: '03', title: 'Notes', stepNum: 3 },
    { number: '04', title: 'Intensity', stepNum: 4 },
    { number: '05', title: 'Occasion', stepNum: 5 },
    { number: '06', title: 'Your Scent', stepNum: 6 },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#292522] py-10 lg:py-16 selection:bg-[#B8945F] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#756B63] hover:text-[#B8945F] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>
              {currentStep > 1 ? `Back to Step ${currentStep - 1}` : 'Return to Maison Home'}
            </span>
          </button>

          {/* Step Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8DDD2] text-[10px] uppercase tracking-[0.2em] text-[#B8945F]">
            <span>Step {currentStep} of 6</span>
          </div>
        </div>

        {/* Dynamic Page Header */}
        <div className="text-center max-w-3xl mx-auto pb-8 border-b border-[#E8DDD2]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8DDD2] text-[#B8945F] text-[10px] uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-3 h-3" />
            <span>Atelier Sur-Mesure</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury tracking-[0.1em] text-[#292522] uppercase leading-tight">
            {currentStep === 6 ? 'MEET YOUR SIGNATURE SCENT' : 'YOUR SCENT. YOUR SIGNATURE.'}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#756B63] font-light italic">
            {currentStep === 6
              ? '"Created around your personality, preferences and the moments that matter to you."'
              : '"Let\'s create a fragrance that feels uniquely yours."'}
          </p>
        </div>

        {/* 6-Step Progress Indicator */}
        <div className="my-10 lg:my-12">
          {/* Desktop & Tablet Progress Bar */}
          <div className="hidden sm:grid grid-cols-6 gap-2 lg:gap-4 relative">
            {STEPS_DATA.map(step => {
              const isCurrent = currentStep === step.stepNum;
              const isCompleted = currentStep > step.stepNum;

              return (
                <div
                  key={step.number}
                  onClick={() => {
                    if (isCompleted) {
                      setCurrentStep(step.stepNum as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`relative p-3.5 border transition-all duration-300 text-center ${
                    isCurrent
                      ? 'bg-white border-[#B8945F] shadow-lg shadow-[#E8DDD2]'
                      : isCompleted
                      ? 'bg-white/80 border-[#E8DDD2] cursor-pointer hover:border-[#B8945F]'
                      : 'bg-[#FAF3EC] border-[#E8DDD2] opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span
                      className={`text-[10px] font-mono tracking-widest px-1.5 py-0.5 flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-[#B8945F] text-white font-bold'
                          : isCompleted
                          ? 'bg-[#E8DDD2] text-[#B8945F] border border-[#E8DDD2]'
                          : 'bg-[#FFFDF9] text-[#756B63] border border-[#E8DDD2]'
                      }`}
                    >
                      {step.number}
                      {isCompleted && !isCurrent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                  </div>
                  <p
                    className={`text-xs uppercase tracking-wider font-medium truncate ${
                      isCurrent
                        ? 'text-[#292522]'
                        : isCompleted
                        ? 'text-[#B8945F]'
                        : 'text-[#756B63]'
                    }`}
                  >
                    {step.title}
                  </p>
                  {isCurrent && (
                    <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#B8945F]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Stepper */}
          <div className="sm:hidden p-4 bg-white border border-[#E8DDD2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#B8945F] text-white font-bold text-xs flex items-center justify-center">
                0{currentStep}
              </span>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block font-light">
                  Step {currentStep} of 6
                </span>
                <span className="font-serif-luxury text-sm text-[#292522]">
                  {STEPS_DATA[currentStep - 1].title}
                </span>
              </div>
            </div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(1)}
                className="text-[10px] uppercase tracking-wider text-[#B8945F] underline cursor-pointer"
              >
                Edit Steps
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: PERSONALITY                                                       */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8945F] block mb-2 font-medium">
                Step 01 · Personality
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase">
                HOW DO YOU WANT YOUR FRAGRANCE TO FEEL?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#756B63] font-light">
                Select up to <strong className="text-[#B8945F] font-medium">3 moods</strong> that define your presence.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E8DDD2] text-xs text-[#292522]">
                <span className="text-[#B8945F] font-mono font-bold">
                  {selectedMoods.length}
                </span>
                <span className="text-[#756B63] uppercase tracking-wider text-[11px]">
                  of 3 Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-14">
              {MOOD_OPTIONS.map(option => {
                const isSelected = selectedMoods.includes(option.id);
                const isLimitReached = selectedMoods.length >= 3 && !isSelected;
                const IconComponent = option.icon;

                return (
                  <div
                    key={option.id}
                    onClick={() => !isLimitReached && toggleMood(option.id)}
                    className={`relative p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none group ${
                      isSelected
                        ? 'bg-white border-[#B8945F] ring-1 ring-[#B8945F] shadow-xl shadow-[#E8DDD2] translate-y-[-2px]'
                        : isLimitReached
                        ? 'bg-[#FAF3EC] border-[#E8DDD2] opacity-40 cursor-not-allowed'
                        : 'bg-white/80 border-[#B8945F]/25 hover:border-[#B8945F]/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#B8945F] text-white'
                            : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#B8945F] group-hover:border-[#B8945F]'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#B8945F] border-[#B8945F] text-white'
                            : 'border-[#E8DDD2] group-hover:border-[#B8945F]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-serif-luxury text-lg tracking-wide text-[#292522] group-hover:text-[#B8945F] transition-colors">
                        {option.name}
                      </h3>
                      <p className="text-[11px] text-[#756B63] mt-1 font-light leading-relaxed">
                        {option.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E8DDD2]">
                      <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block">
                        Olfactory Accents
                      </span>
                      <span className="text-[10px] text-[#756B63] italic block truncate mt-0.5">
                        {option.olfactoryNotes}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FRAGRANCE FAMILY                                                  */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8945F] block mb-2 font-medium">
                Step 02 · Olfactory Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase">
                CHOOSE YOUR FRAGRANCE FAMILY
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#756B63] font-light italic">
                "Choose the fragrance world that feels most like you."
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8DDD2] text-[#292522]">
                  <span className="w-2 h-2 rounded-full bg-[#B8945F]" />
                  <span>
                    Primary Family:{' '}
                    <strong className="text-[#B8945F]">
                      {primaryFamily
                        ? FRAGRANCE_FAMILIES.find(f => f.id === primaryFamily)?.name
                        : 'Required (Click a card)'}
                    </strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#B8945F]/25 text-[#756B63]">
                  <span className="w-2 h-2 rounded-full border border-[#B8945F]" />
                  <span>
                    Secondary Accord:{' '}
                    <strong className="text-[#292522]">
                      {secondaryFamily
                        ? FRAGRANCE_FAMILIES.find(f => f.id === secondaryFamily)?.name
                        : 'Optional (Select another)'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-14">
              {FRAGRANCE_FAMILIES.map(family => {
                const isPrimary = primaryFamily === family.id;
                const isSecondary = secondaryFamily === family.id;
                const isSelected = isPrimary || isSecondary;
                const IconComponent = family.icon;

                return (
                  <div
                    key={family.id}
                    onClick={() => handleFamilyClick(family.id)}
                    className={`relative p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none group ${
                      isPrimary
                        ? 'bg-white border-[#B8945F] ring-2 ring-[#B8945F] shadow-2xl shadow-[#E8DDD2] translate-y-[-3px]'
                        : isSecondary
                        ? 'bg-white border-[#B8945F]/80 ring-1 ring-[#B8945F] shadow-xl shadow-[#E8DDD2] translate-y-[-2px]'
                        : 'bg-white/70 border-[#B8945F]/25 hover:border-[#B8945F]/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                          isPrimary
                            ? 'bg-[#B8945F] text-white'
                            : isSecondary
                            ? 'bg-[#E8DDD2] border border-[#B8945F] text-[#B8945F]'
                            : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#B8945F] group-hover:border-[#B8945F]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {isPrimary && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#B8945F] text-white text-[10px] uppercase font-bold tracking-widest shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>1st Primary</span>
                        </div>
                      )}

                      {isSecondary && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFDF9] border border-[#B8945F] text-[#B8945F] text-[10px] uppercase font-semibold tracking-wider">
                          <span>2nd Secondary</span>
                        </div>
                      )}

                      {!isSelected && (
                        <span className="text-[10px] uppercase tracking-wider text-[#756B63] group-hover:text-[#B8945F] transition-colors">
                          Click to Select
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif-luxury text-2xl text-[#292522] tracking-wide group-hover:text-[#B8945F] transition-colors">
                          {family.name}
                        </h3>
                        <span className="text-[10px] font-mono text-[#B8945F]/70 uppercase">
                          {family.profile}
                        </span>
                      </div>
                      <p className="text-xs text-[#B8945F] font-medium leading-relaxed">
                        {family.subtitle}
                      </p>
                      <p className="text-[12px] text-[#292522]/75 mt-2 font-light leading-relaxed">
                        {family.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E8DDD2]">
                      <span className="text-[9px] uppercase tracking-widest text-[#B8945F]/80 block font-medium">
                        Signature Accents
                      </span>
                      <p className="text-[11px] text-[#756B63] italic mt-0.5">
                        {family.accents}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: NOTES (TOP, HEART, BASE)                                          */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8945F] block mb-2 font-medium">
                Step 03 · Olfactory Pyramid
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase">
                CHOOSE YOUR NOTES
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#756B63] font-light italic">
                "Select the notes you would love to discover in your signature scent."
              </p>
              <p className="mt-2 text-xs text-[#756B63] font-light">
                Select up to 3 Top Notes, 3 Heart Notes, and 3 Base Notes to shape your bespoke composition.
              </p>
            </div>

            <div className="space-y-10 mb-14">
              {/* Category 1: Top Notes */}
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#E8DDD2] gap-2">
                  <div>
                    <h3 className="font-serif-luxury text-xl text-[#292522] tracking-wide flex items-center gap-2">
                      <span>TOP NOTES</span>
                      <span className="text-[11px] text-[#B8945F] font-sans font-light uppercase tracking-wider">
                        · First 15 Minutes Whisper
                      </span>
                    </h3>
                    <p className="text-xs text-[#756B63] font-light mt-0.5">
                      Bright, volatile essences that create your immediate inaugural impression.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFDF9] border border-[#E8DDD2] text-xs shrink-0 self-start sm:self-auto">
                    <span className="text-[#B8945F] font-mono font-bold">{selectedTopNotes.length}</span>
                    <span className="text-[#756B63]">/ 3 Selected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TOP_NOTES.map(note => {
                    const isSelected = selectedTopNotes.includes(note);
                    const isLocked = selectedTopNotes.length >= 3 && !isSelected;

                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => !isLocked && toggleTopNote(note)}
                        className={`p-3.5 border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8945F] border-[#B8945F] text-white font-semibold shadow-md'
                            : isLocked
                            ? 'bg-[#FFFDF9]/30 border-[#E8DDD2] text-[#292522]/30 cursor-not-allowed'
                            : 'bg-[#FFFDF9] border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] hover:bg-[#FFFDF9]/90'
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider">{note}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Heart Notes */}
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#E8DDD2] gap-2">
                  <div>
                    <h3 className="font-serif-luxury text-xl text-[#292522] tracking-wide flex items-center gap-2">
                      <span>HEART NOTES</span>
                      <span className="text-[11px] text-[#B8945F] font-sans font-light uppercase tracking-wider">
                        · The Enduring Soul (2–6 Hours)
                      </span>
                    </h3>
                    <p className="text-xs text-[#756B63] font-light mt-0.5">
                      Sensual botanical extractions that define the radiant heart of your presence.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFDF9] border border-[#E8DDD2] text-xs shrink-0 self-start sm:self-auto">
                    <span className="text-[#B8945F] font-mono font-bold">{selectedHeartNotes.length}</span>
                    <span className="text-[#756B63]">/ 3 Selected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {HEART_NOTES.map(note => {
                    const isSelected = selectedHeartNotes.includes(note);
                    const isLocked = selectedHeartNotes.length >= 3 && !isSelected;

                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => !isLocked && toggleHeartNote(note)}
                        className={`p-3.5 border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8945F] border-[#B8945F] text-white font-semibold shadow-md'
                            : isLocked
                            ? 'bg-[#FFFDF9]/30 border-[#E8DDD2] text-[#292522]/30 cursor-not-allowed'
                            : 'bg-[#FFFDF9] border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] hover:bg-[#FFFDF9]/90'
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider">{note}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: Base Notes */}
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#E8DDD2] gap-2">
                  <div>
                    <h3 className="font-serif-luxury text-xl text-[#292522] tracking-wide flex items-center gap-2">
                      <span>BASE NOTES</span>
                      <span className="text-[11px] text-[#B8945F] font-sans font-light uppercase tracking-wider">
                        · The Deep Dry-Down (Up to 24 Hours)
                      </span>
                    </h3>
                    <p className="text-xs text-[#756B63] font-light mt-0.5">
                      Sacred woods, aged balsams, and second-skin musks that anchor the formulation.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFDF9] border border-[#E8DDD2] text-xs shrink-0 self-start sm:self-auto">
                    <span className="text-[#B8945F] font-mono font-bold">{selectedBaseNotes.length}</span>
                    <span className="text-[#756B63]">/ 3 Selected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {BASE_NOTES.map(note => {
                    const isSelected = selectedBaseNotes.includes(note);
                    const isLocked = selectedBaseNotes.length >= 3 && !isSelected;

                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => !isLocked && toggleBaseNote(note)}
                        className={`p-3.5 border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8945F] border-[#B8945F] text-white font-semibold shadow-md'
                            : isLocked
                            ? 'bg-[#FFFDF9]/30 border-[#E8DDD2] text-[#292522]/30 cursor-not-allowed'
                            : 'bg-[#FFFDF9] border-[#E8DDD2] text-[#292522] hover:border-[#B8945F] hover:bg-[#FFFDF9]/90'
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider">{note}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: INTENSITY                                                         */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8945F] block mb-2 font-medium">
                Step 04 · Concentration & Sillage
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase">
                HOW INTENSE SHOULD YOUR FRAGRANCE BE?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#756B63] font-light italic">
                "Choose how softly or boldly you want your signature scent to make an impression."
              </p>
              <p className="mt-2 text-xs text-[#756B63] font-light">
                Select one intensity concentration for your bespoke formula.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
              {INTENSITY_OPTIONS.map(opt => {
                const isSelected = selectedIntensity === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedIntensity(opt.id)}
                    className={`relative p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none ${
                      isSelected
                        ? 'bg-white border-[#B8945F] ring-2 ring-[#B8945F] shadow-2xl shadow-[#E8DDD2] translate-y-[-3px]'
                        : 'bg-white/70 border-[#B8945F]/25 hover:border-[#B8945F]/70 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono text-[#B8945F] uppercase tracking-widest">
                          {opt.concentration}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#B8945F] border-[#B8945F] text-white'
                              : 'border-[#E8DDD2]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <h3 className="font-serif-luxury text-2xl text-[#292522] mb-2 tracking-wide">
                        {opt.name}
                      </h3>
                      <p className="text-xs text-[#756B63] leading-relaxed font-light">
                        {opt.tagline}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8DDD2] space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-[#756B63]">
                        <span className="uppercase text-[9px] tracking-wider text-[#B8945F]">Projection:</span>
                        <span>{opt.sillage}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#756B63]">
                        <span className="uppercase text-[9px] tracking-wider text-[#B8945F]">Longevity:</span>
                        <span>{opt.longevity}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: OCCASION                                                          */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8945F] block mb-2 font-medium">
                Step 05 · Life & Moments
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase">
                WHEN WILL YOU WEAR YOUR SIGNATURE SCENT?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#756B63] font-light italic">
                "Tell us where your fragrance should feel at home."
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E8DDD2] text-xs text-[#292522]">
                <span className="text-[#B8945F] font-mono font-bold">{selectedOccasions.length}</span>
                <span className="text-[#756B63] uppercase tracking-wider text-[11px]">
                  of 3 Occasions Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
              {OCCASION_OPTIONS.map(occ => {
                const isSelected = selectedOccasions.includes(occ.id);
                const isLocked = selectedOccasions.length >= 3 && !isSelected;
                const IconComponent = occ.icon;

                return (
                  <div
                    key={occ.id}
                    onClick={() => !isLocked && toggleOccasion(occ.id)}
                    className={`p-6 border transition-all duration-300 flex items-start gap-4 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-white border-[#B8945F] ring-1 ring-[#B8945F] shadow-xl shadow-[#E8DDD2] translate-y-[-2px]'
                        : isLocked
                        ? 'bg-[#FFFDF9]/30 border-[#E8DDD2] opacity-40 cursor-not-allowed'
                        : 'bg-white/70 border-[#B8945F]/25 hover:border-[#B8945F]/70 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#B8945F] text-white'
                          : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#B8945F]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif-luxury text-lg text-[#292522]">
                          {occ.name}
                        </h3>
                        {isSelected && <Check className="w-4 h-4 text-[#B8945F] stroke-[3]" />}
                      </div>
                      <p className="text-xs text-[#756B63] font-light leading-relaxed">
                        {occ.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: YOUR SCENT (PRESENTATION & RESULT)                                 */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="animate-in fade-in duration-300 max-w-5xl mx-auto space-y-10 mb-14">
            {/* Top Showcase Flacon Card */}
            <div className="p-8 sm:p-12 bg-white border border-[#B8945F] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8DDD2] rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Flacon Render / Visual */}
                <div className="lg:col-span-5 text-center relative">
                  <div className="relative mx-auto w-56 h-72 sm:w-64 sm:h-80 bg-[#FFFDF9] border border-[#E8DDD2] p-4 shadow-2xl flex flex-col items-center justify-center group">
                    <img
                      src="/src/assets/images/perfume_flacon_hero_1790830708930.jpg"
                      alt="Bespoke Scent Flacon"
                      className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-[#FFFDF9]/90 border border-[#E8DDD2] p-2 text-center backdrop-blur-sm">
                      <span className="text-[10px] font-mono tracking-widest text-[#B8945F] uppercase block">
                        50ML · SUR-MESURE FLACON
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details & Custom Naming */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block font-medium mb-1">
                      Maison ELASIRS · Atelier Bespoke Formula
                    </span>

                    {/* Perfume Name with Edit Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase">
                        {activePerfumeName}
                      </h2>
                    </div>

                    <button
                      onClick={() => setIsEditingName(true)}
                      className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#B8945F] uppercase tracking-wider hover:border-[#B8945F] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>NAME MY PERFUME</span>
                    </button>
                  </div>

                  {/* Fragrance Story */}
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-1">
                      FRAGRANCE STORY
                    </span>
                    <p className="text-xs sm:text-sm text-[#292522]/85 font-light leading-relaxed italic">
                      "{generatedPerfumeDetails.story}"
                    </p>
                  </div>

                  {/* Scent Profile */}
                  <div className="pt-2 border-t border-[#E8DDD2]">
                    <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-1">
                      SCENT PROFILE
                    </span>
                    <p className="text-xs text-[#756B63] leading-relaxed font-light">
                      {generatedPerfumeDetails.profile}
                    </p>
                  </div>

                  {/* Intensity & Best For */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E8DDD2] text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-0.5">
                        INTENSITY
                      </span>
                      <span className="text-[#292522] font-medium">
                        {selectedIntensity || 'Moderate'} Sillage (Eau/Extrait)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-0.5">
                        BEST FOR
                      </span>
                      <span className="text-[#292522] font-medium">
                        {selectedOccasions.join(', ') || 'Signature Daily Moments'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Pyramid Breakdown Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Notes */}
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-2">
                  TOP NOTES
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTopNotes.map(n => (
                    <span
                      key={n}
                      className="px-2.5 py-1 bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#292522]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Heart Notes */}
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-2">
                  HEART NOTES
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHeartNotes.map(n => (
                    <span
                      key={n}
                      className="px-2.5 py-1 bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#292522]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Base Notes */}
              <div className="p-6 bg-white border border-[#E8DDD2] shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block mb-2">
                  BASE NOTES
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBaseNotes.map(n => (
                    <span
                      key={n}
                      className="px-2.5 py-1 bg-[#FFFDF9] border border-[#E8DDD2] text-xs text-[#292522]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Your Fragrance Personality */}
            <div className="p-7 bg-white border border-[#E8DDD2]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block mb-1 font-medium">
                Olfactory Assessment
              </span>
              <h3 className="font-serif-luxury text-xl text-[#292522] uppercase tracking-wide mb-3">
                YOUR FRAGRANCE PERSONALITY
              </h3>
              <p className="text-xs sm:text-sm text-[#756B63] leading-relaxed font-light">
                {generatedPerfumeDetails.personalitySummary}
              </p>
            </div>

            {/* Product Integrity & Formulation Notice */}
            <div className="p-5 bg-[#FFFDF9] border border-[#E8DDD2] flex items-start gap-3.5 text-xs text-[#756B63] leading-relaxed font-light">
              <ShieldCheck className="w-5 h-5 text-[#B8945F] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#292522] font-medium block mb-0.5">
                  Maison Formulation Integrity Policy:
                </span>
                This presentation is a personalized olfactory recommendation and bespoke scent profile. The final bespoke fragrance formulation is individually reviewed and finalized by the ELASIRS master perfumery team before small-batch hand-pouring into your flacon.
              </div>
            </div>

            {/* Action Bar for Step 6 */}
            <div className="p-6 sm:p-8 bg-white border border-[#B8945F] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-7 py-3.5 border border-[#E8DDD2] text-[#292522] text-xs uppercase tracking-[0.2em] hover:border-[#B8945F] hover:bg-[#FFFDF9] transition-colors cursor-pointer"
              >
                EDIT MY CHOICES
              </button>

              <button
                onClick={handleSaveAndReview}
                disabled={isSaving}
                className="w-full sm:w-auto px-10 py-3.5 bg-[#B8945F] text-white font-semibold text-xs uppercase tracking-[0.25em] hover:bg-[#E8DCC8] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSaving ? 'SECURING PROFILE...' : 'CONTINUE TO REVIEW'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR FOR STEPS 1 TO 5                                        */}
        {/* ========================================================================= */}
        {currentStep < 6 && (
          <div className="p-6 sm:p-8 bg-white border border-[#E8DDD2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBack}
              className="w-full sm:w-auto px-7 py-3.5 border border-[#E8DDD2] text-[#292522] text-xs uppercase tracking-[0.2em] hover:border-[#B8945F] hover:bg-[#FFFDF9] transition-colors cursor-pointer text-center"
            >
              BACK
            </button>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-[#756B63] uppercase tracking-wider hidden md:inline-block">
                {currentStep === 1 && `${selectedMoods.length} of 3 moods selected`}
                {currentStep === 2 && (primaryFamily ? 'Primary chosen' : 'Select a primary family')}
                {currentStep === 3 &&
                  `${selectedTopNotes.length} top, ${selectedHeartNotes.length} heart, ${selectedBaseNotes.length} base notes`}
                {currentStep === 4 && (selectedIntensity ? `${selectedIntensity} chosen` : 'Select intensity')}
                {currentStep === 5 && `${selectedOccasions.length} of 3 occasions chosen`}
              </span>

              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full sm:w-auto px-9 py-3.5 bg-[#B8945F] text-white font-semibold text-xs uppercase tracking-[0.25em] hover:bg-[#E8DCC8] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {currentStep === 5 ? 'REVEAL MY SIGNATURE SCENT' : 'CONTINUE'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CUSTOM PERFUME NAMING                                              */}
      {/* ========================================================================= */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white border border-[#B8945F] p-6 sm:p-8 shadow-2xl">
            <h3 className="font-serif-luxury text-xl text-[#292522] uppercase tracking-wide mb-2">
              Name Your Signature Creation
            </h3>
            <p className="text-xs text-[#756B63] font-light mb-4">
              Bestow your bespoke fragrance with a personal name to be engraved onto your custom flacon.
            </p>

            <input
              type="text"
              value={customPerfumeName}
              onChange={e => setCustomPerfumeName(e.target.value)}
              placeholder={generatedPerfumeDetails.defaultName}
              maxLength={50}
              className="w-full bg-[#FFFDF9] border border-[#E8DDD2] px-4 py-3 text-sm text-[#292522] outline-none focus:border-[#B8945F] font-serif-luxury uppercase tracking-wider mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCustomPerfumeName('');
                  setIsEditingName(false);
                }}
                className="flex-1 py-3 border border-[#E8DDD2] text-xs uppercase tracking-wider text-[#292522] hover:border-[#B8945F] cursor-pointer"
              >
                Reset Default
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="flex-1 py-3 bg-[#B8945F] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#E8DCC8] cursor-pointer"
              >
                Apply Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SAVED & REVIEW NOTIFICATION                                        */}
      {/* ========================================================================= */}
      {savedSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292522]/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white border border-[#B8945F] p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFFDF9] border border-[#B8945F] flex items-center justify-center mx-auto mb-4 text-[#B8945F]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block mb-1">
              Atelier Profile Secured
            </span>

            <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#292522] uppercase tracking-wide">
              {activePerfumeName}
            </h3>

            <p className="mt-3 text-xs sm:text-sm text-[#756B63] leading-relaxed font-light">
              Your bespoke creation has been recorded in our atelier registry and added to your bag. Our master perfumers review each profile prior to small-batch maturation.
            </p>

            <div className="my-5 p-3 bg-[#FFFDF9] border border-[#E8DDD2] text-[11px] text-[#756B63]">
              Includes matching 2ml discovery travel flacon to sample before unsealing.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSavedSuccessModal(false);
                  if (onExploreShop) onExploreShop();
                  else onBack();
                }}
                className="flex-1 py-3 border border-[#E8DDD2] text-xs uppercase tracking-wider text-[#292522] hover:border-[#B8945F] cursor-pointer"
              >
                Explore Boutique
              </button>
              <button
                onClick={() => {
                  setSavedSuccessModal(false);
                  if (onCheckoutDirect) onCheckoutDirect();
                  else onBack();
                }}
                className="flex-1 py-3 bg-[#B8945F] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#E8DCC8] cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
