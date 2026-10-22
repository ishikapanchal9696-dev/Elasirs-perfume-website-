import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProductCategoriesProps {
  onSelectCategory: (family: string) => void;
}

export const ProductCategories: React.FC<ProductCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'floral',
      name: 'FLORAL',
      family: 'Floral',
      subheading: 'Soft · Romantic · Expressive',
      description: 'Heirloom Damask rose, night-blooming jasmine, and white neroli.',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      bgTint: 'bg-[#E8C5C0]/25',
      borderAccent: 'group-hover:border-[#E8C5C0]',
    },
    {
      id: 'woody',
      name: 'WOODY',
      family: 'Woody',
      subheading: 'Warm · Deep · Grounded',
      description: 'Sacred Mysore sandalwood, Virginia cedarwood, and smoked vetiver.',
      image: '/src/assets/images/perfume_woody_flacon_1790830726060.jpg',
      bgTint: 'bg-[#F5E8DC]/70',
      borderAccent: 'group-hover:border-[#E6D0B8]',
    },
    {
      id: 'fresh',
      name: 'FRESH',
      family: 'Fresh',
      subheading: 'Clean · Crisp · Rejuvenating',
      description: 'Calabrian citrus peel, saline sea spray, and dewy violet leaves.',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      bgTint: 'bg-[#FAF3EC]',
      borderAccent: 'group-hover:border-[#B8945F]',
    },
    {
      id: 'oriental',
      name: 'ORIENTAL',
      family: 'Oriental',
      subheading: 'Rich · Sensual · Mysterious',
      description: 'Golden amber resins, wild aged oudh, and toasted saffron.',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      bgTint: 'bg-[#E6D0B8]/40',
      borderAccent: 'group-hover:border-[#B8945F]',
    },
    {
      id: 'musky',
      name: 'MUSKY',
      family: 'Musky',
      subheading: 'Intimate · Second-Skin · Velvety',
      description: 'Sheer botanical cashmere, solar white musk, and delicate cotton accord.',
      image: '/src/assets/images/gloss_gems_radiance.jpg',
      bgTint: 'bg-[#F5E8DC]/50',
      borderAccent: 'group-hover:border-[#E8DDD2]',
    },
    {
      id: 'gourmand',
      name: 'GOURMAND',
      family: 'Gourmand',
      subheading: 'Warm · Addictive · Indulgent',
      description: 'Bourbon vanilla beans, toasted tonka, bitter almond, and roasted coffee.',
      image: '/src/assets/images/download-1.jpg',
      bgTint: 'bg-[#F3D8CC]/40',
      borderAccent: 'group-hover:border-[#F3D8CC]',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#FAF3EC] border-b border-[#E8DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-2">
            The Olfactory Spectrum
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            SHOP BY FRAGRANCE FAMILY
          </h2>
          <p className="mt-3 text-sm text-[#756B63] leading-relaxed">
            Every ELASIRS composition belongs to an intentional olfactory realm crafted to awaken memory, presence, and personal expression.
          </p>
        </div>

        {/* 6 Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.family)}
              className={`group relative flex flex-col justify-between h-72 sm:h-84 bg-white border border-[#E8DDD2] rounded-sm p-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#292522]/5 cursor-pointer text-left ${cat.borderAccent}`}
            >
              {/* Image Container with generous padding & clean glow */}
              <div className={`relative h-44 sm:h-48 w-full rounded-xs overflow-hidden flex items-center justify-center p-3.5 ${cat.bgTint}`}>
                <img
                  src={cat.image}
                  alt={`${cat.name} Fragrance Family`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>

              {/* Text Info */}
              <div className="pt-3 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury text-lg sm:text-xl font-normal text-[#292522] uppercase tracking-wide group-hover:text-[#B8945F] transition-colors">
                      {cat.name}
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#756B63] group-hover:text-[#B8945F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-[#756B63] mt-1 leading-snug font-light line-clamp-2">
                    {cat.subheading}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8DDD2]/70 flex items-center justify-between text-[10px] text-[#B8945F] font-semibold uppercase tracking-wider">
                  <span>Explore Scents</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
