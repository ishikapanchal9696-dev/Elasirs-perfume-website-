import React from 'react';
import { ArrowLeft, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface JournalPageProps {
  onBackToShop: () => void;
  onSelectProduct: (productId: string) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({ onBackToShop, onSelectProduct }) => {
  const articles = [
    {
      id: 'art-1',
      title: 'The Architecture of the Scent Pyramid: Understanding Top, Heart & Base Notes',
      category: 'Olfactory Education',
      readTime: '4 min read',
      date: 'March 2026',
      excerpt: 'Why the first five seconds of a perfume spray are only the opening whisper of an enduring hours-long symphony.',
      image: '/src/assets/images/brand_story_editorial_1790830714958.jpg',
      featuredProduct: 'elasirs-01',
    },
    {
      id: 'art-2',
      title: 'The Sacred Wood: Why Authentic Sandalwood is the Gold of Haute Parfumerie',
      category: 'Raw Materials',
      readTime: '6 min read',
      date: 'February 2026',
      excerpt: 'An exploration into the deep, meditative warmth of aged Mysore and Australian sandalwood botanical varieties.',
      image: '/src/assets/images/perfume_woody_flacon_1790830726060.jpg',
      featuredProduct: 'santal-obscura',
    },
    {
      id: 'art-3',
      title: 'Nocturnal Flowers: Why White Petals Bloom More Intensely at Twilight',
      category: 'Atelier Secrets',
      readTime: '5 min read',
      date: 'January 2026',
      excerpt: 'How temperature and atmospheric moisture transform the volatile organic compounds of jasmine and neroli blossoms.',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      featuredProduct: 'fleur-blanche',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 lg:py-20 text-[#292522]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#756B63] hover:text-[#292522] transition-colors mb-10 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-4 h-4 text-[#B8945F]" />
          <span>Back to Collection</span>
        </button>

        <div className="pb-10 border-b border-[#E8DDD2] mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>Editorial Perspectives & Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            THE OLFACTORY JOURNAL
          </h1>
          <p className="mt-3 text-sm text-[#756B63] max-w-xl font-light leading-relaxed">
            Essays on rare botanicals, classical distillation techniques, and the intimate art of wearing fragrance.
          </p>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map(art => (
            <div
              key={art.id}
              className="bg-white border border-[#E8DDD2] hover:border-[#B8945F]/60 transition-all duration-300 flex flex-col justify-between p-5 rounded-sm shadow-xs hover:shadow-md"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden bg-[#FAF3EC] mb-4 border border-[#E8DDD2] rounded-xs">
                  <img
                    src={art.image}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#B8945F] mb-2 uppercase tracking-wider font-semibold">
                  <span>{art.category}</span>
                  <span className="text-[#E8DDD2]">·</span>
                  <span className="text-[#756B63] flex items-center gap-1 font-normal">
                    <Clock className="w-3 h-3" /> {art.readTime}
                  </span>
                </div>

                <h3 className="font-serif-luxury text-lg text-[#292522] leading-snug font-normal">
                  {art.title}
                </h3>

                <p className="mt-2 text-xs text-[#756B63] leading-relaxed font-light">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8DDD2] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#756B63]">{art.date}</span>
                <button
                  onClick={() => onSelectProduct(art.featuredProduct)}
                  className="text-xs uppercase tracking-wider text-[#B8945F] hover:text-[#292522] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Experience Flacon</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
