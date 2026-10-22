export type FragranceFamily = 'Floral' | 'Woody' | 'Oriental' | 'Fresh' | 'Musky' | 'Gourmand';

export interface FragranceNote {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductVariant {
  size: string; // e.g. "50ml", "100ml", "10ml Travel"
  price: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  type: string; // e.g. "Eau de Parfum", "Extrait de Parfum"
  family: FragranceFamily;
  price: number; // base price for standard 50ml
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  story: string;
  ingredients: string;
  howItSmells: string;
  notes: FragranceNote;
  images: string[];
  variants: ProductVariant[];
  longevity?: string;
  sillage?: string;
  occasions?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  stock: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  price: number;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  userId?: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  approved: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  isVerified?: boolean;
  role: 'admin' | 'customer';
  addresses: Address[];
  wishlist: string[]; // product IDs
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Pending'
  | 'Return Requested'
  | 'Returned';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  taxes?: number;
  total: number;
  paymentMethod: 'razorpay' | 'stripe' | 'cod';
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentFailureReason?: string;
  status: OrderStatus;
  trackingNumber?: string;
  courierProvider?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReturnType = 'RETURN' | 'EXCHANGE' | 'REFUND';

export type ReturnStatus =
  | 'REQUESTED'
  | 'UNDER REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PICKUP SCHEDULED'
  | 'RECEIVED'
  | 'REFUND PROCESSING'
  | 'REFUNDED'
  | 'COMPLETED';

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  orderId: string;
  userEmail: string;
  customerName: string;
  type: ReturnType;
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  reason: string;
  description: string;
  imageUrl?: string;
  status: ReturnStatus;
  adminNote?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  gstRate: number;
  codEnabled: boolean;
  paymentGatewayStatus: {
    razorpayConfigured: boolean;
    stripeConfigured: boolean;
    mode: 'sandbox' | 'live';
  };
  shippingProviderStatus: {
    provider: string;
    configured: boolean;
    mode: 'test' | 'live';
  };
  emailProviderStatus: {
    provider: string;
    configured: boolean;
    mode: 'test_log' | 'live';
  };
  supabaseStatus?: {
    projectId: string;
    url: string;
    connected: boolean;
    tableExists: boolean;
    orderCount?: number;
    message?: string;
  };
}

export interface FragranceQuizAnswers {
  mood?: string;
  notes?: string;
  occasion?: string;
}

export interface BespokeCustomization {
  id: string;
  userEmail: string;
  customerName?: string;
  perfumeName: string;
  moods: string[];
  primaryFamily: string;
  secondaryFamily?: string | null;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  intensity: string;
  occasions: string[];
  fragranceStory: string;
  scentProfile: string;
  personalitySummary: string;
  status?: string;
  createdAt: string;
}

export interface AnnouncementRibbon {
  id: string;
  text: string;
  linkText?: string;
  linkAction?: string;
  active: boolean;
  order: number;
}

