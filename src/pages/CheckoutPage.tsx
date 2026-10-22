import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order, Address } from '../types';
import { saveOrderToSupabaseClient } from '../lib/supabase';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Truck,
  Check,
  ArrowLeft,
  Copy,
  AlertCircle,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';

interface CheckoutPageProps {
  onBackToShop: () => void;
  onOrderPlaced: (order: Order) => void;
  onNavigateOrders?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToShop,
  onOrderPlaced,
  onNavigateOrders,
}) => {
  const { cart, subtotal, discount, grandTotal, clearCart, appliedCoupon } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Contact & Shipping Info
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || '');
  const [addressLine1, setAddressLine1] = useState(defaultAddr?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(defaultAddr?.addressLine2 || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '');

  // Shipping Speed
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const baseShipping = subtotal >= 4000 ? 0 : 149;
  const shippingCost = shippingMethod === 'express' ? baseShipping + 299 : baseShipping;

  // Payment Selection
  const [paymentProvider, setPaymentProvider] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay');
  const [upiId, setUpiId] = useState('patron@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');

  // Sandbox simulation controls (clearly labeled per prompt)
  const [simulatedOutcome, setSimulatedOutcome] = useState<'success' | 'failed' | 'pending'>('success');

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [failedOrderInfo, setFailedOrderInfo] = useState<{ orderNumber: string; reason: string } | null>(null);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const finalTotal = Math.max(0, subtotal - discount + shippingCost);

  const handleCopyOrderNumber = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrder(true);
    showToast(`Order reference ${orderNum} copied to clipboard`, 'success');
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !addressLine1 || !city || !postalCode) {
      showToast('Please complete all required shipping fields', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your shopping bag is empty', 'error');
      return;
    }

    setIsProcessing(true);
    setFailedOrderInfo(null);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state: state || 'Maharashtra',
      postalCode,
      country: 'India',
      isDefault: true,
    };

    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const orderPayload = {
      userId: user?.id,
      customerName: fullName,
      email,
      phone,
      shippingAddress,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.selectedSize,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images[0],
      })),
      subtotal,
      discount,
      shippingCost,
      total: finalTotal,
      paymentMethod: paymentProvider,
      paymentStatus: paymentProvider === 'cod' ? 'pending' : simulatedOutcome === 'failed' ? 'failed' : simulatedOutcome === 'pending' ? 'pending' : 'paid',
      simulatedPaymentOutcome: paymentProvider === 'cod' ? 'cod' : simulatedOutcome,
      idempotencyKey,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const createdOrder: Order = data.data;

        if (createdOrder.paymentStatus === 'failed') {
          setFailedOrderInfo({
            orderNumber: createdOrder.orderNumber,
            reason: createdOrder.paymentFailureReason || 'Card authorization was declined by the bank network.',
          });
          showToast('Payment authorization was unsuccessful', 'error');
        } else {
          // If server reported Supabase not synced yet, try client direct sync as well
          if (!data.supabase?.synced) {
            saveOrderToSupabaseClient(createdOrder).catch(() => {});
          }
          setConfirmedOrder(createdOrder);
          clearCart();
          onOrderPlaced(createdOrder);
          showToast(`Order ${createdOrder.orderNumber} confirmed!`, 'success');
        }
      } else {
        throw new Error(data.message || 'Order creation failed');
      }
    } catch (err: any) {
      // Local fallback in sandbox
      if (simulatedOutcome === 'failed') {
        setFailedOrderInfo({
          orderNumber: `ELASIRS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          reason: 'Card authorization declined by issuing bank (Sandbox Simulation)',
        });
        showToast('Payment authorization declined', 'error');
      } else {
        const mockOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: `ELASIRS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: user?.id,
          customerName: fullName,
          email,
          phone,
          shippingAddress,
          items: orderPayload.items,
          subtotal,
          discount,
          shippingCost,
          total: finalTotal,
          paymentMethod: paymentProvider,
          paymentStatus: paymentProvider === 'cod' ? 'pending' : simulatedOutcome === 'pending' ? 'pending' : 'paid',
          paymentId: `pay_mock_${Date.now()}`,
          status: 'Order Confirmed',
          trackingNumber: `BD-AIR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          courierProvider: 'Blue Dart Air Express (Insured)',
          estimatedDelivery: '2–4 Business Days',
          createdAt: new Date().toISOString(),
        };
        // Also persist to Supabase backend table
        saveOrderToSupabaseClient(mockOrder).catch(() => {});
        setConfirmedOrder(mockOrder);
        clearCart();
        onOrderPlaced(mockOrder);
        showToast(`Order ${mockOrder.orderNumber} confirmed!`, 'success');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. PAYMENT FAILURE SCREEN
  if (failedOrderInfo) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 sm:px-6 lg:px-8 text-[#292522]">
        <div className="max-w-2xl mx-auto bg-white border border-[#E8DDD2] p-8 sm:p-12 shadow-xl rounded-sm">
          <div className="text-center pb-8 border-b border-[#E8DDD2]">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertCircle className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-rose-600 font-semibold block">
              Authorization Unsuccessful
            </span>

            <h1 className="text-2xl sm:text-3xl font-serif-luxury text-[#292522] uppercase tracking-wide mt-2 font-normal">
              PAYMENT COULD NOT BE VERIFIED
            </h1>

            <p className="mt-3 text-xs text-[#756B63] max-w-md mx-auto leading-relaxed">
              {failedOrderInfo.reason}
            </p>

            <div className="mt-4 p-3 bg-[#FAF3EC] border border-[#E8DDD2] inline-block rounded-xs text-xs font-mono">
              <span className="text-[#756B63]">Reference: </span>
              <span className="font-semibold text-[#292522]">{failedOrderInfo.orderNumber}</span>
            </div>
          </div>

          <div className="py-6 text-xs text-[#756B63] space-y-3">
            <p className="font-medium text-[#292522]">What happens next?</p>
            <ul className="space-y-1.5 list-disc list-inside font-light">
              <li>No funds were deducted from your account.</li>
              <li>Your shopping bag has been preserved in its current state.</li>
              <li>You may select an alternative payment method (e.g. UPI, another card, or Cash on Delivery).</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#E8DDD2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => {
                setFailedOrderInfo(null);
                setSimulatedOutcome('success');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-colors rounded-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Payment</span>
            </button>

            <button
              onClick={onBackToShop}
              className="text-xs uppercase tracking-wider text-[#756B63] hover:text-[#292522] font-semibold cursor-pointer"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PAYMENT SUCCESS / PENDING SCREEN
  if (confirmedOrder) {
    const isPending = confirmedOrder.paymentStatus === 'pending';

    return (
      <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 sm:px-6 lg:px-8 text-[#292522]">
        <div className="max-w-3xl mx-auto bg-white border border-[#E8DDD2] p-8 sm:p-12 shadow-xl rounded-sm animate-in fade-in">
          <div className="text-center pb-8 border-b border-[#E8DDD2]">
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4 ${
              isPending
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-[#FAF3EC] border-[#B8945F] text-[#B8945F]'
            }`}>
              {isPending ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>

            <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block">
              {isPending ? 'Maison ELASIRS · Order Registered' : 'Maison ELASIRS · Order Confirmed'}
            </span>

            <h1 className="text-3xl sm:text-4xl font-serif-luxury text-[#292522] uppercase tracking-wide mt-2 font-normal">
              {isPending ? 'RESERVATION PENDING CONFIRMATION' : 'THANK YOU FOR YOUR PATRONAGE'}
            </h1>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-sm text-[#756B63]">Order Reference:</span>
              <span className="text-base font-mono font-bold text-[#292522] tracking-wide">
                {confirmedOrder.orderNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopyOrderNumber(confirmedOrder.orderNumber)}
                className="p-1.5 hover:bg-[#FAF3EC] rounded-xs text-[#B8945F] transition-colors cursor-pointer"
                title="Copy order number"
              >
                {copiedOrder ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="mt-2 text-xs text-[#756B63] max-w-lg mx-auto">
              {isPending
                ? 'Your order is recorded and awaiting final courier / bank confirmation. A verification dispatch notification will be transmitted.'
                : 'Your order has been verified and registered at our atelier. Your artisanal flacons are reserved.'}
            </p>
          </div>

          {/* Payment & Delivery Status Verification Bar */}
          <div className="py-6 border-b border-[#E8DDD2] grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left text-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#756B63] block font-medium">
                Payment Status
              </span>
              <span className={`inline-flex items-center gap-1.5 mt-1 font-semibold uppercase text-[11px] ${
                isPending ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>{confirmedOrder.paymentStatus === 'paid' ? 'Paid · Verified' : 'Pending · COD / Auth'}</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#756B63] block font-medium">
                Payment Method
              </span>
              <span className="font-semibold text-[#292522] mt-1 block uppercase">
                {confirmedOrder.paymentMethod}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#756B63] block font-medium">
                Estimated Delivery
              </span>
              <span className="font-semibold text-[#292522] mt-1 block">
                {confirmedOrder.estimatedDelivery || '2–4 Business Days'}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#756B63] block font-medium">
                Air Waybill / Tracking
              </span>
              <span className="font-mono font-semibold text-[#B8945F] mt-1 block">
                {confirmedOrder.trackingNumber || 'Assigned upon dispatch'}
              </span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="py-6 border-b border-[#E8DDD2] space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-[#292522] font-semibold mb-3">
              Reserved Flacons ({confirmedOrder.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-14 object-contain bg-[#FAF3EC] p-1 border border-[#E8DDD2] rounded-xs"
                  />
                  <div>
                    <p className="font-serif-luxury text-sm text-[#292522]">
                      {item.productName}
                    </p>
                    <p className="text-[10px] text-[#756B63] uppercase tracking-wider">
                      {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[#292522] tabular-nums">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="py-6 border-b border-[#E8DDD2] text-xs text-[#756B63] leading-relaxed">
            <h4 className="text-xs uppercase tracking-wider text-[#292522] font-semibold mb-2">
              Delivery Destination
            </h4>
            <p className="font-semibold text-[#292522]">{confirmedOrder.customerName}</p>
            <p>{confirmedOrder.shippingAddress.addressLine1}</p>
            {confirmedOrder.shippingAddress.addressLine2 && (
              <p>{confirmedOrder.shippingAddress.addressLine2}</p>
            )}
            <p>
              {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} -{' '}
              {confirmedOrder.shippingAddress.postalCode}
            </p>
            <p className="text-[#756B63] mt-1">Contact: {confirmedOrder.phone} · {confirmedOrder.email}</p>
          </div>

          {/* Total & Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#756B63] block font-medium">
                Total Amount
              </span>
              <span className="text-2xl font-serif-luxury text-[#292522] tabular-nums font-semibold">
                ₹{confirmedOrder.total.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onNavigateOrders && (
                <button
                  type="button"
                  onClick={onNavigateOrders}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-[#292522] text-[#292522] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#FAF3EC] transition-colors rounded-xs cursor-pointer text-center"
                >
                  View My Orders
                </button>
              )}

              <button
                type="button"
                onClick={onBackToShop}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-colors rounded-xs shadow-xs cursor-pointer text-center"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 lg:py-16 text-[#292522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#756B63] hover:text-[#292522] transition-colors mb-8 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-4 h-4 text-[#B8945F]" />
          <span>Return to Boutique</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Form Column (lg:col-span-7) */}
          <div className="lg:col-span-7">
            <div className="pb-6 border-b border-[#E8DDD2] mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B8945F] font-semibold block mb-1">
                Secure Checkout
              </span>
              <h1 className="text-3xl font-serif-luxury text-[#292522] uppercase tracking-wide font-normal">
                DELIVERY & PAYMENT
              </h1>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Contact Information */}
              <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#292522] font-semibold flex items-center justify-between">
                  <span>1. Contact Details</span>
                  <Lock className="w-3.5 h-3.5 text-[#B8945F]" />
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Siddharth Singhania"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
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
                      placeholder="siddharth@example.com"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#292522] font-semibold">
                  2. Shipping Address
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Street Address / Villa / Apartment *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={e => setAddressLine1(e.target.value)}
                      placeholder="e.g. Flat 12B, The Imperial, Tardeo Road"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                      Apartment, Suite, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={e => setAddressLine2(e.target.value)}
                      placeholder="Opposite Royal Orchid"
                      className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={e => setState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#756B63] uppercase tracking-wider mb-1 font-medium">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="400034"
                        className="w-full p-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] outline-none focus:border-[#292522] rounded-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#292522] font-semibold">
                  3. Delivery Speed
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={`p-4 border rounded-xs cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-[#292522] bg-[#FAF3EC]'
                        : 'border-[#E8DDD2] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#292522]">
                      <span>Standard Courier</span>
                      <span className="text-[#B8945F]">
                        {baseShipping === 0 ? 'Complimentary' : '₹149'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#756B63] mt-1 font-light">
                      Delivered in 2–4 business days with shockproof luxury packing.
                    </p>
                  </div>

                  <div
                    onClick={() => setShippingMethod('express')}
                    className={`p-4 border rounded-xs cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#292522] bg-[#FAF3EC]'
                        : 'border-[#E8DDD2] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#292522]">
                      <span>Priority Climate-Controlled</span>
                      <span className="text-[#B8945F]">
                        ₹{baseShipping + 299}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#756B63] mt-1 font-light">
                      Guaranteed temperature-regulated dispatch within 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Options (Razorpay / Stripe / COD) */}
              <div className="p-6 bg-white border border-[#E8DDD2] rounded-sm shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[#292522] font-semibold">
                    4. Payment Selection
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#B8945F] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Razorpay & Stripe Certified</span>
                  </div>
                </div>

                {/* Gateway Status & Sandbox Mode Indicator */}
                <div className="p-3 bg-[#FAF3EC] border border-[#B8945F]/40 rounded-xs text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#B8945F] font-semibold text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Payment Gateway: Sandbox Test Mode Active</span>
                  </div>
                  <p className="text-[11px] text-[#756B63] leading-relaxed">
                    Live production payment gateway credentials are pending setup in environment variables. Transactions operate in secure test mode without charging real credit cards.
                  </p>
                  {paymentProvider !== 'cod' && (
                    <div className="pt-2 border-t border-[#E8DDD2] flex flex-wrap items-center gap-4 text-[11px]">
                      <span className="text-[#292522] font-medium">Test Simulation:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[#292522]">
                        <input
                          type="radio"
                          name="simOutcome"
                          checked={simulatedOutcome === 'success'}
                          onChange={() => setSimulatedOutcome('success')}
                          className="accent-[#292522]"
                        />
                        <span>Success (Verified)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-rose-700">
                        <input
                          type="radio"
                          name="simOutcome"
                          checked={simulatedOutcome === 'failed'}
                          onChange={() => setSimulatedOutcome('failed')}
                          className="accent-rose-600"
                        />
                        <span>Decline (Failure Screen)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-amber-700">
                        <input
                          type="radio"
                          name="simOutcome"
                          checked={simulatedOutcome === 'pending'}
                          onChange={() => setSimulatedOutcome('pending')}
                          className="accent-amber-600"
                        />
                        <span>Pending Webhook</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('razorpay')}
                    className={`p-3 text-center border transition-all cursor-pointer rounded-xs ${
                      paymentProvider === 'razorpay'
                        ? 'border-[#292522] bg-[#292522] text-white shadow-xs'
                        : 'border-[#E8DDD2] bg-[#FAF3EC] text-[#756B63] hover:border-[#292522]'
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wider">
                      Razorpay
                    </span>
                    <span className={`block text-[10px] mt-0.5 ${paymentProvider === 'razorpay' ? 'text-[#E8DCC8]' : 'text-[#B8945F]'}`}>
                      UPI · Cards · Net
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider('stripe')}
                    className={`p-3 text-center border transition-all cursor-pointer rounded-xs ${
                      paymentProvider === 'stripe'
                        ? 'border-[#292522] bg-[#292522] text-white shadow-xs'
                        : 'border-[#E8DDD2] bg-[#FAF3EC] text-[#756B63] hover:border-[#292522]'
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wider">
                      Stripe
                    </span>
                    <span className={`block text-[10px] mt-0.5 ${paymentProvider === 'stripe' ? 'text-[#E8DCC8]' : 'text-[#B8945F]'}`}>
                      International Card
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider('cod')}
                    className={`p-3 text-center border transition-all cursor-pointer rounded-xs ${
                      paymentProvider === 'cod'
                        ? 'border-[#292522] bg-[#292522] text-white shadow-xs'
                        : 'border-[#E8DDD2] bg-[#FAF3EC] text-[#756B63] hover:border-[#292522]'
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wider">
                      COD
                    </span>
                    <span className={`block text-[10px] mt-0.5 ${paymentProvider === 'cod' ? 'text-[#E8DCC8]' : 'text-[#B8945F]'}`}>
                      Pay on Delivery
                    </span>
                  </button>
                </div>

                {/* Provider specific inputs */}
                {paymentProvider === 'razorpay' && (
                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] text-xs space-y-3 rounded-xs">
                    <p className="text-[11px] text-[#756B63]">
                      Razorpay Instant Checkout simulation: Supports Google Pay, PhonePe, Paytm UPI, and Indian Cards.
                    </p>
                    <div>
                      <label className="block text-[#756B63] uppercase tracking-wider text-[10px] mb-1 font-medium">
                        Virtual Payment Address (UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                      />
                    </div>
                  </div>
                )}

                {paymentProvider === 'stripe' && (
                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] text-xs space-y-3 rounded-xs">
                    <p className="text-[11px] text-[#756B63]">
                      Stripe Global Checkout simulation: Supports Visa, Mastercard, and American Express.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-3">
                        <label className="block text-[#756B63] uppercase tracking-wider text-[10px] mb-1 font-medium">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[#756B63] uppercase tracking-wider text-[10px] mb-1 font-medium">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={e => setCardExp(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[#756B63] uppercase tracking-wider text-[10px] mb-1 font-medium">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E8DDD2] text-[#292522] outline-none rounded-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentProvider === 'cod' && (
                  <div className="p-4 bg-[#FAF3EC] border border-[#E8DDD2] text-xs rounded-xs">
                    <p className="text-[#756B63] leading-relaxed">
                      Cash on Delivery is available for domestic orders. Please ensure cash or UPI is available upon courier arrival.
                    </p>
                  </div>
                )}
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 rounded-xs"
              >
                {isProcessing ? (
                  <span>AUTHORIZING TRANSACTION...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>PLACE ORDER · ₹{finalTotal.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary Column (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white border border-[#E8DDD2] p-6 sm:p-8 space-y-6 rounded-sm shadow-sm">
              <h3 className="font-serif-luxury text-xl text-[#292522] uppercase tracking-wide pb-4 border-b border-[#E8DDD2] font-normal">
                Order Summary ({cart.length})
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-16 object-contain bg-[#FAF3EC] p-1 border border-[#E8DDD2] shrink-0 rounded-xs"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif-luxury text-sm text-[#292522] font-normal">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-[#B8945F] uppercase tracking-wider mt-0.5 font-semibold">
                          {item.selectedSize} · Qty {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-[#292522] tabular-nums">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdowns */}
              <div className="pt-4 border-t border-[#E8DDD2] space-y-2 text-xs text-[#756B63]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#292522] font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#B8945F] font-semibold">
                    <span>Promotional Discount</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="tabular-nums">
                    {shippingCost === 0 ? 'Complimentary' : `₹${shippingCost}`}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-[#E8DDD2] flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#756B63] block font-medium">
                    Total
                  </span>
                  <span className="text-[10px] text-[#756B63]/70">
                    Includes GST & luxury packaging
                  </span>
                </div>
                <span className="text-2xl font-serif-luxury text-[#292522] tabular-nums font-semibold">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-4 border-t border-[#E8DDD2] text-[11px] text-[#756B63] space-y-2 font-light">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#B8945F]" />
                  <span>Complimentary 2ml discovery sample included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#B8945F]" />
                  <span>14-day unopened flacon return guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
