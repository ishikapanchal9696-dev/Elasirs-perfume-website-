/**
 * ============================================================================
 * MAISON ELASIRS - PUBLIC BRAND KNOWLEDGE BASE & CONCIERGE CONFIGURATION
 * ============================================================================
 *
 * This file serves as the single source of truth for all public brand
 * information, fragrance descriptions, olfactory notes, policies, and FAQs
 * used by the ELASIRS Concierge AI Assistant.
 *
 * HOW TO EDIT OR ADD TO THE BRAND STORY:
 * - Update the fields in `BRAND_KNOWLEDGE.story` or `BRAND_KNOWLEDGE.philosophy`.
 * - The AI Concierge immediately incorporates these changes upon server reload.
 * - Do NOT place confidential credentials, private database passwords, or
 *   internal financials in this file; this file is strictly public knowledge.
 */

export interface PublicFragrance {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  family: 'Floral' | 'Woody' | 'Oriental' | 'Fresh';
  price: number;
  availableSizes: string[];
  inStock: boolean;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentProfile: string;
  mood: string;
  idealFor: string;
}

export interface BrandKnowledgeBase {
  brandName: string;
  owner: {
    name: string;
    title: string;
    publicBio: string;
  };
  story: {
    origin: string;
    inspiration: string;
    heritage: string;
    verifiedMilestones: string[];
  };
  philosophy: {
    coreBelief: string;
    sourcing: string;
    maturation: string;
    packaging: string;
    cleanBeauty: string;
  };
  fragrances: PublicFragrance[];
  policies: {
    shipping: {
      domesticRates: string;
      freeShippingThreshold: string;
      deliveryTimeline: string;
      packaging: string;
    };
    returns: {
      trialPolicy: string;
      window: string;
      condition: string;
      process: string;
    };
    authenticity: string;
    fragranceCare: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const BRAND_KNOWLEDGE: BrandKnowledgeBase = {
  brandName: 'ELASIRS',

  owner: {
    name: 'Ishika Darra',
    title: 'Maison Owner & Creative Director',
    publicBio:
      'Ishika Darra founded Maison ELASIRS with the singular vision of redefining modern luxury perfumery, blending time-honored Grasse botanical extractions with architectural minimalism and authentic high-concentration formulas.',
  },

  story: {
    origin:
      'Maison ELASIRS was conceived between the historic perfume ateliers of Grasse, France, and contemporary botanical sanctuaries in India. The house was born from a desire to create scents that serve as intimate olfactory signatures rather than loud commercial projections.',
    inspiration:
      'The name and aesthetic of ELASIRS draw inspiration from ancient elixir traditions where scent was revered as an invisible memory and emotional talisman. Every flacon is formulated around the delicate tension between fleeting top blossoms and eternal sacred woods.',
    heritage:
      'Formulations are matured for 120 days in temperature-regulated vessels to allow raw botanical absolutes to marry seamlessly before being poured into custom weighted glass flacons.',
    verifiedMilestones: [
      'Inaugural launch of Signature fragrance: ELASIRS NO. 01.',
      'Introduction of sustainable sandalwood and pure Damask rose extractions.',
      'Establishment of direct client concierge consultation and complimentary discovery sample program.',
    ],
  },

  philosophy: {
    coreBelief:
      'Fragrance is more than a scent. It is a memory, a mood, a signature. We believe in quiet luxury—scents that evolve intimately on the skin rather than overwhelming a room.',
    sourcing:
      'Raw botanical essences are ethically harvested from heritage preserves: bergamot from Calabria, Damask rose and nocturnal jasmine from Grasse, and sustainably cultivated sandalwood.',
    maturation:
      'We practice unhurried 120-day cold maturation to stabilize natural fragrance molecules without synthetic boosters.',
    packaging:
      'Each flacon is forged from heavyweight crystal glass, crowned with a brushed gold cap inspired by brutalist geometry, designed to be kept on your vanity as an heirloom.',
    cleanBeauty:
      '100% cruelty-free, vegan-friendly, formulated without phthalates, parabens, sulfates, or artificial colorants.',
  },

  fragrances: [
    {
      id: 'elasirs-01',
      name: 'ELASIRS NO. 01',
      subtitle: 'THE SIGNATURE',
      type: 'Eau de Parfum',
      family: 'Floral',
      price: 3499,
      availableSizes: ['50ml (₹3,499)', '100ml (₹5,499)', '10ml Travel (₹1,299)'],
      inStock: true,
      notes: {
        top: ['Calabrian Bergamot', 'Pink Pepper', 'Crushed Neroli'],
        heart: ['Damask Rose', 'Night-Blooming Jasmine', 'Florentine Iris'],
        base: ['Golden Amber', 'Mysore Sandalwood', 'Cashmere Musk'],
      },
      scentProfile:
        'Luminous, romantic and intimate. Opens with sparkling citrus and pink pepper, unfolds into delicate white florals, and settles into warm golden amber and creamy sandalwood.',
      mood: 'Romantic, radiant, and effortlessly magnetic.',
      idealFor: 'Everyday signature wear, intimate evenings, and weddings.',
    },
    {
      id: 'santal-obscura',
      name: 'SANTAL OBSCURA',
      subtitle: 'THE SACRED SMOKE',
      type: 'Extrait de Parfum',
      family: 'Woody',
      price: 3899,
      availableSizes: ['50ml (₹3,899)', '100ml (₹5,999)', '10ml Travel (₹1,399)'],
      inStock: true,
      notes: {
        top: ['Smoked Cardamom', 'Papyrus', 'Cypress Leaf'],
        heart: ['Australian Sandalwood', 'Virginia Cedar', 'Iris Root'],
        base: ['Smoked Vetiver', 'Amber Resin', 'Dark Vanilla Bean'],
      },
      scentProfile:
        'Deep, woody, and meditative. A warm mantle of smoked sandalwood and aged cedarwood with subtle toasted spices.',
      mood: 'Calm, mysterious, commanding, and grounded.',
      idealFor: 'Autumn & winter, executive boardroom presence, and late-night dinners.',
    },
    {
      id: 'velvet-oudh',
      name: 'VELVET OUDH ROYALE',
      subtitle: 'THE NOBLE EXTRACT',
      type: 'Extrait de Parfum',
      family: 'Oriental',
      price: 4299,
      availableSizes: ['50ml (₹4,299)', '100ml (₹6,799)', '10ml Travel (₹1,499)'],
      inStock: true,
      notes: {
        top: ['Saffron Threads', 'Nutmeg', 'Bitter Orange'],
        heart: ['Taif Rose', 'Aged Agarwood (Oudh)', 'Incense Tears'],
        base: ['Black Amber', 'Patchouli', 'Bourbon Leather'],
      },
      scentProfile:
        'Opulent, warm, and hypnotic. Rare smoky agarwood paired with velvet Taif rose petals and gilded saffron.',
      mood: 'Bold, royal, enigmatic, and unforgettable.',
      idealFor: 'Galas, formal celebrations, and colder evenings.',
    },
    {
      id: 'celeste-marine',
      name: 'CÉLESTE MARINE',
      subtitle: 'THE MEDITERRANEAN MIST',
      type: 'Eau de Parfum',
      family: 'Fresh',
      price: 3299,
      availableSizes: ['50ml (₹3,299)', '100ml (₹5,199)', '10ml Travel (₹1,199)'],
      inStock: true,
      notes: {
        top: ['Sea Salt', 'Amalfi Lemon', 'Crisp Mint Leaf'],
        heart: ['Aquatic Lily', 'Orange Blossom', 'Green Rosemary'],
        base: ['Driftwood', 'White Ambergris', 'Clean Musk'],
      },
      scentProfile:
        'Crisp, breezy, and exhilarating. Pure Mediterranean sea spray dancing with lemon zest and saline ambergris.',
      mood: 'Uplifting, invigorating, vibrant, and clean.',
      idealFor: 'Warm weather, daytime meetings, coastal travels, and daily refreshes.',
    },
    {
      id: 'fleur-blanche',
      name: 'FLEUR BLANCHE',
      subtitle: 'THE NOCTURNAL BLOOM',
      type: 'Eau de Parfum',
      family: 'Floral',
      price: 3699,
      availableSizes: ['50ml (₹3,699)', '100ml (₹5,699)', '10ml Travel (₹1,349)'],
      inStock: true,
      notes: {
        top: ['Pear Nectar', 'Mandarin Blossom', 'Green Violet'],
        heart: ['Night Jasmine', 'Gardenia Grandiflora', 'Velvet Tuberose'],
        base: ['White Sandalwood', 'Benzoin', 'Skin Musk'],
      },
      scentProfile:
        'Enchanting and intoxicating. Night-blooming white petals bathed in dewy pear nectar and soft benzoin resin.',
      mood: 'Sensual, sophisticated, and memorable.',
      idealFor: 'Date nights, gallery openings, and romantic soirées.',
    },
    {
      id: 'ambre-noir',
      name: 'AMBRE NOIR',
      subtitle: 'THE MOLTEN SHADOW',
      type: 'Extrait de Parfum',
      family: 'Oriental',
      price: 3999,
      availableSizes: ['50ml (₹3,999)', '100ml (₹6,199)', '10ml Travel (₹1,399)'],
      inStock: true,
      notes: {
        top: ['Roasted Tonka', 'Cinnamon Bark', 'Bergamot Zest'],
        heart: ['Smoky Labdanum', 'Dark Cocoa Pod', 'Myrrh'],
        base: ['Golden Amber', 'Benzoin Siam', 'Madagascar Vanilla'],
      },
      scentProfile:
        'Warm, gourmand-spiced, and resinous. Molten golden amber entwined with roasted tonka bean and smoked labdanum.',
      mood: 'Cozy, seductive, magnetic, and opulent.',
      idealFor: 'Winter evenings, fireplace gatherings, and intimate nights.',
    },
  ],

  policies: {
    shipping: {
      domesticRates:
        'Complimentary luxury shipping on all orders of ₹4,000 or more. A standard domestic shipping fee of ₹149 applies to orders under ₹4,000. Priority Climate-Controlled Express delivery is available for +₹299.',
      freeShippingThreshold: '₹4,000',
      deliveryTimeline:
        'Orders are packaged within 24 to 48 hours. Express delivery takes 2 to 4 business days across India.',
      packaging:
        'Every flacon is enveloped in shockproof protective casing and sealed in our midnight navy presentation box with a personalized seal.',
    },
    returns: {
      trialPolicy:
        'Risk-free trial: Every 50ml or 100ml flacon includes a complimentary 2ml matching sample. We invite you to experience the 2ml sample first before unsealing the full bottle.',
      window:
        '14 calendar days from delivery date for unopened, unbroken-seal flacons.',
      condition:
        'The main flacon must remain unopened with intact cellophane wrap. The 2ml sample is yours to keep in all instances.',
      process:
        'Contact concierge@elasirs.com or message this concierge with your order number to initiate a complimentary courier pickup.',
    },
    authenticity:
      'All ELASIRS perfumes are 100% authentic, poured in small batches, and serial-numbered.',
    fragranceCare:
      'Store your flacon away from direct sunlight, humid bathrooms, and extreme temperature fluctuations. Apply directly to pulse points (inner wrists, base of throat, behind ears) without rubbing wrists together, which shears the volatile top notes.',
  },

  faqs: [
    {
      question: 'What is the concentration of ELASIRS fragrances?',
      answer:
        'Our fragrances are created with exceptionally high essence concentrations: Eau de Parfum (18–20% perfume oil) and Extrait de Parfum (24–28% perfume oil), ensuring 12 to 24+ hours of longevity on skin.',
    },
    {
      question: 'Are ELASIRS perfumes cruelty-free and vegan?',
      answer:
        'Yes. All ELASIRS creations are 100% cruelty-free and formulated without animal-derived musks or testing.',
    },
    {
      question: 'How do I choose between Eau de Parfum and Extrait de Parfum?',
      answer:
        'Eau de Parfum (such as ELASIRS NO. 01 and Céleste Marine) balances luminous projection with lasting sillage, ideal for daytime and versatile wear. Extrait de Parfum (such as Santal Obscura and Velvet Oudh) has higher oil concentration, sitting deeper and closer to the skin with remarkable 24-hour persistence.',
    },
    {
      question: 'What promotion codes are currently active?',
      answer:
        'First-time patrons can enter code WELCOME10 at checkout for 10% off their inaugural order. For VIP orders above ₹4,000, code ELASIRSVIP provides a ₹500 fixed courtesy credit.',
    },
  ],
};
