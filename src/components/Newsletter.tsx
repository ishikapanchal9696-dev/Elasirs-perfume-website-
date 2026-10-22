import React, { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Newsletter: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please provide a valid email address', 'error');
      return;
    }

    setSubscribed(true);
    showToast('Welcome to the inner circle of Maison ELASIRS', 'success');
  };

  return (
    <section className="py-16 lg:py-24 bg-[#F5E8DC]/60 border-b border-[#E8DDD2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-3">
          Privileged Access
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
          ENTER THE WORLD OF ELASIRS
        </h2>

        <p className="mt-3 text-sm sm:text-base text-[#756B63] max-w-xl mx-auto leading-relaxed font-light">
          Be the first to discover new seasonal formulations, private archive releases, and olfactory insights from our master distillers.
        </p>

        {subscribed ? (
          <div className="mt-8 p-6 bg-white border border-[#E8DDD2] rounded-sm max-w-md mx-auto shadow-xs">
            <div className="flex items-center justify-center gap-2 text-[#292522] mb-2">
              <Check className="w-5 h-5 text-[#B8945F]" />
              <span className="text-sm uppercase tracking-wider font-semibold">
                Invitation Confirmed
              </span>
            </div>
            <p className="text-xs text-[#756B63]">
              Use code <strong className="text-[#292522] font-mono tracking-widest font-bold">WELCOME10</strong> at checkout for 10% off your inaugural flacon.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row items-stretch justify-center max-w-md mx-auto gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-[#E8DDD2] text-xs sm:text-sm text-[#292522] placeholder-[#756B63]/60 outline-none focus:border-[#292522] transition-colors rounded-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#292522] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all cursor-pointer rounded-sm shadow-xs"
            >
              SUBSCRIBE
            </button>
          </form>
        )}

        <p className="mt-4 text-[11px] text-[#756B63]/70 uppercase tracking-widest">
          No spam · Unsubscribe at any time · Strict privacy protection
        </p>
      </div>
    </section>
  );
};
