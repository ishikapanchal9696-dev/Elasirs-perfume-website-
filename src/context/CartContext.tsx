import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: string, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  grandTotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 4000;
const STANDARD_SHIPPING_FEE = 149;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elasirs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('elasirs_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('elasirs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('elasirs_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('elasirs_coupon');
    }
  }, [appliedCoupon]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Free shipping check
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;

  // Discount calculation
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  const addToCart = (product: Product, selectedSize?: string, quantity: number = 1) => {
    const size = selectedSize || product.variants[0]?.size || '50ml';
    const variant = product.variants.find(v => v.size === size);
    const price = variant ? variant.price : product.price;
    const maxStock = product.stock || 25;

    let reachedMax = false;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIdx > -1) {
        const currentQty = prev[existingIdx].quantity;
        const targetQty = currentQty + quantity;

        if (targetQty > maxStock) {
          reachedMax = true;
          const next = [...prev];
          next[existingIdx] = { ...next[existingIdx], quantity: maxStock };
          return next;
        }

        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: targetQty,
        };
        return next;
      } else {
        const initialQty = Math.min(maxStock, quantity);
        if (quantity > maxStock) reachedMax = true;
        return [...prev, { product, selectedSize: size, price, quantity: initialQty }];
      }
    });

    if (reachedMax) {
      showToast(`Only ${maxStock} flacons available in current atelier reserve. Quantity adjusted.`, 'info');
    } else {
      showToast(`Added ${product.name} (${size}) to your bag`, 'success');
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === selectedSize)));
    showToast('Removed from bag', 'info');
  };

  const updateQuantity = (productId: string, selectedSize: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId && item.selectedSize === selectedSize) {
            const maxStock = item.product.stock || 25;
            const nextQty = item.quantity + delta;

            if (nextQty > maxStock) {
              showToast(`Only ${maxStock} flacons remaining in stock`, 'info');
              return { ...item, quantity: maxStock };
            }

            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      showToast('Please enter a promotion code', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAppliedCoupon({
          code: data.data.code,
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
          description: data.data.description,
        });
        showToast(`Promo code ${data.data.code} applied!`, 'success');
        return true;
      } else {
        showToast(data.message || 'Invalid promotion code', 'error');
        return false;
      }
    } catch {
      // Local fallback
      const upper = code.trim().toUpperCase();
      if (upper === 'WELCOME10') {
        setAppliedCoupon({
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          description: '10% off your inaugural order',
        });
        showToast('Promo code WELCOME10 applied (10% off)!', 'success');
        return true;
      }
      if (upper === 'ELASIRSVIP') {
        if (subtotal < 4000) {
          showToast('Minimum spend of ₹4,000 required for ELASIRSVIP', 'error');
          return false;
        }
        setAppliedCoupon({
          code: 'ELASIRSVIP',
          discountType: 'fixed',
          discountValue: 500,
          description: '₹500 off luxury order',
        });
        showToast('VIP code applied (₹500 off)!', 'success');
        return true;
      }
      showToast('Invalid or expired promotional code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promotion code removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        shippingCost,
        grandTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen(prev => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
