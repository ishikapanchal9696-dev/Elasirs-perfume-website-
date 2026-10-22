import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send, Check, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ContactPageProps {
  onBackToShop: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToShop }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Olfactory Consultation');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your inquiry has reached our Grasse concierge', 'success');
  };

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

        <div className="pb-8 border-b border-[#E8DDD2] mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>Client Relations & Atelier Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury font-light tracking-[0.08em] text-[#292522] uppercase">
            CONTACT & CONCIERGE
          </h1>
          <p className="mt-3 text-sm text-[#756B63] max-w-xl font-light leading-relaxed">
            Whether inquiring about bespoke fragrance commissions, private gifting, or order inquiries, our fragrance advisors and master distillers are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Info (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm space-y-6 shadow-xs">
              <h3 className="font-serif-luxury text-xl text-[#292522] uppercase tracking-wide font-normal">
                Maison Salons
              </h3>

              <div className="flex items-start gap-3.5 text-xs text-[#756B63]">
                <MapPin className="w-4 h-4 text-[#B8945F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#292522] block font-medium">Private Atelier & Showroom:</strong>
                  <span>Plot 18, Worli Sea Face, Mumbai 400018, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-[#756B63]">
                <Mail className="w-4 h-4 text-[#B8945F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#292522] block font-medium">Electronic Inquiries:</strong>
                  <span className="text-[#B8945F] font-medium">concierge@elasirs.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-[#756B63]">
                <Phone className="w-4 h-4 text-[#B8945F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#292522] block font-medium">Concierge Telephone:</strong>
                  <span>+91 (022) 8920 4400 (Mon–Sat, 10am–7pm IST)</span>
                </div>
              </div>
            </div>

            {/* Quick Fragrance Advice summary */}
            <div className="p-6 bg-[#FAF3EC] border border-[#E8DDD2] rounded-sm space-y-4 shadow-xs">
              <h4 className="text-xs uppercase tracking-widest text-[#B8945F] font-semibold">
                Olfactory Guidelines
              </h4>
              <div className="text-xs text-[#756B63] space-y-3 font-light leading-relaxed">
                <div>
                  <strong className="text-[#292522] block font-medium">How to store flacons?</strong>
                  <span>Keep away from direct heat and UV rays in a cool, shaded armoire to preserve pure oil integrity.</span>
                </div>
                <div>
                  <strong className="text-[#292522] block font-medium">Discovery Sample Guarantee:</strong>
                  <span>Every full bottle ships with a 2ml matching sample. Return unopened full flacons within 14 days for a full refund.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form (lg:col-span-7) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-white border border-[#E8DDD2] rounded-sm shadow-xs">
              <h3 className="font-serif-luxury text-2xl text-[#292522] mb-6 font-normal">
                Transmit a Message to the Concierge
              </h3>

              {submitted ? (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-[#FAF3EC] border border-[#B8945F] flex items-center justify-center mx-auto text-[#B8945F] mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif-luxury text-2xl text-[#292522]">Inquiry Received</h4>
                  <p className="text-xs text-[#756B63] mt-2 max-w-sm mx-auto leading-relaxed">
                    A dedicated fragrance consultant will respond to your registered email within 24 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="mt-6 px-6 py-2.5 bg-[#292522] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#B8945F] transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Maharani Gayatri"
                        className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="patron@domain.com"
                        className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    >
                      <option value="Olfactory Consultation">Olfactory Consultation</option>
                      <option value="Order Status & Delivery">Order Status & Delivery</option>
                      <option value="Bespoke Private Commission">Bespoke Private Commission</option>
                      <option value="Press & Editorial Inquiries">Press & Editorial Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Share your fragrance preferences or inquiry..."
                      className="w-full p-3 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4 rounded-xs shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>TRANSMIT INQUIRY</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
