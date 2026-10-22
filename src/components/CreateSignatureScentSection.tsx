import React from 'react';
import { Sparkles, ArrowRight, Compass, Check } from 'lucide-react';

interface CreateSignatureScentSectionProps {
  onCreatePerfume: () => void;
}

export const CreateSignatureScentSection: React.FC<CreateSignatureScentSectionProps> = ({
  onCreatePerfume,
}) => {
  return (
    <section className="relative py-16 lg:py-24 bg-[#FAF3EC] border-b border-[#E8DDD2] overflow-hidden">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#F3D8CC]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-[#E6D0B8]/35 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Invitation */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8DDD2] text-[#B8945F] text-[11px] uppercase tracking-[0.25em] font-semibold shadow-xs rounded-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Atelier Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury tracking-[0.08em] text-[#292522] uppercase leading-tight font-light">
              CREATE YOUR SIGNATURE SCENT
            </h2>

            <p className="text-base sm:text-lg text-[#756B63] font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Your fragrance should feel like an effortless extension of you. Build a bespoke formulation around your personality, sensory world, botanical notes, and ideal occasion.
            </p>

            {/* Stepper Preview Badges */}
            <div className="pt-2 pb-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 text-[11px] uppercase tracking-wider text-[#756B63]">
              <span className="px-2.5 py-1 bg-white border border-[#B8945F] text-[#292522] font-medium shadow-xs rounded-xs">
                01 Personality
              </span>
              <span className="text-[#E8DDD2]">→</span>
              <span className="px-2.5 py-1 bg-white/80 border border-[#E8DDD2] rounded-xs">
                02 Family
              </span>
              <span className="text-[#E8DDD2]">→</span>
              <span className="px-2.5 py-1 bg-white/80 border border-[#E8DDD2] rounded-xs">
                03 Notes
              </span>
              <span className="text-[#E8DDD2]">→</span>
              <span className="px-2.5 py-1 bg-white/80 border border-[#E8DDD2] rounded-xs">
                04 Intensity
              </span>
              <span className="text-[#E8DDD2]">→</span>
              <span className="px-2.5 py-1 bg-white/80 border border-[#E8DDD2] rounded-xs">
                05 Occasion
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onCreatePerfume}
                className="w-full sm:w-auto px-8 py-4 bg-[#292522] text-[#FFFFFF] font-semibold text-xs tracking-[0.22em] uppercase hover:bg-[#B8945F] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer group rounded-xs"
              >
                <span>START BESPOKE CREATION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Flacon & Mood Vignette */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md p-6 sm:p-8 bg-white border border-[#E8DDD2] rounded-sm shadow-md">
              
              <div className="flex items-center justify-between border-b border-[#E8DDD2] pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8945F] font-semibold block">
                    Step 01 · Personality
                  </span>
                  <h4 className="font-serif-luxury text-xl text-[#292522]">The Olfactory Canvas</h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center text-[#B8945F]">
                  <Compass className="w-4 h-4" />
                </div>
              </div>

              {/* Sample Mood Tiles */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-center rounded-xs">
                  <span className="block text-sm font-serif-luxury text-[#292522]">Romantic</span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#B8945F] mt-0.5">Damask Petals</span>
                </div>
                <div className="p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-center rounded-xs">
                  <span className="block text-sm font-serif-luxury text-[#292522]">Mysterious</span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#B8945F] mt-0.5">Smoked Cedar</span>
                </div>
                <div className="p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-center rounded-xs">
                  <span className="block text-sm font-serif-luxury text-[#292522]">Fresh</span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#B8945F] mt-0.5">Calabrian Citrus</span>
                </div>
                <div className="p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-center rounded-xs">
                  <span className="block text-sm font-serif-luxury text-[#292522]">Sensual</span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#B8945F] mt-0.5">Skin Amber</span>
                </div>
              </div>

              {/* Flacon Teaser Info */}
              <div className="pt-4 border-t border-[#E8DDD2] flex items-center justify-between text-xs text-[#756B63]">
                <div className="flex items-center gap-1.5 text-[#292522] font-medium">
                  <Check className="w-3.5 h-3.5 text-[#B8945F]" />
                  <span>50ml Custom Engraved Bottle</span>
                </div>
                <span className="font-semibold text-[#292522] tabular-nums">From ₹3,499</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
