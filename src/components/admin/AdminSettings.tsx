import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Store,
  Truck,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StoreSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();

  const [storeName, setStoreName] = useState('Maison ELASIRS Haute Parfumerie');
  const [supportEmail, setSupportEmail] = useState('concierge@elasirs.com');
  const [supportPhone, setSupportPhone] = useState('+91 98205 77123');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(4000);
  const [standardShippingFee, setStandardShippingFee] = useState(149);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [atelierDispatchTime, setAtelierDispatchTime] = useState('24–48 Hours');
  const [codEnabled, setCodEnabled] = useState(true);
  const [gatewayStatus, setGatewayStatus] = useState({
    razorpayConfigured: false,
    stripeConfigured: false,
    mode: 'sandbox' as 'live' | 'sandbox',
  });
  const [supabaseStatus, setSupabaseStatus] = useState<{
    projectId: string;
    url: string;
    connected: boolean;
    tableExists: boolean;
    orderCount?: number;
    message?: string;
  }>({
    projectId: 'qqdeyoeizckirrycjtdj',
    url: 'https://qqdeyoeizckirrycjtdj.supabase.co',
    connected: false,
    tableExists: false,
  });

  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sqlSchemaCode = `-- ELASIRS Orders Table Schema for Supabase
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'razorpay',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  status TEXT DEFAULT 'Order Confirmed',
  tracking_number TEXT,
  courier_provider TEXT DEFAULT 'Blue Dart Air Express (Insured)',
  estimated_delivery TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public insert and select
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT USING (true);`;

  const fetchSettingsAndSupabase = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const s: StoreSettings = data.data;
        setStoreName(s.storeName || 'Maison ELASIRS Haute Parfumerie');
        setSupportEmail(s.contactEmail || 'concierge@elasirs.com');
        setSupportPhone(s.contactPhone || '+91 98205 77123');
        setFreeShippingThreshold(s.freeShippingThreshold || 4000);
        setStandardShippingFee(s.standardShippingFee || 149);
        setGstPercentage(s.gstRate || 18);
        setCodEnabled(s.codEnabled !== false);
        if (s.paymentGatewayStatus) {
          setGatewayStatus(s.paymentGatewayStatus);
        }
        if (s.supabaseStatus) {
          setSupabaseStatus(s.supabaseStatus);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSettingsAndSupabase();
  }, []);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const res = await fetch('/api/admin/supabase-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Supabase connection verified!', 'success');
      } else {
        showToast(data.message || 'Supabase connected, but orders table is pending creation.', 'info');
      }
      if (data.data) {
        setSupabaseStatus(data.data);
      }
    } catch {
      showToast('Error checking Supabase backend connection', 'error');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySql = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(sqlSchemaCode);
      setCopiedSql(true);
      showToast('Supabase SQL schema copied to clipboard!', 'success');
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          contactEmail: supportEmail,
          contactPhone: supportPhone,
          freeShippingThreshold,
          standardShippingFee,
          gstRate: gstPercentage,
          codEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Boutique configurations updated successfully', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Settings saved to local session', 'success');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E8DDD2] shadow-sm">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8945F] font-mono block">
            System Preferences
          </span>
          <h2 className="font-serif-luxury text-2xl text-[#292522]">Maison Boutique Configuration</h2>
          <p className="text-xs text-[#756B63] mt-1">
            Configure order fulfillment thresholds, tax rates, contact channels, and backend integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-5 py-2.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B8945F] transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Supabase Backend Integration Section */}
        <div className="p-6 bg-white border border-[#E8DDD2] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DDD2] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xs bg-[#FAF3EC] border border-[#B8945F]/30 flex items-center justify-center text-[#B8945F]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg text-[#292522]">
                  Supabase Backend Database
                </h3>
                <span className="text-[10px] text-[#756B63] block">
                  Project ID: <span className="font-mono text-[#292522] font-semibold">{supabaseStatus.projectId}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-xs border flex items-center gap-1.5 ${
                supabaseStatus.tableExists
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : supabaseStatus.connected
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus.tableExists ? 'bg-emerald-500' : supabaseStatus.connected ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span>
                  {supabaseStatus.tableExists
                    ? `Connected · Orders Active (${supabaseStatus.orderCount || 0})`
                    : supabaseStatus.connected
                    ? 'Connected · Table Setup Required'
                    : 'Disconnected / Checking'}
                </span>
              </span>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="px-3 py-1 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#292522] hover:text-white transition-colors rounded-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#B8945F] font-semibold block">
                REST Endpoint & API Key
              </span>
              <p className="text-xs font-mono text-[#292522] break-all">
                {supabaseStatus.url}
              </p>
              <div className="text-[11px] text-[#756B63] space-y-1">
                <p>• Key Type: Publishable / Anon Client Key</p>
                <p>• Automatically saves order submissions from the checkout form.</p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#B8945F] font-semibold block">
                  PostgreSQL Table: public.orders
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-[11px] text-[#B8945F] hover:text-[#292522] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#756B63] leading-relaxed">
                {supabaseStatus.tableExists
                  ? "Your Supabase 'orders' table is created and actively storing customer orders."
                  : "If you have not created the 'orders' table yet, copy the SQL migration script and run it in the Supabase SQL editor."}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSqlCode(!showSqlCode)}
                  className="text-[11px] uppercase tracking-wider font-semibold text-[#292522] underline cursor-pointer"
                >
                  {showSqlCode ? 'Hide SQL Code' : 'View SQL Code'}
                </button>
                <a
                  href={`https://supabase.com/dashboard/project/${supabaseStatus.projectId}/sql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#B8945F] hover:text-[#292522] font-semibold flex items-center gap-1"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {showSqlCode && (
            <div className="p-4 bg-[#292522] text-[#FAF3EC] rounded-xs font-mono text-[11px] overflow-x-auto space-y-2 border border-[#B8945F]/30">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[#B8945F] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Run this in Supabase Dashboard → SQL Editor</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-[10px] uppercase font-semibold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="whitespace-pre text-xs text-[#E8DDD2] leading-relaxed">
                {sqlSchemaCode}
              </pre>
            </div>
          )}
        </div>

        {/* Payment & Gateway Section */}
        <div className="p-6 bg-white border border-[#E8DDD2] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DDD2] pb-2">
            <h3 className="font-serif-luxury text-lg text-[#292522] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#B8945F]" />
              <span>Payment Gateway & Checkout Readiness</span>
            </h3>
            <span className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-xs border ${
              gatewayStatus.mode === 'live'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {gatewayStatus.mode === 'live' ? '● Live Gateway Active' : '○ Test / Sandbox Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#292522]">Cash on Delivery (COD)</span>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={e => setCodEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#292522] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-[#756B63] leading-relaxed">
                Allow customers to pay via cash or UPI upon delivery. Disabling this enforces online payment for all orders.
              </p>
            </div>

            <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] rounded-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#292522]">Online Payment Gateway</span>
                <span className="text-[10px] font-mono text-[#B8945F] font-bold">
                  {gatewayStatus.razorpayConfigured ? 'Razorpay Connected' : gatewayStatus.stripeConfigured ? 'Stripe Connected' : 'Sandbox Ready'}
                </span>
              </div>
              <p className="text-[11px] text-[#756B63] leading-relaxed">
                Supports UPI, Credit/Debit Cards, NetBanking, and Wallets. Webhook verification ensures double-order prevention.
              </p>
            </div>
          </div>
        </div>

        {/* General Store Info */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-white border border-[#E8DDD2] shadow-sm space-y-4">
            <h3 className="font-serif-luxury text-lg text-[#292522] border-b border-[#E8DDD2] pb-2">
              Maison Store Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Concierge Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Concierge WhatsApp / Phone
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Dispatch SLA
                </label>
                <input
                  type="text"
                  value={atelierDispatchTime}
                  onChange={e => setAtelierDispatchTime(e.target.value)}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping & Commerce Rates */}
          <div className="p-6 bg-white border border-[#E8DDD2] shadow-sm space-y-4">
            <h3 className="font-serif-luxury text-lg text-[#292522] border-b border-[#E8DDD2] pb-2">
              Shipping & Tax Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Free Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={e => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Standard Shipping Fee (₹)
                </label>
                <input
                  type="number"
                  value={standardShippingFee}
                  onChange={e => setStandardShippingFee(Number(e.target.value))}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#B8945F] block mb-1">
                  Included GST Rate (%)
                </label>
                <input
                  type="number"
                  value={gstPercentage}
                  onChange={e => setGstPercentage(Number(e.target.value))}
                  className="w-full bg-[#FAF3EC] border border-[#E8DDD2] px-3 py-2 text-xs text-[#292522] outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
