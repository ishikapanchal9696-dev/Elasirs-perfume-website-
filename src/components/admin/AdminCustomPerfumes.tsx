import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Heart,
  Compass,
  X,
  Flame,
  Check,
} from 'lucide-react';
import { BespokeCustomization } from '../../types';

interface AdminCustomPerfumesProps {
  customPerfumes: BespokeCustomization[];
  onUpdateStatus: (id: string, newStatus: string) => void;
}

export const AdminCustomPerfumes: React.FC<AdminCustomPerfumesProps> = ({
  customPerfumes,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BespokeCustomization | null>(null);

  const filtered = customPerfumes.filter(
    item =>
      item.perfumeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primaryFamily.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const STATUSES = [
    'Atelier Review',
    'Formulation Approved',
    'In 120-Day Maturation',
    'Bottled & Packaged',
    'Dispatched to Patron',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#FFFFFF] border border-[#B8945F]/30 shadow-xl">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
            Haute Parfumerie Sur-Mesure
          </span>
          <h2 className="font-serif-luxury text-2xl text-[#292522]">Custom Perfumes Atelier</h2>
          <p className="text-xs text-[#292522]/70 mt-1">
            Review and oversee personalized client perfume commissions submitted via "CREATE YOUR SIGNATURE SCENT".
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#B8945F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search custom formulas..."
            className="w-full bg-[#FAF3EC] border border-[#B8945F]/30 pl-9 pr-4 py-2 text-xs text-[#292522] outline-none focus:border-[#B8945F]"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#FFFFFF] border border-[#B8945F]/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#B8945F]/20 text-[10px] uppercase tracking-wider text-[#B8945F] bg-[#FAF3EC]/60">
                <th className="py-3 px-4">Client Patron</th>
                <th className="py-3 px-4">Perfume Name</th>
                <th className="py-3 px-4">Fragrance Family</th>
                <th className="py-3 px-4">Intensity</th>
                <th className="py-3 px-4">Key Notes</th>
                <th className="py-3 px-4">Atelier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B8945F]/10 text-[#292522]/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#292522]/60 italic">
                    No custom perfume creations found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAF3EC]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#292522]">
                        {item.customerName || 'Valued Patron'}
                      </div>
                      <div className="text-[10px] text-[#292522]/50">{item.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-serif-luxury text-sm font-semibold text-[#292522]">
                        {item.perfumeName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-[#FAF3EC] border border-[#B8945F]/40 text-[#B8945F] text-[10px] uppercase font-mono">
                        {item.primaryFamily}
                        {item.secondaryFamily ? ` + ${item.secondaryFamily}` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#292522]">
                      {item.intensity}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[#292522]/70 max-w-xs truncate">
                      {[...item.topNotes, ...item.heartNotes, ...item.baseNotes].slice(0, 4).join(', ')}...
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={item.status || 'Atelier Review'}
                        onChange={e => onUpdateStatus(item.id, e.target.value)}
                        className="bg-[#FAF3EC] border border-[#B8945F]/40 text-[#B8945F] text-[10px] font-medium px-2 py-1 outline-none cursor-pointer"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRequest(item)}
                        className="p-1.5 border border-[#B8945F]/40 text-[#B8945F] hover:bg-[#B8945F] hover:text-[#FAF3EC] transition-colors cursor-pointer"
                        title="View Full Scent Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Full Scent Profile Detail */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF3EC]/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-[#FFFFFF] border border-[#B8945F] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-1.5 text-[#292522]/70 hover:text-[#B8945F] border border-[#B8945F]/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block mb-1">
              Bespoke Formula Specification
            </span>
            <h3 className="font-serif-luxury text-2xl text-[#292522] uppercase tracking-wide">
              {selectedRequest.perfumeName}
            </h3>
            <p className="text-xs text-[#B8945F] mt-0.5">
              Client: {selectedRequest.customerName} ({selectedRequest.userEmail})
            </p>

            {/* Note Pyramids */}
            <div className="mt-6 p-4 bg-[#FAF3EC] border border-[#B8945F]/20 space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block">
                  Top Notes (First 15 Mins)
                </span>
                <span className="text-xs text-[#292522]">
                  {selectedRequest.topNotes.join(' · ') || 'None selected'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#B8945F]/10">
                <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block">
                  Heart Notes (Enduring Soul)
                </span>
                <span className="text-xs text-[#292522]">
                  {selectedRequest.heartNotes.join(' · ') || 'None selected'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#B8945F]/10">
                <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block">
                  Base Notes (Deep Dry-Down)
                </span>
                <span className="text-xs text-[#292522]">
                  {selectedRequest.baseNotes.join(' · ') || 'None selected'}
                </span>
              </div>
            </div>

            {/* Personality & Occasions */}
            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-3 bg-[#FAF3EC] border border-[#B8945F]/20">
                <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block mb-1">
                  Personality Moods
                </span>
                <span className="text-[#292522] capitalize">
                  {selectedRequest.moods.join(', ')}
                </span>
              </div>
              <div className="p-3 bg-[#FAF3EC] border border-[#B8945F]/20">
                <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block mb-1">
                  Target Occasions
                </span>
                <span className="text-[#292522]">
                  {selectedRequest.occasions.join(', ') || 'Signature Daily'}
                </span>
              </div>
            </div>

            {/* Fragrance Story */}
            {selectedRequest.fragranceStory && (
              <div className="mt-4 p-3 bg-[#FAF3EC] border border-[#B8945F]/20">
                <span className="text-[9px] uppercase tracking-widest text-[#B8945F] block mb-1">
                  Sensory Narrative
                </span>
                <p className="text-xs text-[#292522]/80 italic">
                  "{selectedRequest.fragranceStory}"
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2.5 bg-[#B8945F] text-[#FAF3EC] text-xs font-semibold uppercase tracking-wider hover:bg-[#292522] cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
