import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExplore }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shippingCost,
    grandTotal,
    freeShippingThreshold,
    freeShippingRemaining,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setIsApplying(true);
    await applyCoupon(couponInput);
    setIsApplying(false);
    setCouponInput('');
  };

  const progressPercent = Math.min(
    100,
    Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292522]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF9] border-l border-[#E8DDD2] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E8DDD2] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#B8945F]" />
                <h3 className="font-serif-luxury text-xl tracking-wider text-[#292522] uppercase font-normal">
                  Your Olfactory Bag
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-[#756B63] hover:text-[#292522] transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="mt-4 pt-3 border-t border-[#E8DDD2]">
              {freeShippingRemaining > 0 ? (
                <div className="text-xs text-[#756B63] font-light flex items-center justify-between">
                  <span>
                    You are <strong className="text-[#292522] font-semibold tabular-nums">₹{freeShippingRemaining.toLocaleString('en-IN')}</strong> away from FREE SHIPPING
                  </span>
                  <span className="text-[11px] font-semibold text-[#B8945F] tabular-nums">{progressPercent}%</span>
                </div>
              ) : (
                <div className="text-xs text-[#B8945F] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Complimentary Insured Delivery Unlocked</span>
                </div>
              )}
              {/* Progress Bar */}
              <div className="w-full bg-[#FAF3EC] h-1.5 rounded-full mt-2 overflow-hidden border border-[#E8DDD2]">
                <div
                  className="bg-[#B8945F] h-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-[#FFFDF9]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-[#B8945F]/40 stroke-1 mb-4" />
                <p className="font-serif-luxury text-xl text-[#292522]">Your bag is empty</p>
                <p className="text-xs text-[#756B63] mt-1 max-w-xs font-light">
                  Discover our artisanal French and Indian natural compositions.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onExplore();
                  }}
                  className="mt-6 px-7 py-3 bg-[#292522] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#B8945F] transition-colors rounded-xs shadow-xs cursor-pointer"
                >
                  Discover Fragrances
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${idx}`}
                  className="flex gap-4 p-3.5 bg-white border border-[#E8DDD2] rounded-xs shadow-xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-contain bg-[#FAF3EC] p-1.5 shrink-0 border border-[#E8DDD2]"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-serif-luxury text-base text-[#292522] leading-tight font-normal">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-[#B8945F] uppercase tracking-wider mt-0.5 font-semibold">
                            {item.selectedSize} · {item.product.type}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          className="text-[#756B63] hover:text-red-500 p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E8DDD2] bg-[#FAF3EC] rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                          className="px-2.5 py-0.5 text-xs text-[#292522] hover:text-[#B8945F] font-bold cursor-pointer"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs text-[#292522] font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                          className="px-2.5 py-0.5 text-xs text-[#292522] hover:text-[#B8945F] font-bold cursor-pointer"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#756B63] block">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </span>
                        <span className="text-xs font-semibold text-[#292522] tabular-nums">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal, Coupon, Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8DDD2] bg-white space-y-4">
              {/* Coupon Section */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF3EC] border border-[#B8945F]/40 text-xs rounded-xs">
                    <div className="flex items-center gap-2 text-[#292522]">
                      <Tag className="w-3.5 h-3.5 text-[#B8945F]" />
                      <span>
                        <strong className="tracking-widest font-bold">{appliedCoupon.code}</strong> (
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% off`
                          : `₹${appliedCoupon.discountValue} off`}
                        )
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FAF3EC] border border-[#E8DDD2] text-xs text-[#292522] uppercase tracking-wider outline-none focus:border-[#292522] rounded-xs"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-4 py-2 bg-[#292522] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#B8945F] transition-colors cursor-pointer rounded-xs"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Calculations breakdown */}
              <div className="space-y-1.5 text-xs text-[#756B63] pb-3 border-b border-[#E8DDD2]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#292522]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#B8945F] font-semibold">
                    <span>Discount</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="tabular-nums">
                    {shippingCost === 0 ? (
                      <span className="text-[#B8945F] uppercase text-[10px] tracking-wider font-semibold">
                        Complimentary
                      </span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-0.5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#756B63] block font-medium">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-[#756B63]/70">Inclusive of 18% GST</span>
                </div>
                <span className="text-2xl font-serif-luxury text-[#292522] tabular-nums font-semibold">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Action Buttons: PROCEED TO CHECKOUT / CONTINUE SHOPPING */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeCart();
                    onCheckout();
                  }}
                  className="w-full py-3.5 bg-[#292522] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#B8945F] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-xs"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      closeCart();
                      onExplore();
                    }}
                    className="flex-1 py-2.5 border border-[#E8DDD2] bg-white text-[#292522] text-[11px] uppercase tracking-wider hover:border-[#292522] transition-colors cursor-pointer text-center rounded-xs font-medium"
                  >
                    CONTINUE SHOPPING
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      onCheckout();
                    }}
                    className="flex-1 py-2.5 bg-[#FAF3EC] border border-[#E8DDD2] text-[#292522] text-[11px] uppercase tracking-wider hover:border-[#B8945F] transition-colors cursor-pointer text-center rounded-xs font-semibold"
                  >
                    VIEW CART
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] text-[#756B63]/70 uppercase tracking-widest pt-1">
                Safe 256-bit Encrypted Checkout · Razorpay & Stripe Ready
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
