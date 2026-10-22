import React from 'react';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  ShoppingBag,
  Users,
  Star,
  Tags,
  Boxes,
  Percent,
  Bot,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  Compass,
  Megaphone,
  RefreshCw,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'custom-perfumes'
  | 'orders'
  | 'returns'
  | 'customers'
  | 'reviews'
  | 'categories'
  | 'inventory'
  | 'coupons'
  | 'announcements'
  | 'ai-knowledge'
  | 'settings'
  | 'security';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingOrdersCount: number;
  lowStockCount: number;
  customRequestsCount: number;
  pendingReturnsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  pendingOrdersCount,
  lowStockCount,
  customRequestsCount,
  pendingReturnsCount,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'custom-perfumes', label: 'Custom Perfumes', icon: Sparkles, badge: customRequestsCount },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'returns', label: 'Returns & Refunds', icon: RefreshCw, badge: pendingReturnsCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'coupons', label: 'Coupons', icon: Percent },
    { id: 'announcements', label: 'Announcement Ribbon', icon: Megaphone },
    { id: 'ai-knowledge', label: 'AI Knowledge', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFDF9] border-r border-[#E8DDD2] text-[#292522]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E8DDD2] flex items-center justify-between bg-white">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8945F] font-mono block font-semibold">
            Maison Atelier
          </span>
          <h2 className="font-serif-luxury text-2xl tracking-[0.15em] text-[#292522] uppercase">
            ELASIRS
          </h2>
          <span className="text-[9px] uppercase tracking-widest text-[#756B63] block mt-0.5 font-medium">
            Admin Management
          </span>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-[#756B63] hover:text-[#292522] border border-[#E8DDD2] rounded-xs"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xs ${
                isActive
                  ? 'bg-[#292522] text-white font-semibold shadow-xs'
                  : 'text-[#756B63] hover:text-[#292522] hover:bg-[#FAF3EC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8945F]' : 'text-[#756B63]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs ${
                  isActive ? 'bg-[#B8945F] text-[#292522]' : 'bg-[#FAF3EC] text-[#292522] border border-[#E8DDD2]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer: Admin user profile & Logout */}
      <div className="p-4 border-t border-[#E8DDD2] bg-white">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#FAF3EC] border border-[#B8945F] text-[#B8945F] font-bold text-xs flex items-center justify-center font-serif-luxury">
            ID
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#292522] truncate font-semibold">Ishika Darra</p>
            <p className="text-[10px] text-[#B8945F] uppercase tracking-wider font-medium">Super Administrator</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-[#756B63] hover:text-red-700 hover:bg-red-50 border border-[#E8DDD2] hover:border-red-200 transition-colors cursor-pointer rounded-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#292522]/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
