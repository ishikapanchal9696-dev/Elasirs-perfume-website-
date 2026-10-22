import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AnnouncementRibbon as RibbonType } from '../types';

interface AnnouncementRibbonProps {
  onNavigateAction?: (action: string) => void;
}

export const AnnouncementRibbon: React.FC<AnnouncementRibbonProps> = ({ onNavigateAction }) => {
  const defaultRibbons: RibbonType[] = [
    {
      id: 'ribbon-1',
      text: 'Discover Your Signature Scent',
      linkText: 'Create Custom Flacon',
      linkAction: 'bespoke-scent',
      active: true,
      order: 1,
    },
    {
      id: 'ribbon-2',
      text: 'Find a Fragrance for Every Moment',
      linkText: 'Take Scent Quiz',
      linkAction: 'quiz',
      active: true,
      order: 2,
    },
    {
      id: 'ribbon-3',
      text: 'Explore Everyday, Signature & Luxe Collections',
      linkText: 'Browse Collections',
      linkAction: 'collections',
      active: true,
      order: 3,
    },
    {
      id: 'ribbon-4',
      text: 'Complimentary Discovery Trial Sample with Every Flacon Order',
      linkText: 'Learn More',
      linkAction: 'faq',
      active: true,
      order: 4,
    },
  ];

  const [ribbons, setRibbons] = useState<RibbonType[]>(defaultRibbons);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fade, setFade] = useState(true);

  // Fetch ribbons from API with fallback
  useEffect(() => {
    let isMounted = true;
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const activeOnly = data.data.filter((r: RibbonType) => r.active);
          if (activeOnly.length > 0) {
            setRibbons(activeOnly);
          }
        }
      })
      .catch(() => {
        // Keep default ribbons
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeRibbons = ribbons.filter(r => r.active);
  const currentRibbon = activeRibbons[currentIndex] || activeRibbons[0] || defaultRibbons[0];

  // Auto-rotation every 4.5 seconds
  useEffect(() => {
    if (activeRibbons.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % activeRibbons.length);
        setFade(true);
      }, 250);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeRibbons.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + activeRibbons.length) % activeRibbons.length);
      setFade(true);
    }, 200);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % activeRibbons.length);
      setFade(true);
    }, 200);
  };

  const handleActionClick = () => {
    if (currentRibbon.linkAction && onNavigateAction) {
      onNavigateAction(currentRibbon.linkAction);
    }
  };

  if (activeRibbons.length === 0) return null;

  return (
    <aside
      aria-label="Maison Announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-gradient-to-r from-[#FAF3EC] via-[#F5E8DC]/90 to-[#FAF3EC] border-t border-b border-[#E8DDD2] py-3 sm:py-3.5 px-4 text-[#292522] relative z-20 shadow-2xs select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous announcement"
          className="p-1 text-[#756B63] hover:text-[#292522] hover:bg-white/60 rounded-full transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Center Rotating Message with subtle animation */}
        <div className="flex-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 text-center min-w-0">
          <div
            className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 transition-opacity duration-300 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B8945F] shrink-0 animate-pulse" />
            
            <p className="font-serif-luxury text-sm sm:text-base tracking-[0.06em] text-[#292522] uppercase font-normal truncate max-w-[260px] sm:max-w-none">
              {currentRibbon.text}
            </p>

            {currentRibbon.linkText && (
              <button
                onClick={handleActionClick}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#B8945F] hover:text-[#292522] pb-0.5 border-b border-[#B8945F]/40 hover:border-[#292522] transition-colors cursor-pointer shrink-0 ml-1"
              >
                <span>{currentRibbon.linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next announcement"
          className="p-1 text-[#756B63] hover:text-[#292522] hover:bg-white/60 rounded-full transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle indicator dots */}
      {activeRibbons.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1.5">
          {activeRibbons.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setFade(true);
                }, 200);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-4 bg-[#B8945F]' : 'w-1.5 bg-[#E8DDD2] hover:bg-[#756B63]'
              }`}
            />
          ))}
        </div>
      )}
    </aside>
  );
};
