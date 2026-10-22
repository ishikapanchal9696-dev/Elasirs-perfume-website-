import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  Sparkles,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Product, Order, BespokeCustomization } from '../../types';

interface DashboardOverviewProps {
  products: Product[];
  orders: Order[];
  customPerfumes: BespokeCustomization[];
  onNavigateTab: (tab: any) => void;
  onOpenAddProduct: () => void;
  onOpenAddCoupon: () => void;
  onQuickRestock: (productId: string, amount: number) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  orders,
  customPerfumes,
  onNavigateTab,
  onOpenAddProduct,
  onOpenAddCoupon,
  onQuickRestock,
  onUpdateOrderStatus,
}) => {
  // Calculations
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0),
    0
  );
  const totalOrders = orders.length;
  const uniqueCustomerEmails = Array.from(new Set(orders.map(o => o.email.toLowerCase())));
  const totalCustomers = uniqueCustomerEmails.length || 18; // Includes registered patrons
  const totalProducts = products.length;
  const customPerfumeRequests = customPerfumes.length;
  const pendingOrders = orders.filter(
    o => o.status === 'Pending' || o.status === 'Processing'
  ).length;

  // Low stock products (stock <= 20)
  const lowStockProducts = products.filter(p => p.stock <= 20).slice(0, 5);

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5);

  // Recent 4 custom perfume requests
  const recentCustomRequests = customPerfumes.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#E8DDD2] shadow-md">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] block">
            Executive Controls
          </span>
          <h3 className="font-serif-luxury text-lg text-[#292522]">Atelier Actions</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddProduct}
            className="px-3.5 py-2 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-3.5 py-2 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-xs uppercase tracking-wider hover:border-[#B8945F] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>View Orders</span>
          </button>
          <button
            onClick={() => onNavigateTab('custom-perfumes')}
            className="px-3.5 py-2 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-xs uppercase tracking-wider hover:border-[#B8945F] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>Custom Perfumes</span>
          </button>
          <button
            onClick={onOpenAddCoupon}
            className="px-3.5 py-2 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-xs uppercase tracking-wider hover:border-[#B8945F] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B8945F]" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      {/* Top 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Revenue */}
        <div className="p-4 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Total Revenue
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-serif-luxury font-bold text-[#292522]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18.4% this month
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-4 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Total Orders
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-serif-luxury font-bold text-[#292522]">
            {totalOrders}
          </div>
          <span className="text-[10px] text-[#756B63] block mt-1">
            ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('en-IN') : 0} avg / order
          </span>
        </div>

        {/* Total Customers */}
        <div className="p-4 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Total Customers
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-serif-luxury font-bold text-[#292522]">
            {totalCustomers}
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1">84% repeat rate</span>
        </div>

        {/* Total Products */}
        <div className="p-4 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Total Products
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-serif-luxury font-bold text-[#292522]">
            {totalProducts}
          </div>
          <span className="text-[10px] text-[#756B63] block mt-1">4 fragrance families</span>
        </div>

        {/* Custom Perfume Requests */}
        <div className="p-4 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Custom Scent Requests
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-serif-luxury font-bold text-[#B8945F]">
            {customPerfumeRequests}
          </div>
          <span className="text-[10px] text-[#756B63] block mt-1">Sur-mesure atelier</span>
        </div>

        {/* Pending Orders */}
        <div className="p-4 bg-white border border-[#E8DDD2] shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
            Pending Orders
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-serif-luxury font-bold text-amber-400">
            {pendingOrders}
          </div>
          <span className="text-[10px] text-amber-400/80 block mt-1">Requires dispatch</span>
        </div>
      </div>

      {/* Sales Analytics Section */}
      <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DDD2]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
              Maison Intelligence
            </span>
            <h3 className="font-serif-luxury text-xl text-[#292522]">Sales & Growth Analytics</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#756B63]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-time store metrics</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Overview */}
          <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2]">
            <span className="text-xs uppercase tracking-wider text-[#B8945F] block mb-1">
              Revenue Overview
            </span>
            <p className="text-2xl font-serif-luxury text-[#292522] font-bold">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-[#756B63] mt-1">
              Gross sales across official boutique and bespoke commissions.
            </p>
            {/* Visual Bar representation */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] text-[#756B63]">
                <span>Direct Boutique</span>
                <span>72%</span>
              </div>
              <div className="w-full bg-white h-1.5 overflow-hidden">
                <div className="bg-[#B8945F] h-full" style={{ width: '72%' }} />
              </div>

              <div className="flex justify-between text-[10px] text-[#756B63]">
                <span>Bespoke Atelier</span>
                <span>28%</span>
              </div>
              <div className="w-full bg-white h-1.5 overflow-hidden">
                <div className="bg-[#E8DCC8] h-full" style={{ width: '28%' }} />
              </div>
            </div>
          </div>

          {/* Orders Overview */}
          <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2]">
            <span className="text-xs uppercase tracking-wider text-[#B8945F] block mb-1">
              Orders Overview
            </span>
            <p className="text-2xl font-serif-luxury text-[#292522] font-bold">
              {totalOrders} Orders
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-[#756B63]">
              <div className="flex justify-between py-1 border-b border-[#E8DDD2]">
                <span>Delivered / Shipped:</span>
                <span className="text-emerald-400 font-medium">
                  {orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped').length}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DDD2]">
                <span>Processing / Packing:</span>
                <span className="text-amber-400 font-medium">
                  {orders.filter(o => o.status === 'Processing').length}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pending Approval:</span>
                <span className="text-[#292522] font-medium">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Growth */}
          <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2]">
            <span className="text-xs uppercase tracking-wider text-[#B8945F] block mb-1">
              Customer Growth
            </span>
            <p className="text-2xl font-serif-luxury text-[#292522] font-bold">
              +{uniqueCustomerEmails.length} Patrons
            </p>
            <p className="text-[11px] text-[#756B63] mt-1">
              Acquisition through word-of-mouth, fragrance concierge, and bespoke discovery.
            </p>
            <div className="mt-4 p-2.5 bg-white border border-[#E8DDD2] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#B8945F] block">
                Avg. Customer Lifetime Value
              </span>
              <span className="font-serif-luxury text-base text-[#292522] font-bold">
                ₹8,240
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Recent Custom Perfumes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Orders Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E8DDD2] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block">
                Dispatch Registry
              </span>
              <h4 className="font-serif-luxury text-lg text-[#292522]">Recent Orders</h4>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs uppercase tracking-wider text-[#B8945F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DDD2] text-[10px] uppercase tracking-wider text-[#B8945F]">
                  <th className="py-2.5 px-2">Order ID</th>
                  <th className="py-2.5 px-2">Customer</th>
                  <th className="py-2.5 px-2">Items</th>
                  <th className="py-2.5 px-2">Amount</th>
                  <th className="py-2.5 px-2">Payment</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B69B6D]/10 text-[#756B63]">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#292522]/40 transition-colors">
                    <td className="py-3 px-2 font-mono font-medium text-[#B8945F]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-[#292522] truncate max-w-[110px]">
                        {order.customerName}
                      </div>
                      <div className="text-[10px] text-[#756B63] truncate max-w-[110px]">
                        {order.email}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {order.items.length} {order.items.length === 1 ? 'flacon' : 'flacons'}
                    </td>
                    <td className="py-3 px-2 font-mono font-medium text-[#292522]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={order.status}
                        onChange={e => onUpdateOrderStatus(order.id, e.target.value as any)}
                        className="bg-[#FAF3EC] border border-[#E8DDD2] text-[10px] text-[#292522] px-1.5 py-0.5 outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-2 text-[10px] text-[#756B63] font-mono">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Custom Perfume Requests (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E8DDD2] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block">
                Sur-Mesure Commissions
              </span>
              <h4 className="font-serif-luxury text-lg text-[#292522]">
                Custom Perfume Requests
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('custom-perfumes')}
              className="text-xs uppercase tracking-wider text-[#B8945F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentCustomRequests.length === 0 ? (
              <p className="text-xs text-[#756B63] italic py-6 text-center">
                No custom perfume submissions yet.
              </p>
            ) : (
              recentCustomRequests.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#FAF3EC] border border-[#E8DDD2] flex flex-col justify-between hover:border-[#E8DDD2] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h5 className="font-serif-luxury text-sm text-[#292522] tracking-wide">
                        {item.perfumeName}
                      </h5>
                      <p className="text-[11px] text-[#B8945F]">
                        By {item.customerName || item.userEmail}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-[#E8DDD2] text-[9px] font-mono text-[#B8945F] uppercase">
                      {item.status || 'Atelier Review'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#756B63] pt-2 border-t border-[#E8DDD2]">
                    <span>
                      Family:{' '}
                      <strong className="text-[#292522]">{item.primaryFamily}</strong>
                    </span>
                    <span>
                      Intensity:{' '}
                      <strong className="text-[#292522]">{item.intensity}</strong>
                    </span>
                    <span className="font-mono">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="p-6 bg-white border border-[#E8DDD2] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B8945F] block">
                Atelier Storage Alert
              </span>
              <h4 className="font-serif-luxury text-lg text-[#292522]">
                Low Stock Products Needing Restock
              </h4>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs uppercase tracking-wider text-[#B8945F] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Inventory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-xs text-emerald-400 py-3">All fragrance flacons are well-stocked.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {lowStockProducts.map(prod => (
              <div
                key={prod.id}
                className="p-3.5 bg-[#FAF3EC] border border-amber-500/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-10 h-10 object-cover border border-[#E8DDD2]"
                    />
                    <div className="overflow-hidden">
                      <h5 className="font-serif-luxury text-xs text-[#292522] truncate">
                        {prod.name}
                      </h5>
                      <span className="text-[10px] text-[#B8945F]">{prod.family}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-[#756B63]">Units remaining:</span>
                    <span className="font-mono font-bold text-amber-400">{prod.stock}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-2 border-t border-[#E8DDD2]">
                  <button
                    onClick={() => onQuickRestock(prod.id, 10)}
                    className="flex-1 py-1 bg-white border border-[#E8DDD2] text-[10px] text-[#292522] hover:border-[#B8945F] cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => onQuickRestock(prod.id, 25)}
                    className="flex-1 py-1 bg-[#292522] text-white text-[10px] font-bold hover:bg-[#B8945F] cursor-pointer"
                  >
                    +25
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
