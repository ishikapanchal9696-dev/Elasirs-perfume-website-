import React, { useState } from 'react';
import { Boxes, Search, AlertCircle, Plus, Check } from 'lucide-react';
import { Product } from '../../types';

interface AdminInventoryProps {
  products: Product[];
  onQuickRestock: (productId: string, amount: number) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  onQuickRestock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'healthy'>('all');

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.family.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStock === 'low') return matchesSearch && p.stock <= 20;
    if (filterStock === 'healthy') return matchesSearch && p.stock > 20;
    return matchesSearch;
  });

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= 20).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Metric stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Total Inventory Units
          </span>
          <div className="text-2xl font-serif-luxury font-bold text-[#292522] mt-1">
            {totalStockUnits} Flacons
          </div>
          <span className="text-[11px] text-[#756B63] mt-1 block">
            Across {products.length} catalog references
          </span>
        </div>

        <div className="p-5 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Low Stock Alerts (≤20 units)
          </span>
          <div className="text-2xl font-serif-luxury font-bold text-amber-400 mt-1">
            {lowStockCount} Flacons
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            Immediate maturation reorder recommended
          </span>
        </div>

        <div className="p-5 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Atelier Maturation Standard
          </span>
          <div className="text-2xl font-serif-luxury font-bold text-[#B8945F] mt-1">
            120 Days
          </div>
          <span className="text-[11px] text-[#756B63] mt-1 block">
            Controlled cold-maceration cycle
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-[#E8DDD2]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStock('all')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer border ${
              filterStock === 'all'
                ? 'bg-[#292522] text-white border-[#B8945F] font-bold'
                : 'bg-[#FAF3EC] border-[#E8DDD2] text-[#292522]'
            }`}
          >
            All Flacons ({products.length})
          </button>
          <button
            onClick={() => setFilterStock('low')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer border ${
              filterStock === 'low'
                ? 'bg-amber-400 text-[#292522] border-amber-400 font-bold'
                : 'bg-[#FAF3EC] border-[#E8DDD2] text-amber-400'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterStock('healthy')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer border ${
              filterStock === 'healthy'
                ? 'bg-[#292522] text-white border-[#B8945F] font-bold'
                : 'bg-[#FAF3EC] border-[#E8DDD2] text-[#292522]'
            }`}
          >
            Healthy Stock
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#B8945F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search inventory..."
            className="w-full bg-[#FAF3EC] border border-[#E8DDD2] pl-8 pr-3 py-1.5 text-xs text-[#292522] outline-none"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E8DDD2] shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E8DDD2] text-[10px] uppercase tracking-wider text-[#B8945F] bg-[#292522]/40">
              <th className="py-3 px-4">Fragrance Flacon</th>
              <th className="py-3 px-4">SKU / ID</th>
              <th className="py-3 px-4">Family</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quick Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#B69B6D]/10 text-[#756B63]">
            {filtered.map(prod => {
              const isLow = prod.stock <= 20;

              return (
                <tr key={prod.id} className="hover:bg-[#292522]/40 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-9 h-9 object-cover border border-[#E8DDD2] shrink-0"
                    />
                    <div>
                      <span className="font-serif-luxury text-sm font-semibold text-[#292522] block">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-[#756B63] uppercase font-mono">
                        {prod.subtitle}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-[#B8945F]">
                    {prod.id}
                  </td>
                  <td className="py-3.5 px-4">{prod.family}</td>
                  <td className="py-3.5 px-4 font-mono">₹{prod.price.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isLow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold ${
                        isLow
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {isLow ? 'Low Reserve' : 'Available'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => onQuickRestock(prod.id, 10)}
                        className="px-2.5 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-[10px] hover:border-[#B8945F] cursor-pointer"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => onQuickRestock(prod.id, 25)}
                        className="px-2.5 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-[10px] hover:border-[#B8945F] cursor-pointer"
                        title="Add 25 units"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => onQuickRestock(prod.id, 50)}
                        className="px-2.5 py-1 bg-[#292522] text-white font-bold text-[10px] hover:bg-[#B8945F] cursor-pointer"
                        title="Add 50 units"
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
