import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, ChevronDown, ShoppingBag, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RecommendedProduct {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  family: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  recommendedProducts?: RecommendedProduct[];
}

interface ConciergeChatProps {
  onNavigateProduct: (productId: string) => void;
  onNavigateShop: () => void;
  onNavigateStory: () => void;
}

export const ConciergeChat: React.FC<ConciergeChatProps> = ({
  onNavigateProduct,
  onNavigateShop,
  onNavigateStory,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const initialWelcomeText =
    "Welcome to Maison ELASIRS. I am your fragrance concierge. Ask me about our botanical extractions, discover our collections, or find your signature scent.";

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'model',
      text: initialWelcomeText,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const quickButtons = [
    { label: 'Our Story', prompt: 'Tell me about the story and inspiration behind ELASIRS.' },
    { label: 'Bestsellers', prompt: 'What are the signature fragrances in the ELASIRS collection?' },
    { label: 'Find My Scent', prompt: 'Can you help me find my signature scent based on my personality and notes?' },
    { label: 'Fragrance Notes', prompt: 'Explain the fragrance notes and olfactory pyramid in ELASIRS perfumes.' },
    { label: 'Shipping & Returns', prompt: 'What are the shipping timelines, rates, and 14-day sample return policies?' },
  ];

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({
          role: m.role,
          content: m.text,
        }));

      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.email ? { 'x-user-email': user.email } : {}),
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          userEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const modelMsg: ChatMessage = {
          id: `mod-${Date.now()}`,
          role: 'model',
          text: data.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: data.data.recommendedProducts,
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        throw new Error(data.message || 'Concierge request failed');
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'The atelier is currently busy hand-finishing bespoke flacons. Please ask about our products, or reach us at concierge@elasirs.com.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: initialWelcomeText,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#292522] text-white border border-[#E8DDD2] rounded-full shadow-2xl hover:bg-[#B8945F] transition-all duration-300 flex items-center gap-2.5 cursor-pointer group hover:scale-105 active:scale-95"
          aria-label="Open Fragrance Concierge"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-[#B8945F] group-hover:text-white transition-colors" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B8945F]" />
            )}
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold font-sans">
            Fragrance Concierge
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[90vh] bg-white border border-[#E8DDD2] shadow-2xl flex flex-col justify-between overflow-hidden rounded-sm animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-[#F8F1E8] border-b border-[#E8DDD2] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#E8DDD2] flex items-center justify-center text-[#B8945F]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-normal tracking-wide text-[#292522] uppercase">
                  ELASIRS Concierge
                </h3>
                <span className="text-[10px] text-[#756B63] block -mt-0.5">
                  Haute Fragrance Consultant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 text-[#756B63] hover:text-[#292522] transition-colors cursor-pointer"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#756B63] hover:text-[#292522] transition-colors ml-1 cursor-pointer"
                aria-label="Close concierge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Bar */}
          <div className="bg-[#FAF3EC] px-3.5 py-2 border-b border-[#E8DDD2] overflow-x-auto flex items-center gap-2 no-scrollbar">
            {quickButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(btn.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-white border border-[#E8DDD2] text-[10px] uppercase tracking-wider text-[#756B63] hover:border-[#292522] hover:text-[#292522] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 rounded-xs font-medium"
              >
                {btn.label}
              </button>
            ))}
            {user && (
              <button
                onClick={() => sendMessage("What is the status of my recent order?")}
                disabled={isLoading}
                className="px-2.5 py-1 bg-[#F8F1E8] border border-[#B8945F]/40 text-[10px] uppercase tracking-wider text-[#292522] whitespace-nowrap hover:bg-[#292522] hover:text-white transition-colors cursor-pointer rounded-xs font-semibold"
              >
                My Order Status
              </button>
            )}
          </div>

          {/* Message Thread Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FFFDF9]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[86%] p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#292522] text-white font-medium rounded-sm rounded-br-none shadow-xs'
                      : 'bg-white text-[#292522] border border-[#E8DDD2] rounded-sm rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Interactive Recommended Fragrance Cards inside chat bubble */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E8DDD2] space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block font-semibold">
                        Maison Recommendations:
                      </span>
                      {msg.recommendedProducts.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            onNavigateProduct(prod.id);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 bg-[#FAF3EC] border border-[#E8DDD2] hover:border-[#292522] transition-colors cursor-pointer group rounded-xs"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-12 object-contain bg-white p-1 border border-[#E8DDD2] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif-luxury text-xs text-[#292522] group-hover:text-[#B8945F] transition-colors truncate">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-[#756B63] uppercase">
                              {prod.family} · ₹{prod.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#292522] shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] uppercase tracking-widest text-[#756B63] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Formulating response indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#E8DDD2] text-xs text-[#B8945F] max-w-[70%] rounded-sm shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#B8945F]" />
                <span className="italic text-[11px] text-[#756B63]">The concierge is composing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-[#E8DDD2] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about perfumes, notes, our story..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              disabled={isLoading}
              maxLength={1000}
              className="flex-1 bg-[#FAF3EC] border border-[#E8DDD2] px-3.5 py-2.5 text-xs text-[#292522] placeholder-[#756B63]/60 outline-none focus:border-[#292522] transition-colors rounded-xs"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-[#292522] text-white hover:bg-[#B8945F] transition-colors disabled:opacity-40 cursor-pointer rounded-xs shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Disclaimer Footer */}
          <div className="bg-[#FAF3EC] px-3 py-1.5 text-center border-t border-[#E8DDD2] text-[9px] text-[#756B63] uppercase tracking-widest">
            ELASIRS Atelier AI · Verified Public Knowledge
          </div>
        </div>
      )}
    </>
  );
};
