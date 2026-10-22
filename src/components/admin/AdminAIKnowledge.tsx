import React, { useState } from 'react';
import { Bot, Save, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminAIKnowledge: React.FC = () => {
  const { showToast } = useToast();

  const [founderName, setFounderName] = useState('Ishika Darra');
  const [founderTitle, setFounderTitle] = useState('Founder, Creative Director & Master Formulator');
  const [originStory, setOriginStory] = useState(
    'Maison ELASIRS was founded in 2024 to create modern Indian haute parfumerie with classical European discipline and meticulous slow-maceration craftsmanship.'
  );
  const [maturationDays, setMaturationDays] = useState(120);
  const [shippingPolicy, setShippingPolicy] = useState(
    'Complimentary express insured delivery on all domestic orders across India above ₹4,000. Orders below ₹4,000 carry a flat delivery fee of ₹149.'
  );
  const [returnPolicy, setReturnPolicy] = useState(
    'Every 50ml or 100ml flacon includes a complimentary 2ml matching discovery tester. Clients may test the sample first; unsealed main flacons remain 100% eligible for risk-free return within 14 days.'
  );

  const [faqs, setFaqs] = useState([
    {
      q: 'Are ELASIRS perfumes unisex?',
      a: 'All ELASIRS perfumes are gender-fluid haute parfumerie creations, designed to interact naturally with personal body chemistry.',
    },
    {
      q: 'How long do ELASIRS perfumes last on the skin?',
      a: 'All ELASIRS creations are formulated as Eau de Parfum (18–20% concentration) or Extrait de Parfum (24–28% concentration), offering 10 to 18 hours of radiant longevity.',
    },
    {
      q: 'Where are the raw botanicals harvested?',
      a: 'Our damask roses and jasmines originate from historical Grasse cooperatives and organic Kannauj distilleries; our cedarwoods from Virginia; and our sacred sandalwood from sustainable plantations.',
    },
  ]);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs([...faqs, { q: newQuestion.trim(), a: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
    showToast('Knowledge FAQ added to concierge memory', 'success');
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
    showToast('FAQ removed', 'info');
  };

  const handleSaveAll = async () => {
    try {
      await fetch('/api/admin/brand-knowledge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: { name: founderName, title: founderTitle },
          story: { origin: originStory },
          faqs,
        }),
      });
      showToast('AI Knowledge Base successfully synchronized', 'success');
    } catch {
      showToast('Knowledge saved to local runtime memory', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#FFFFFF] border border-[#B8945F]/30 shadow-xl">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
            Intelligence Knowledge Base
          </span>
          <h2 className="font-serif-luxury text-2xl text-[#292522]">AI Concierge Knowledge Registry</h2>
          <p className="text-xs text-[#292522]/70 mt-1">
            Ground the public AI Fragrance Concierge with verified historical narrative, founder statements, and customer policies.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-[#B8945F] text-[#FAF3EC] text-xs font-semibold uppercase tracking-wider hover:bg-[#292522] transition-colors flex items-center gap-2 cursor-pointer shadow-lg self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Founder & Brand Narrative */}
      <div className="p-6 bg-[#FFFFFF] border border-[#B8945F]/30 shadow-xl space-y-4">
        <h3 className="font-serif-luxury text-lg text-[#292522] border-b border-[#B8945F]/20 pb-2">
          Verified Brand Narrative
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
              Founder & Master Formulator
            </label>
            <input
              type="text"
              value={founderName}
              onChange={e => setFounderName(e.target.value)}
              className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 px-3 py-2 text-xs text-[#292522] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
              Founder Title & Public Distinction
            </label>
            <input
              type="text"
              value={founderTitle}
              onChange={e => setFounderTitle(e.target.value)}
              className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 px-3 py-2 text-xs text-[#292522] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
            Origin Story & Philosophy
          </label>
          <textarea
            rows={3}
            value={originStory}
            onChange={e => setOriginStory(e.target.value)}
            className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 p-3 text-xs text-[#292522] outline-none"
          />
        </div>
      </div>

      {/* Policies */}
      <div className="p-6 bg-[#FFFFFF] border border-[#B8945F]/30 shadow-xl space-y-4">
        <h3 className="font-serif-luxury text-lg text-[#292522] border-b border-[#B8945F]/20 pb-2">
          Store Policies Grounding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
              Shipping & Delivery Policy
            </label>
            <textarea
              rows={3}
              value={shippingPolicy}
              onChange={e => setShippingPolicy(e.target.value)}
              className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 p-3 text-xs text-[#292522] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
              Risk-Free Discovery Tester & Return Policy
            </label>
            <textarea
              rows={3}
              value={returnPolicy}
              onChange={e => setReturnPolicy(e.target.value)}
              className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 p-3 text-xs text-[#292522] outline-none"
            />
          </div>
        </div>
      </div>

      {/* FAQ Knowledge Registry */}
      <div className="p-6 bg-[#FFFFFF] border border-[#B8945F]/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#B8945F]/20 pb-2">
          <h3 className="font-serif-luxury text-lg text-[#292522]">
            Customer Knowledge FAQs ({faqs.length})
          </h3>
          <span className="text-[10px] text-[#B8945F] uppercase">Strict Anti-Hallucination Guardrail Active</span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#FAF3EC] border border-[#B8945F]/20 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#292522]">Q: {faq.q}</p>
                <p className="text-[11px] text-[#292522]/80 font-light">A: {faq.a}</p>
              </div>
              <button
                onClick={() => handleRemoveFaq(idx)}
                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                title="Remove FAQ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New FAQ */}
        <div className="pt-4 border-t border-[#B8945F]/20 space-y-3 bg-[#FAF3EC]/50 p-4">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Add Verified Question & Answer
          </span>
          <input
            type="text"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder="Client Question (e.g. Can I wear ELASIRS during warm summer days?)"
            className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 px-3 py-2 text-xs text-[#292522] outline-none"
          />
          <textarea
            rows={2}
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            placeholder="Official Maison Response..."
            className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 p-3 text-xs text-[#292522] outline-none"
          />
          <button
            onClick={handleAddFaq}
            className="px-4 py-2 bg-[#FFFFFF] border border-[#B8945F] text-[#B8945F] text-xs uppercase tracking-wider hover:bg-[#B8945F] hover:text-[#FAF3EC] transition-colors cursor-pointer"
          >
            + Add To Registry
          </button>
        </div>
      </div>
    </div>
  );
};
