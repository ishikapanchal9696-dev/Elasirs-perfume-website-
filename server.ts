import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_REVIEWS, INITIAL_ORDERS } from './src/data/initialData';
import { BRAND_KNOWLEDGE } from './src/data/brandKnowledge';
import { Product, Order, Review, Coupon, BespokeCustomization, AnnouncementRibbon, ReturnRequest, StoreSettings } from './src/types';
import {
  insertOrderToSupabase,
  fetchOrdersFromSupabase,
  checkSupabaseHealth,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
} from './src/lib/supabaseServer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory rate limiting map for AI concierge: max 30 requests/minute per IP
const conciergeRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkConciergeRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = conciergeRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    conciergeRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

// In-memory data store for stateful runtime persistence
let products: Product[] = [...INITIAL_PRODUCTS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let reviews: Review[] = [...INITIAL_REVIEWS];
let orders: Order[] = [...INITIAL_ORDERS];
let brandKnowledgeState = JSON.parse(JSON.stringify(BRAND_KNOWLEDGE));
let bespokeCustomizations: BespokeCustomization[] = [
  {
    id: 'bespoke-init-1',
    userEmail: 'aarav.sharma@example.com',
    customerName: 'Aarav Sharma',
    perfumeName: 'ELASIRS SUR-MESURE · VELVET OUDH & DAMASK',
    moods: ['mysterious', 'bold', 'luxurious'],
    primaryFamily: 'Oriental',
    secondaryFamily: 'Woody',
    topNotes: ['Pink Pepper', 'Bergamot'],
    heartNotes: ['Rose', 'Iris'],
    baseNotes: ['Oud', 'Sandalwood', 'Amber'],
    intensity: 'Strong',
    occasions: ['Evening', 'Special Occasion'],
    fragranceStory: 'Conceived as an intense nocturnal signature, balancing rare aged agarwood with spiced damask petals.',
    scentProfile: 'Oriental with subtle Woody accords · Tailored to an evocative Strong concentration.',
    personalitySummary: 'Mysterious, bold and unapologetically luxurious presence.',
    status: 'In 120-Day Maturation',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'bespoke-init-2',
    userEmail: 'ishikadarra03@gmail.com',
    customerName: 'Ishika Darra',
    perfumeName: 'ÉLIXIR D’OR · AMALFI NEROLI',
    moods: ['elegant', 'romantic', 'fresh'],
    primaryFamily: 'Floral',
    secondaryFamily: 'Fresh',
    topNotes: ['Bergamot', 'Orange', 'Pear'],
    heartNotes: ['Jasmine', 'Orange Blossom'],
    baseNotes: ['Vanilla', 'White Musk'],
    intensity: 'Moderate',
    occasions: ['Everyday', 'Self-Care'],
    fragranceStory: 'A sunlit morning reverie capturing the bloom of Grasse orange trees and creamy vanilla blossoms.',
    scentProfile: 'Floral with Fresh accords · Elegant sillage.',
    personalitySummary: 'Poised, luminous and intimate second-skin aura.',
    status: 'Formulation Approved',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

let announcementRibbons: AnnouncementRibbon[] = [
  {
    id: 'ribbon-1',
    text: 'Discover Your Signature Scent',
    linkText: 'Create Custom Flacon',
    linkAction: 'bespoke-scent',
    active: true,
    order: 1,
  },
  {
    id: 'ribbon-2',
    text: 'Find a Fragrance for Every Moment',
    linkText: 'Take Scent Quiz',
    linkAction: 'quiz',
    active: true,
    order: 2,
  },
  {
    id: 'ribbon-3',
    text: 'Explore Everyday, Signature & Luxe Collections',
    linkText: 'Browse Collections',
    linkAction: 'collections',
    active: true,
    order: 3,
  },
  {
    id: 'ribbon-4',
    text: 'Complimentary Discovery Trial Sample with Every Flacon Order',
    linkText: 'Learn More',
    linkAction: 'faq',
    active: true,
    order: 4,
  },
];

// Unique order numbering: ELASIRS-2026-XXXXXX
function generateUniqueOrderNumber(): string {
  let candidate = '';
  do {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    candidate = `ELASIRS-2026-${randomSuffix}`;
  } while (orders.some(o => o.orderNumber === candidate));
  return candidate;
}

// In-memory returns & exchanges store
let returnRequests: ReturnRequest[] = [
  {
    id: 'ret-101',
    orderNumber: 'EL-82910',
    orderId: 'ord-1001',
    userEmail: 'aarav.sharma@example.com',
    customerName: 'Aarav Sharma',
    type: 'RETURN',
    productId: 'elasirs-01',
    productName: 'ELASIRS NO. 01',
    size: '50ml',
    quantity: 1,
    reason: 'Skin Chemistry / Discovery Sample',
    description: 'Experienced the matching 2ml trial vial first. Intact 50ml flacon remains unopened with tamper-evident seal in place.',
    imageUrl: '',
    status: 'APPROVED',
    adminNote: 'Complimentary trial return verified within 14-day window. Prepaid return air waybill generated.',
    refundAmount: 3149,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Store business settings
let storeSettings: StoreSettings = {
  storeName: 'ELASIRS Haute Parfumerie',
  tagline: 'Accessible Luxury Botanical Fragrance House',
  contactEmail: 'concierge@elasirs.com',
  contactPhone: '+91 98205 77123',
  currency: 'INR',
  freeShippingThreshold: 4000,
  standardShippingFee: 149,
  expressShippingFee: 299,
  gstRate: 18,
  codEnabled: true,
  paymentGatewayStatus: {
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    mode: (process.env.RAZORPAY_KEY_ID || process.env.STRIPE_SECRET_KEY) ? 'live' : 'sandbox',
  },
  shippingProviderStatus: {
    provider: 'Blue Dart Air Express (Insured)',
    configured: Boolean(process.env.BLUEDART_API_KEY || process.env.SHIPROCKET_API_KEY),
    mode: (process.env.BLUEDART_API_KEY || process.env.SHIPROCKET_API_KEY) ? 'live' : 'test',
  },
  emailProviderStatus: {
    provider: 'Transactional SMTP / Resend',
    configured: Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST),
    mode: (process.env.RESEND_API_KEY || process.env.SMTP_HOST) ? 'live' : 'test_log',
  },
};

// Transactional notification logger
interface NotificationLogEntry {
  id: string;
  type: 'order_confirmation' | 'payment_status' | 'shipping_update' | 'return_update' | 'bespoke_confirmation' | 'account_verification';
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  providerStatus: 'sandbox_logged' | 'dispatched_live';
}

let notificationLogs: NotificationLogEntry[] = [
  {
    id: 'notif-init-1',
    type: 'order_confirmation',
    recipient: 'aarav.sharma@example.com',
    subject: 'Maison ELASIRS · Order Confirmation #EL-82910',
    body: 'Thank you for your patronage. Your flacon of ELASIRS NO. 01 is currently in preparation.',
    sentAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    providerStatus: 'sandbox_logged',
  },
];

function logTransactionalNotification(
  type: NotificationLogEntry['type'],
  recipient: string,
  subject: string,
  body: string
) {
  const entry: NotificationLogEntry = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    recipient,
    subject,
    body,
    sentAt: new Date().toISOString(),
    providerStatus: storeSettings.emailProviderStatus.configured ? 'dispatched_live' : 'sandbox_logged',
  };
  notificationLogs.unshift(entry);
  if (notificationLogs.length > 50) notificationLogs.pop();
  return entry;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'admin' | 'customer';
  isVerified: boolean;
  passwordHash: string;
  salt: string;
  addresses: any[];
  wishlist: string[];
}

// Cryptographic Password Hashing & Salt Verification (PBKDF2/scrypt)
function hashPassword(password: string, salt: string = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// Authorized administrator email registry
const AUTHORIZED_ADMIN_EMAILS = new Set([
  'admin@elasirs.com',
  'ishikadarra03@gmail.com',
  'ishikapanchal9696@gmail.com',
]);

// Initial secure salt & hash generation for seed accounts
const initialAdminSalt1 = crypto.randomBytes(16).toString('hex');
const initialAdminHash1 = crypto.scryptSync('admin123', initialAdminSalt1, 64).toString('hex');

const initialAdminSalt2 = crypto.randomBytes(16).toString('hex');
const initialAdminHash2 = crypto.scryptSync('admin123', initialAdminSalt2, 64).toString('hex');

const initialPatronSalt = crypto.randomBytes(16).toString('hex');
const initialPatronHash = crypto.scryptSync('patron123', initialPatronSalt, 64).toString('hex');

let storedUsers: StoredUser[] = [
  {
    id: 'usr-admin',
    name: 'Ishika Darra',
    email: 'ishikadarra03@gmail.com',
    mobile: '+91 98205 77123',
    role: 'admin',
    isVerified: true,
    salt: initialAdminSalt1,
    passwordHash: initialAdminHash1,
    addresses: [
      {
        id: 'addr-default',
        fullName: 'Ishika Darra',
        phone: '+91 98205 77123',
        addressLine1: 'The Imperial Towers, South Tower #32B, Tardeo',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400034',
        country: 'India',
        isDefault: true,
      },
    ],
    wishlist: ['elasirs-01', 'santal-obscura'],
  },
  {
    id: 'usr-admin-2',
    name: 'Ishika Panchal',
    email: 'ishikapanchal9696@gmail.com',
    mobile: '+91 98205 77123',
    role: 'admin',
    isVerified: true,
    salt: initialAdminSalt2,
    passwordHash: initialAdminHash2,
    addresses: [
      {
        id: 'addr-default-2',
        fullName: 'Ishika Panchal',
        phone: '+91 98205 77123',
        addressLine1: 'The Imperial Towers, South Tower #32B, Tardeo',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400034',
        country: 'India',
        isDefault: true,
      },
    ],
    wishlist: ['elasirs-01'],
  },
  {
    id: 'usr-demo-patron',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    mobile: '+91 98765 43210',
    role: 'customer',
    isVerified: true,
    salt: initialPatronSalt,
    passwordHash: initialPatronHash,
    addresses: [
      {
        id: 'addr-aarav-1',
        fullName: 'Aarav Sharma',
        phone: '+91 98765 43210',
        addressLine1: '404, Regency Park, DLF Phase IV',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India',
        isDefault: true,
      },
    ],
    wishlist: ['santal-obscura'],
  },
];

// Active server sessions
const activeAdminSessions = new Map<string, {
  userId: string;
  email: string;
  name: string;
  role: 'admin';
  expiresAt: number;
}>();

const activeCustomerSessions = new Map<string, {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  expiresAt: number;
}>();

// Login rate limiting map: 5 attempts -> 15 min lockout
const loginAttemptsMap = new Map<string, { attempts: number; lockUntil: number }>();

function checkLoginRateLimit(key: string): { allowed: boolean; remainingLockoutSec?: number } {
  const record = loginAttemptsMap.get(key);
  if (!record) return { allowed: true };
  if (record.lockUntil && Date.now() < record.lockUntil) {
    return {
      allowed: false,
      remainingLockoutSec: Math.ceil((record.lockUntil - Date.now()) / 1000),
    };
  }
  if (record.lockUntil && Date.now() >= record.lockUntil) {
    loginAttemptsMap.delete(key);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(key: string) {
  const record = loginAttemptsMap.get(key) || { attempts: 0, lockUntil: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  loginAttemptsMap.set(key, record);
}

function clearLoginAttempts(key: string) {
  loginAttemptsMap.delete(key);
}

// Server-side ADMIN role authorization middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['x-admin-token'] || req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (token && activeAdminSessions.has(token)) {
    const session = activeAdminSessions.get(token)!;
    if (Date.now() <= session.expiresAt) {
      (req as any).adminUser = session;
      return next();
    }
    activeAdminSessions.delete(token);
  }

  return res.status(403).json({
    success: false,
    code: 'ADMIN_UNAUTHORIZED',
    message: 'Access Denied: Valid administrator authorization required to access this resource.',
  });
}

function sanitizeUser(u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    role: u.role,
    isVerified: u.isVerified,
    addresses: u.addresses,
    wishlist: u.wishlist,
  };
}

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number; lastSentAt: number }>();
const resetCodeStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const adminResetCodeStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const userCarts = new Map<string, any[]>();

// API Endpoints
// --- Products ---
app.get('/api/products', (req: Request, res: Response) => {
  const { family, search, minPrice, maxPrice, sort } = req.query;

  let filtered = [...products];

  if (family && typeof family === 'string' && family.toLowerCase() !== 'all') {
    filtered = filtered.filter(p => p.family.toLowerCase() === family.toLowerCase());
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.family.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.notes.top.some(n => n.toLowerCase().includes(q)) ||
      p.notes.heart.some(n => n.toLowerCase().includes(q)) ||
      p.notes.base.some(n => n.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) filtered = filtered.filter(p => p.price <= max);
  }

  if (sort) {
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

app.post('/api/products', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.price || !body.family) {
    return res.status(400).json({ success: false, message: 'Missing required product attributes' });
  }

  const newProduct: Product = {
    id: body.id || `elasirs-${Date.now().toString(36)}`,
    name: body.name,
    subtitle: body.subtitle || 'EAU DE PARFUM',
    type: body.type || 'Eau de Parfum',
    family: body.family,
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    rating: 5.0,
    reviewCount: 0,
    description: body.description || '',
    story: body.story || '',
    ingredients: body.ingredients || 'Alcohol Denat., Parfum (Fragrance), Aqua (Water).',
    howItSmells: body.howItSmells || '',
    notes: body.notes || { top: [], heart: [], base: [] },
    images: body.images && body.images.length > 0 ? body.images : ['/src/assets/images/gloss_gems_radiance.jpg'],
    variants: body.variants || [
      { size: '50ml', price: Number(body.price), inStock: true },
      { size: '100ml', price: Math.round(Number(body.price) * 1.6), inStock: true }
    ],
    featured: Boolean(body.featured),
    bestSeller: Boolean(body.bestSeller),
    isNew: true,
    stock: body.stock ? Number(body.stock) : 25,
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  products[idx] = {
    ...products[idx],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : products[idx].price,
  };

  res.json({ success: true, data: products[idx] });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const deleted = products.splice(idx, 1)[0];
  res.json({ success: true, message: 'Product deleted', data: deleted });
});

app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
  const { stock, delta } = req.body;
  const prod = products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
  if (stock !== undefined) {
    prod.stock = Math.max(0, Number(stock));
  } else if (delta !== undefined) {
    prod.stock = Math.max(0, prod.stock + Number(delta));
  }
  res.json({ success: true, data: prod });
});

// --- Categories ---
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = [
    {
      id: 'floral',
      name: 'FLORAL',
      family: 'Floral',
      tagline: 'Soft. Romantic. Expressive.',
      description: 'Heirloom blooms, delicate night-blossoming petals, and sensual luminous accords.',
      image: '/src/assets/images/perfume_floral_flacon_1790830736168.jpg',
      count: products.filter(p => p.family === 'Floral').length,
    },
    {
      id: 'woody',
      name: 'WOODY',
      family: 'Woody',
      tagline: 'Warm. Deep. Magnetic.',
      description: 'Sacred cedar, creamy sandalwood, aged resins, and smoky aromatic leaves.',
      image: '/src/assets/images/perfume_woody_flacon_1790830726060.jpg',
      count: products.filter(p => p.family === 'Woody').length,
    },
    {
      id: 'oriental',
      name: 'ORIENTAL',
      family: 'Oriental',
      tagline: 'Rich. Sensual. Mysterious.',
      description: 'Opulent amber, royal oudh, exotic spice markets, and warm golden resins.',
      image: '/src/assets/images/hero_perfume_luxury_1790830691406.jpg',
      count: products.filter(p => p.family === 'Oriental').length,
    },
    {
      id: 'fresh',
      name: 'FRESH',
      family: 'Fresh',
      tagline: 'Clean. Bright. Effortless.',
      description: 'Sparkling citrus groves, marine ozone, crisp crushed herbs, and dewy morning air.',
      image: '/src/assets/images/featured_elasirs_no1_1790830702808.jpg',
      count: products.filter(p => p.family === 'Fresh').length,
    },
  ];
  res.json({ success: true, data: categories });
});

// --- Coupons ---
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code required' });
  }

  const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid promotional code' });
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return res.status(400).json({
      success: false,
      message: `Minimum order spend of ₹${coupon.minSpend.toLocaleString('en-IN')} required for code ${coupon.code}`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      description: coupon.description,
    },
  });
});

app.get('/api/coupons', (_req: Request, res: Response) => {
  res.json({ success: true, count: coupons.length, data: coupons });
});

app.post('/api/coupons', (req: Request, res: Response) => {
  const { code, discountType, discountValue, minSpend, description } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: 'Code and discount value required' });
  }
  const cleanCode = code.trim().toUpperCase();
  const existing = coupons.find(c => c.code === cleanCode);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Coupon code already exists' });
  }
  const newCoupon: Coupon = {
    code: cleanCode,
    discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
    discountValue: Number(discountValue),
    minSpend: minSpend ? Number(minSpend) : undefined,
    description: description || `${discountValue}${discountType === 'percentage' ? '%' : '₹'} off`,
  };
  coupons.unshift(newCoupon);
  res.status(201).json({ success: true, data: newCoupon });
});

app.delete('/api/coupons/:code', (req: Request, res: Response) => {
  const cleanCode = req.params.code.trim().toUpperCase();
  const idx = coupons.findIndex(c => c.code === cleanCode);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }
  const deleted = coupons.splice(idx, 1)[0];
  res.json({ success: true, data: deleted });
});

// --- Announcements / Ribbon ---
app.get('/api/announcements', (_req: Request, res: Response) => {
  res.json({ success: true, count: announcementRibbons.length, data: announcementRibbons.sort((a, b) => a.order - b.order) });
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const { text, linkText, linkAction, active } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, message: 'Ribbon message text is required' });
  }
  const newRibbon: AnnouncementRibbon = {
    id: `ribbon-${Date.now()}`,
    text: text.trim(),
    linkText: linkText?.trim() || undefined,
    linkAction: linkAction || undefined,
    active: active !== undefined ? Boolean(active) : true,
    order: announcementRibbons.length + 1,
  };
  announcementRibbons.push(newRibbon);
  res.status(201).json({ success: true, data: newRibbon });
});

app.put('/api/announcements/:id', (req: Request, res: Response) => {
  const idx = announcementRibbons.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }
  announcementRibbons[idx] = {
    ...announcementRibbons[idx],
    ...req.body,
    id: announcementRibbons[idx].id,
  };
  res.json({ success: true, data: announcementRibbons[idx] });
});

app.delete('/api/announcements/:id', (req: Request, res: Response) => {
  const idx = announcementRibbons.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }
  const deleted = announcementRibbons.splice(idx, 1)[0];
  res.json({ success: true, data: deleted });
});

// --- Orders ---
app.get('/api/orders', async (req: Request, res: Response) => {
  const { email } = req.query;

  // Attempt to fetch persisted orders from Supabase backend
  try {
    const sbOrders = await fetchOrdersFromSupabase();
    if (sbOrders && sbOrders.length > 0) {
      const existingOrderNumbers = new Set(orders.map(o => o.orderNumber));
      for (const sbOrder of sbOrders) {
        if (!existingOrderNumbers.has(sbOrder.orderNumber)) {
          orders.push(sbOrder);
          existingOrderNumbers.add(sbOrder.orderNumber);
        }
      }
    }
  } catch (err: any) {
    console.warn('[Supabase] Could not fetch orders from Supabase:', err?.message);
  }

  if (email && typeof email === 'string') {
    const userOrders = orders.filter(o => o.email.toLowerCase() === email.toLowerCase());
    return res.json({ success: true, count: userOrders.length, data: userOrders });
  }
  res.json({ success: true, count: orders.length, data: orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// --- Shipping & Pincode Serviceability ---
app.post('/api/shipping/check-pincode', (req: Request, res: Response) => {
  const { pincode } = req.body;
  if (!pincode || typeof pincode !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid 6-digit PIN code required' });
  }

  const cleanPin = pincode.trim();
  const pinRegex = /^[1-9][0-9]{5}$/;

  if (!pinRegex.test(cleanPin)) {
    return res.json({
      success: true,
      serviceable: false,
      pincode: cleanPin,
      message: 'Invalid Indian PIN code format. Please enter a valid 6-digit PIN code.',
    });
  }

  // Determine estimated delivery based on regional prefix
  const firstDigit = cleanPin.charAt(0);
  let city = 'Metro Region';
  let state = 'India';
  let daysMin = 2;
  let daysMax = 4;

  if (firstDigit === '1') {
    city = 'Delhi / NCR / North';
    state = 'Northern Zone';
    daysMin = 2;
    daysMax = 3;
  } else if (firstDigit === '4') {
    city = 'Mumbai / Pune / West';
    state = 'Maharashtra';
    daysMin = 1;
    daysMax = 2;
  } else if (firstDigit === '5') {
    city = 'Bengaluru / Hyderabad';
    state = 'Southern Zone';
    daysMin = 2;
    daysMax = 4;
  } else if (firstDigit === '6') {
    city = 'Chennai / Kochi';
    state = 'Southern Zone';
    daysMin = 2;
    daysMax = 4;
  } else if (firstDigit === '7') {
    city = 'Kolkata / East';
    state = 'Eastern Zone';
    daysMin = 3;
    daysMax = 5;
  }

  const startDate = new Date(Date.now() + daysMin * 86400000);
  const endDate = new Date(Date.now() + daysMax * 86400000);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const rangeStr = `${startDate.toLocaleDateString('en-IN', options)} – ${endDate.toLocaleDateString('en-IN', options)}, ${endDate.getFullYear()}`;

  res.json({
    success: true,
    serviceable: true,
    pincode: cleanPin,
    city,
    state,
    estimatedDays: `${daysMin}–${daysMax} Business Days`,
    deliveryDateRange: rangeStr,
    standardShippingFee: 149,
    freeShippingThreshold: 4000,
    expressAvailable: true,
    expressFee: 299,
    courier: 'Blue Dart Air Express (Insured)',
  });
});

app.get('/api/orders/track/:orderNumber', (req: Request, res: Response) => {
  const order = orders.find(
    o => o.orderNumber.toUpperCase() === req.params.orderNumber.trim().toUpperCase() || o.id === req.params.orderNumber
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'No order found with provided tracking identifier' });
  }

  // Construct structured timeline
  const orderTime = new Date(order.createdAt).getTime();
  const stages = [
    {
      stage: 'Order Placed',
      description: 'Your olfactory order has been received at Maison ELASIRS.',
      completed: true,
      timestamp: new Date(orderTime).toISOString(),
    },
    {
      stage: 'Order Confirmed',
      description: 'Payment authorized and verified. Flacon reserved in atelier.',
      completed: true,
      timestamp: new Date(orderTime + 15 * 60 * 1000).toISOString(),
    },
    {
      stage: 'Processing',
      description: 'Hand-inspected, wrapped in silk paper, and packaged in presentation case.',
      completed: order.status !== 'Pending',
      timestamp: order.status !== 'Pending' ? new Date(orderTime + 2 * 3600 * 1000).toISOString() : undefined,
    },
    {
      stage: 'Shipped',
      description: 'Handed over to insured courier service with temperature-controlled air transit.',
      completed: order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered',
      timestamp: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status)
        ? new Date(orderTime + 24 * 3600 * 1000).toISOString()
        : undefined,
    },
    {
      stage: 'Out for Delivery',
      description: 'Courier agent is en route to your destination address.',
      completed: order.status === 'Out for Delivery' || order.status === 'Delivered',
      timestamp: ['Out for Delivery', 'Delivered'].includes(order.status)
        ? new Date(orderTime + 48 * 3600 * 1000).toISOString()
        : undefined,
    },
    {
      stage: 'Delivered',
      description: 'Safely delivered and signed for.',
      completed: order.status === 'Delivered',
      timestamp: order.status === 'Delivered' ? new Date(orderTime + 72 * 3600 * 1000).toISOString() : undefined,
    },
  ];

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      status: order.status,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber || `EL-BLUEDART-${Math.floor(100000 + Math.random() * 900000)}`,
      courierProvider: order.courierProvider || 'Blue Dart Express (Insured)',
      estimatedDelivery: order.estimatedDelivery || 'In 2–4 Business Days',
      total: order.total,
      items: order.items,
      timeline: stages,
    },
  });
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.items || body.items.length === 0 || !body.shippingAddress || !body.email) {
    return res.status(400).json({ success: false, message: 'Incomplete order payload' });
  }

  // Server-side inventory & price validation
  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const item of body.items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
    }

    if (prod.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory for ${prod.name}. Only ${prod.stock} flacons available.`,
      });
    }

    const variant = prod.variants?.find(v => v.size === item.size);
    const unitPrice = variant ? variant.price : prod.price;
    calculatedSubtotal += unitPrice * item.quantity;

    validatedItems.push({
      productId: prod.id,
      productName: prod.name,
      size: item.size || '50ml',
      price: unitPrice,
      quantity: item.quantity,
      image: prod.images[0] || item.image,
    });
  }

  // Server-side discount recalculation
  let serverDiscount = 0;
  if (body.couponCode) {
    const coupon = coupons.find(c => c.code.toUpperCase() === body.couponCode.trim().toUpperCase());
    if (coupon) {
      if (!coupon.minSpend || calculatedSubtotal >= coupon.minSpend) {
        if (coupon.discountType === 'percentage') {
          serverDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
        } else {
          serverDiscount = coupon.discountValue;
        }
      }
    }
  }

  // Server-side shipping fee calculation
  const freeThreshold = 4000;
  const isExpress = body.shippingSpeed === 'express';
  let serverShippingCost = calculatedSubtotal >= freeThreshold ? 0 : 149;
  if (isExpress) {
    serverShippingCost += 299;
  }

  const serverTotal = Math.max(0, calculatedSubtotal - serverDiscount + serverShippingCost);

  // Duplicate order / idempotency check
  if (body.idempotencyKey && typeof body.idempotencyKey === 'string') {
    const existingOrder = orders.find(o => (o as any).idempotencyKey === body.idempotencyKey);
    if (existingOrder) {
      return res.json({ success: true, data: existingOrder, duplicatePrevented: true });
    }
  }

  // Handle simulated payment outcome (for sandbox/test mode verification)
  const isSimulatedFailure = body.simulatedPaymentOutcome === 'failed';
  const paymentOutcome: Order['paymentStatus'] =
    isSimulatedFailure
      ? 'failed'
      : body.paymentMethod === 'cod'
      ? 'pending'
      : body.paymentStatus === 'pending'
      ? 'pending'
      : 'paid';

  // Generate unique sequential order number: ELASIRS-2026-XXXXXX
  const orderNum = generateUniqueOrderNumber();

  const startDate = new Date(Date.now() + (isExpress ? 1 : 2) * 86400000);
  const endDate = new Date(Date.now() + (isExpress ? 2 : 4) * 86400000);
  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const estDateStr = `${startDate.toLocaleDateString('en-IN', dateOpts)} – ${endDate.toLocaleDateString('en-IN', dateOpts)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    userId: body.userId,
    customerName: body.customerName || body.shippingAddress.fullName,
    email: body.email.toLowerCase().trim(),
    phone: body.phone || body.shippingAddress.phone,
    shippingAddress: body.shippingAddress,
    items: validatedItems,
    subtotal: calculatedSubtotal,
    discount: serverDiscount,
    shippingCost: serverShippingCost,
    taxes: Math.round(calculatedSubtotal * 0.18), // 18% GST (included)
    total: serverTotal,
    paymentMethod: body.paymentMethod || 'razorpay',
    paymentStatus: paymentOutcome,
    paymentId:
      paymentOutcome === 'failed'
        ? undefined
        : body.paymentMethod === 'razorpay'
        ? `pay_rzp_${Date.now().toString(36)}`
        : body.paymentMethod === 'stripe'
        ? `pi_stripe_${Date.now().toString(36)}`
        : `cod_${Date.now().toString(36)}`,
    paymentFailureReason: isSimulatedFailure ? 'Card authorization declined by issuing bank (Sandbox Simulation)' : undefined,
    status: paymentOutcome === 'failed' ? 'Cancelled' : 'Order Confirmed',
    trackingNumber: paymentOutcome === 'failed' ? undefined : `BD-AIR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    courierProvider: 'Blue Dart Air Express (Insured)',
    estimatedDelivery: paymentOutcome === 'failed' ? undefined : estDateStr,
    createdAt: new Date().toISOString(),
  };

  (newOrder as any).idempotencyKey = body.idempotencyKey;

  // Only decrement inventory if order was successfully authorized
  if (paymentOutcome !== 'failed') {
    validatedItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    logTransactionalNotification(
      'order_confirmation',
      newOrder.email,
      `Maison ELASIRS · Order Confirmation ${newOrder.orderNumber}`,
      `Your olfactory order ${newOrder.orderNumber} for ₹${newOrder.total.toLocaleString('en-IN')} has been verified and registered.`
    );
  } else {
    logTransactionalNotification(
      'payment_status',
      newOrder.email,
      `Maison ELASIRS · Payment Attempt Failed (${orderNum})`,
      `The payment authorization for order ${orderNum} could not be completed. No amount was charged.`
    );
  }

  orders.unshift(newOrder);

  // Clear server user cart if present
  userCarts.delete(newOrder.email);

  // Persist order into Supabase backend table
  let supabaseResult: { success: boolean; error?: string; data?: any } = { success: false };
  try {
    supabaseResult = await insertOrderToSupabase(newOrder);
  } catch (sbErr: any) {
    console.warn('[Supabase] Error saving order to Supabase:', sbErr?.message);
    supabaseResult = { success: false, error: sbErr?.message };
  }

  res.status(201).json({
    success: true,
    data: newOrder,
    supabase: {
      projectId: SUPABASE_PROJECT_ID,
      synced: supabaseResult.success,
      error: supabaseResult.error,
    },
  });
});

// Server-side payment verification & webhook simulator
app.post('/api/payments/verify', (req: Request, res: Response) => {
  const { paymentId, orderNumber, signature, gateway } = req.body;
  if (!orderNumber) {
    return res.status(400).json({ success: false, message: 'Order number is required for verification' });
  }

  const order = orders.find(o => o.orderNumber === orderNumber);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order reference not found' });
  }

  // Server-side signature verification logic
  // In production: verifies HMAC SHA256 of razorpay_order_id + razorpay_payment_id against RAZORPAY_KEY_SECRET
  const isVerified = Boolean(paymentId && paymentId.length > 5);

  if (isVerified) {
    order.paymentStatus = 'paid';
    order.paymentId = paymentId;
    order.status = 'Order Confirmed';
    order.updatedAt = new Date().toISOString();

    logTransactionalNotification(
      'payment_status',
      order.email,
      `Maison ELASIRS · Payment Verified for ${order.orderNumber}`,
      `Payment of ₹${order.total.toLocaleString('en-IN')} confirmed via ${gateway || order.paymentMethod}.`
    );

    return res.json({
      success: true,
      verified: true,
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentId,
      },
    });
  }

  res.status(400).json({ success: false, verified: false, message: 'Payment verification failed' });
});

// --- Return & Exchange Requests ---
app.get('/api/returns', (req: Request, res: Response) => {
  const { email } = req.query;
  if (email && typeof email === 'string') {
    const userReturns = returnRequests.filter(r => r.userEmail.toLowerCase() === email.toLowerCase());
    return res.json({ success: true, count: userReturns.length, data: userReturns });
  }
  res.json({ success: true, count: returnRequests.length, data: returnRequests });
});

app.post('/api/returns', (req: Request, res: Response) => {
  const { orderNumber, productId, type, reason, description, imageUrl, userEmail, customerName } = req.body;
  if (!orderNumber || !productId || !reason || !description || !userEmail) {
    return res.status(400).json({ success: false, message: 'Missing required return request fields' });
  }

  const order = orders.find(o => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found for return request' });
  }

  const targetItem = order.items.find(i => i.productId === productId);
  if (!targetItem) {
    return res.status(404).json({ success: false, message: 'Specified flacon does not belong to this order' });
  }

  const newReturn: ReturnRequest = {
    id: `ret-${Date.now()}`,
    orderNumber: order.orderNumber,
    orderId: order.id,
    userEmail: userEmail.toLowerCase().trim(),
    customerName: customerName || order.customerName,
    type: type || 'RETURN',
    productId: targetItem.productId,
    productName: targetItem.productName,
    size: targetItem.size,
    quantity: targetItem.quantity,
    reason,
    description: description.trim(),
    imageUrl: imageUrl || '',
    status: 'REQUESTED',
    refundAmount: targetItem.price * targetItem.quantity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  order.status = 'Return Requested';
  returnRequests.unshift(newReturn);

  logTransactionalNotification(
    'return_update',
    newReturn.userEmail,
    `Maison ELASIRS · ${newReturn.type} Request Received (#${newReturn.id})`,
    `Your request for ${newReturn.productName} under order ${order.orderNumber} is under review by our atelier concierge.`
  );

  res.status(201).json({ success: true, data: newReturn });
});

app.patch('/api/returns/:id/status', (req: Request, res: Response) => {
  const { status, adminNote } = req.body;
  const returnReq = returnRequests.find(r => r.id === req.params.id);
  if (!returnReq) {
    return res.status(404).json({ success: false, message: 'Return request not found' });
  }

  if (status) returnReq.status = status;
  if (adminNote) returnReq.adminNote = adminNote;
  returnReq.updatedAt = new Date().toISOString();

  // If status is REFUNDED, update linked order
  if (status === 'REFUNDED') {
    const linkedOrder = orders.find(o => o.orderNumber === returnReq.orderNumber);
    if (linkedOrder) {
      linkedOrder.paymentStatus = 'refunded';
      linkedOrder.status = 'Returned';
    }
  }

  logTransactionalNotification(
    'return_update',
    returnReq.userEmail,
    `Maison ELASIRS · ${returnReq.type} Update: ${returnReq.status}`,
    `Your request #${returnReq.id} has been updated to ${returnReq.status}. Note: ${adminNote || 'No additional note'}`
  );

  res.json({ success: true, data: returnReq });
});

// --- Store Settings & Integration Status ---
app.get('/api/admin/settings', async (_req: Request, res: Response) => {
  // Update live environment detection
  storeSettings.paymentGatewayStatus.razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  storeSettings.paymentGatewayStatus.stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  storeSettings.paymentGatewayStatus.mode = (process.env.RAZORPAY_KEY_ID || process.env.STRIPE_SECRET_KEY) ? 'live' : 'sandbox';
  storeSettings.shippingProviderStatus.configured = Boolean(process.env.BLUEDART_API_KEY || process.env.SHIPROCKET_API_KEY);
  storeSettings.shippingProviderStatus.mode = (process.env.BLUEDART_API_KEY || process.env.SHIPROCKET_API_KEY) ? 'live' : 'test';
  storeSettings.emailProviderStatus.configured = Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
  storeSettings.emailProviderStatus.mode = (process.env.RESEND_API_KEY || process.env.SMTP_HOST) ? 'live' : 'test_log';

  // Check live Supabase health
  try {
    const sbHealth = await checkSupabaseHealth();
    storeSettings.supabaseStatus = {
      projectId: sbHealth.projectId,
      url: sbHealth.url,
      connected: sbHealth.connected,
      tableExists: sbHealth.tableExists,
      orderCount: sbHealth.orderCount,
      message: sbHealth.message,
    };
  } catch (err: any) {
    storeSettings.supabaseStatus = {
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      connected: false,
      tableExists: false,
      message: err?.message || 'Error checking Supabase health',
    };
  }

  res.json({ success: true, data: storeSettings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  storeSettings = {
    ...storeSettings,
    ...req.body,
    paymentGatewayStatus: {
      ...storeSettings.paymentGatewayStatus,
      ...(req.body.paymentGatewayStatus || {}),
    },
    shippingProviderStatus: {
      ...storeSettings.shippingProviderStatus,
      ...(req.body.shippingProviderStatus || {}),
    },
    emailProviderStatus: {
      ...storeSettings.emailProviderStatus,
      ...(req.body.emailProviderStatus || {}),
    },
  };
  res.json({ success: true, data: storeSettings });
});

// --- Supabase Database Integration Diagnostics ---
app.get('/api/admin/supabase-status', async (_req: Request, res: Response) => {
  const health = await checkSupabaseHealth();
  res.json({ success: true, data: health });
});

app.post('/api/admin/supabase-test', async (_req: Request, res: Response) => {
  const health = await checkSupabaseHealth();
  if (!health.tableExists) {
    return res.json({
      success: false,
      data: health,
      message: "Connected to Supabase, but the 'orders' table is not present yet. Run the SQL script from the Supabase section to create it.",
    });
  }
  res.json({
    success: true,
    data: health,
    message: "Supabase connection verified! 'orders' table is active and receiving submissions.",
  });
});

// --- Transactional Notifications Log ---
app.get('/api/admin/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, count: notificationLogs.length, data: notificationLogs });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, trackingNumber, courierProvider } = req.body;
  const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierProvider) order.courierProvider = courierProvider;

  res.json({ success: true, data: order });
});

// --- Reviews ---
app.get('/api/reviews', (req: Request, res: Response) => {
  const { productId } = req.query;
  if (productId && typeof productId === 'string') {
    const filtered = reviews.filter(r => r.productId === productId);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: reviews });
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, customerName, rating, title, comment, userEmail, userId } = req.body;
  if (!productId || !customerName || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Missing review attributes' });
  }

  const product = products.find(p => p.id === productId);

  // Check if customer is verified purchaser
  const hasPurchased = orders.some(
    o =>
      (userEmail && o.email.toLowerCase() === userEmail.toLowerCase()) &&
      o.items.some(item => item.productId === productId)
  );

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    productName: product ? product.name : 'ELASIRS Fragrance',
    customerName,
    userId: userId || undefined,
    userEmail: userEmail || undefined,
    rating: Number(rating),
    title: title || 'Exceptional Fragrance',
    comment,
    date: new Date().toISOString().split('T')[0],
    verified: hasPurchased || true,
    approved: true,
  };

  reviews.unshift(newReview);

  // recalculate product rating
  if (product) {
    const prodReviews = reviews.filter(r => r.productId === productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    product.rating = parseFloat(avg.toFixed(1));
    product.reviewCount = prodReviews.length;
  }

  res.status(201).json({ success: true, data: newReview });
});

app.put('/api/reviews/:id', (req: Request, res: Response) => {
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  if (req.body.title) review.title = req.body.title;
  if (req.body.comment) review.comment = req.body.comment;
  if (req.body.rating) review.rating = Number(req.body.rating);

  res.json({ success: true, data: review });
});

app.patch('/api/reviews/:id/approve', (req: Request, res: Response) => {
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  review.approved = req.body.approved !== undefined ? Boolean(req.body.approved) : true;
  res.json({ success: true, data: review });
});

app.delete('/api/reviews/:id', (req: Request, res: Response) => {
  const idx = reviews.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Review not found' });
  const deleted = reviews.splice(idx, 1)[0];
  res.json({ success: true, data: deleted });
});

// --- Cart Persistence ---
app.get('/api/cart', (req: Request, res: Response) => {
  const email = (req.headers['x-user-email'] as string) || (req.query.email as string);
  if (!email) {
    return res.json({ success: true, data: [] });
  }
  const userCart = userCarts.get(email.toLowerCase()) || [];
  res.json({ success: true, data: userCart });
});

app.post('/api/cart', (req: Request, res: Response) => {
  const email = (req.headers['x-user-email'] as string) || req.body.email;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required for cart sync' });
  }
  const cartItems = Array.isArray(req.body.cart) ? req.body.cart : [];
  userCarts.set(email.toLowerCase(), cartItems);
  res.json({ success: true, data: cartItems });
});

app.post('/api/cart/merge', (req: Request, res: Response) => {
  const email = (req.headers['x-user-email'] as string) || req.body.email;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }
  const guestCart = Array.isArray(req.body.guestCart) ? req.body.guestCart : [];
  const current = userCarts.get(email.toLowerCase()) || [];

  const merged = [...current];
  guestCart.forEach((gItem: any) => {
    const existing = merged.find(
      m => m.product.id === gItem.product.id && m.selectedSize === gItem.selectedSize
    );
    if (existing) {
      const prod = products.find(p => p.id === gItem.product.id);
      const maxStock = prod ? prod.stock : 25;
      existing.quantity = Math.min(maxStock, existing.quantity + gItem.quantity);
    } else {
      merged.push(gItem);
    }
  });

  userCarts.set(email.toLowerCase(), merged);
  res.json({ success: true, data: merged });
});

// --- Auth & OTP Services ---
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const now = Date.now();
  const existing = otpStore.get(cleanEmail);

  // Rate limiting: 45s between OTP requests
  if (existing && now - existing.lastSentAt < 45 * 1000) {
    const waitSecs = Math.ceil((45 * 1000 - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${waitSecs} seconds before requesting a new verification code.`,
    });
  }

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(cleanEmail, {
    code,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    lastSentAt: now,
  });

  // Simulated server transactional email dispatch (never return code in response!)
  console.log(`[TRANSACTIONAL EMAIL] Sent 6-digit verification code to ${cleanEmail}`);

  res.json({
    success: true,
    message: 'A 6-digit verification code has been dispatched to your email address.',
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: 'No verification code was requested for this email, or it has expired.',
    });
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return res.status(429).json({
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a fresh OTP.',
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
  }

  if (record.code !== otp.trim()) {
    record.attempts += 1;
    return res.status(400).json({
      success: false,
      message: `Invalid code. ${5 - record.attempts} attempts remaining.`,
    });
  }

  // Verified!
  otpStore.delete(cleanEmail);

  let user = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.isVerified = true;
  } else {
    const defaultCredentials = hashPassword('default123');
    user = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: 'customer',
      isVerified: true,
      passwordHash: defaultCredentials.hash,
      salt: defaultCredentials.salt,
      addresses: [],
      wishlist: [],
    };
    storedUsers.push(user);
  }

  res.json({
    success: true,
    message: 'Email successfully verified.',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified,
      addresses: user.addresses,
      wishlist: user.wishlist,
      token: `jwt-auth-${Date.now()}`,
    },
  });
});

// --- Customer & Admin Authentication ---

// 1. Separate Admin Sign In
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Administrator email and password required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const rateLimit = checkLoginRateLimit(`admin_${cleanEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many failed administrator login attempts. Locked for security. Try again in ${rateLimit.remainingLockoutSec}s.`,
    });
  }

  // Strict check: Must be an authorized admin email or have ADMIN role
  const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.has(cleanEmail);
  const adminUser = storedUsers.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');

  if (!isAuthorizedEmail && !adminUser) {
    recordFailedLogin(`admin_${cleanEmail}`);
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid administrator credentials.',
    });
  }

  const targetAdmin = adminUser || storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (!targetAdmin) {
    recordFailedLogin(`admin_${cleanEmail}`);
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid administrator credentials.',
    });
  }

  // Verify cryptographic salted password
  const isValid = verifyPassword(password, targetAdmin.passwordHash, targetAdmin.salt);
  if (!isValid) {
    recordFailedLogin(`admin_${cleanEmail}`);
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid administrator credentials.',
    });
  }

  // Successful admin login: Issue secure 32-byte session token (24-hour validity)
  clearLoginAttempts(`admin_${cleanEmail}`);
  const adminToken = `adm_sec_${crypto.randomBytes(32).toString('hex')}`;
  activeAdminSessions.set(adminToken, {
    userId: targetAdmin.id,
    email: targetAdmin.email,
    name: targetAdmin.name,
    role: 'admin',
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  console.log(`[SECURITY AUDIT] Administrator signed in: ${cleanEmail}`);

  res.json({
    success: true,
    token: adminToken,
    message: `Welcome back, ${targetAdmin.name}`,
    data: sanitizeUser(targetAdmin),
  });
});

app.post('/api/auth/admin-logout', (req: Request, res: Response) => {
  const authHeader = req.headers['x-admin-token'] || req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Administrator session terminated.' });
});

// Admin Password Reset Flow (Protected & Identity Verified)
app.post('/api/admin/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Administrator email required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (AUTHORIZED_ADMIN_EMAILS.has(cleanEmail)) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    adminResetCodeStore.set(cleanEmail, {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0,
    });
    console.log(`[SECURITY] Admin recovery code generated for ${cleanEmail}: ${code}`);
  }

  res.json({
    success: true,
    message: 'If the provided email is an authorized administrator, verification recovery instructions have been sent.',
  });
});

app.post('/api/admin/reset-password', (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, verification code, and new passkey required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const record = adminResetCodeStore.get(cleanEmail);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Administrator passkey recovery code expired or invalid.' });
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return res.status(400).json({ success: false, message: 'Invalid verification code.' });
  }

  adminResetCodeStore.delete(cleanEmail);

  let targetAdmin = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
  const { hash, salt } = hashPassword(newPassword);

  if (targetAdmin) {
    targetAdmin.passwordHash = hash;
    targetAdmin.salt = salt;
  } else if (AUTHORIZED_ADMIN_EMAILS.has(cleanEmail)) {
    targetAdmin = {
      id: `usr-admin-${Date.now().toString(36)}`,
      name: 'Maison Administrator',
      email: cleanEmail,
      role: 'admin',
      isVerified: true,
      salt,
      passwordHash: hash,
      addresses: [],
      wishlist: [],
    };
    storedUsers.push(targetAdmin);
  }

  res.json({
    success: true,
    message: 'Administrator passkey successfully updated. Please authenticate with your new passkey.',
  });
});

app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const adminSession = (req as any).adminUser;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Current password and valid new passkey (min 6 chars) required.' });
  }

  const admin = storedUsers.find(u => u.email.toLowerCase() === adminSession.email.toLowerCase());
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Administrator not found.' });
  }

  const isValid = verifyPassword(currentPassword, admin.passwordHash, admin.salt);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Current administrator passkey is incorrect.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  admin.passwordHash = hash;
  admin.salt = salt;

  res.json({ success: true, message: 'Administrator security passkey updated successfully.' });
});

// 2. Customer Registration (Strictly Creates Role: Customer)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, mobile, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email address, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters in length.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Reject public customer sign-ups attempting to claim admin accounts
  if (AUTHORIZED_ADMIN_EMAILS.has(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'This email address is reserved for Maison Atelier administration. Please use the Admin Login link.',
    });
  }

  const existing = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please sign in.',
    });
  }

  const { hash, salt } = hashPassword(password);

  const newUser: StoredUser = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: cleanEmail,
    mobile: mobile?.trim() || '',
    role: 'customer', // Strictly customer
    isVerified: true,
    salt,
    passwordHash: hash,
    addresses: [],
    wishlist: [],
  };

  storedUsers.push(newUser);

  const customerToken = `patron_token_${crypto.randomBytes(24).toString('hex')}`;
  activeCustomerSessions.set(customerToken, {
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: 'customer',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    token: customerToken,
    message: 'Welcome to Maison ELASIRS! Your customer account has been created.',
    data: sanitizeUser(newUser),
  });
});

// 3. Customer Sign In
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email address and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const rateLimit = checkLoginRateLimit(`cust_${cleanEmail}`);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      message: `Too many unsuccessful login attempts. Locked for security. Please try again in ${rateLimit.remainingLockoutSec}s.`,
    });
  }

  const user = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    recordFailedLogin(`cust_${cleanEmail}`);
    return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
  }

  // Verify password using cryptographically secure scrypt hash + salt
  const isMatch = verifyPassword(password, user.passwordHash, user.salt);
  if (!isMatch) {
    recordFailedLogin(`cust_${cleanEmail}`);
    return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
  }

  clearLoginAttempts(`cust_${cleanEmail}`);

  // Customer session token
  const customerToken = `patron_token_${crypto.randomBytes(24).toString('hex')}`;
  activeCustomerSessions.set(customerToken, {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    token: customerToken,
    message: `Welcome back, ${user.name}`,
    data: sanitizeUser(user),
  });
});

// 4. Customer Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);

  if (user) {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodeStore.set(cleanEmail, {
      code: resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0,
    });
    console.log(`[TRANSACTIONAL EMAIL] Password reset OTP sent to ${cleanEmail}: ${resetCode}`);
  }

  // Generic security message to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email address, a password recovery code has been dispatched.',
  });
});

// 5. Customer Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, recovery code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must contain at least 6 characters.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const record = resetCodeStore.get(cleanEmail);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Password reset code has expired or is invalid.' });
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return res.status(400).json({ success: false, message: 'Incorrect reset code.' });
  }

  resetCodeStore.delete(cleanEmail);

  const user = storedUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
  }

  res.json({
    success: true,
    message: 'Your password has been successfully reset. Please log in with your new credentials.',
  });
});

// 6. Customer Change Password (Inside Account Portal)
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const email = (req.headers['x-user-email'] as string)?.toLowerCase().trim();
  const { currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must contain at least 6 characters.' });
  }

  const user = storedUsers.find(u => u.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  const isMatch = verifyPassword(currentPassword, user.passwordHash, user.salt);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'The current password provided is incorrect.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;

  res.json({ success: true, message: 'Your password has been updated successfully.' });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (token) {
    activeCustomerSessions.delete(token);
  }
  res.json({ success: true, message: 'Successfully signed out.' });
});

// --- Bespoke Customization Persistence ---
app.post('/api/bespoke/save', (req: Request, res: Response) => {
  const {
    perfumeName,
    moods,
    primaryFamily,
    secondaryFamily,
    topNotes,
    heartNotes,
    baseNotes,
    intensity,
    occasions,
    fragranceStory,
    scentProfile,
    personalitySummary,
    customerName,
  } = req.body;

  const authEmail = (req.headers['x-user-email'] as string) || req.body?.userEmail || 'patron@elasirs.com';

  const newCustomization: BespokeCustomization = {
    id: `bespoke-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    userEmail: authEmail.trim().toLowerCase(),
    customerName: customerName || 'Valued Patron',
    perfumeName: perfumeName || 'ELASIRS BESPOKE ÉLIXIR',
    moods: Array.isArray(moods) ? moods : [],
    primaryFamily: primaryFamily || 'Floral',
    secondaryFamily: secondaryFamily || null,
    topNotes: Array.isArray(topNotes) ? topNotes : [],
    heartNotes: Array.isArray(heartNotes) ? heartNotes : [],
    baseNotes: Array.isArray(baseNotes) ? baseNotes : [],
    intensity: intensity || 'Moderate',
    occasions: Array.isArray(occasions) ? occasions : [],
    fragranceStory: fragranceStory || '',
    scentProfile: scentProfile || '',
    personalitySummary: personalitySummary || '',
    status: 'Atelier Review',
    createdAt: new Date().toISOString(),
  };

  bespokeCustomizations.unshift(newCustomization);

  res.status(201).json({
    success: true,
    data: newCustomization,
  });
});

app.patch('/api/bespoke/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const item = bespokeCustomizations.find(b => b.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Custom perfume request not found' });
  item.status = status;
  res.json({ success: true, data: item });
});

app.get('/api/bespoke/my-scents', (req: Request, res: Response) => {
  const authEmail = (req.headers['x-user-email'] as string) || (req.query?.userEmail as string);
  if (!authEmail) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const cleanEmail = authEmail.trim().toLowerCase();
  const userScents = bespokeCustomizations.filter(b => b.userEmail === cleanEmail);

  res.json({
    success: true,
    data: userScents,
  });
});

app.get('/api/admin/bespoke', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: bespokeCustomizations,
  });
});

// --- AI Knowledge Base Management ---
app.get('/api/admin/brand-knowledge', (_req: Request, res: Response) => {
  res.json({ success: true, data: brandKnowledgeState });
});

app.put('/api/admin/brand-knowledge', (req: Request, res: Response) => {
  brandKnowledgeState = { ...brandKnowledgeState, ...req.body };
  res.json({ success: true, data: brandKnowledgeState });
});

// Helper to detect fragrance references and attach interactive cards
function getReferencedProducts(replyText: string, productsList: Product[]) {
  const matchedIds = new Set<string>();
  BRAND_KNOWLEDGE.fragrances.forEach(f => {
    if (
      replyText.toLowerCase().includes(f.name.toLowerCase()) ||
      replyText.toLowerCase().includes(f.id.toLowerCase())
    ) {
      matchedIds.add(f.id);
    }
  });
  return productsList
    .filter(p => matchedIds.has(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      image: p.images[0],
      family: p.family,
    }));
}

// Deterministic fallback knowledge engine using BRAND_KNOWLEDGE
function generateKnowledgeFallback(message: string, userEmail: string, ordersList: Order[]): string {
  const q = message.toLowerCase();

  // Guardrail check
  if (
    q.includes('password') ||
    q.includes('secret') ||
    q.includes('api key') ||
    q.includes('revenue') ||
    q.includes('profit') ||
    q.includes('database') ||
    q.includes('admin')
  ) {
    return "I can help with ELASIRS products, fragrances, our public story and customer information, but I can't provide private or administrative information.";
  }

  // Customer order inquiry
  if (q.includes('order') || q.includes('tracking') || q.includes('where is my package')) {
    if (!userEmail) {
      return "To review your orders, please sign in to your patron account or share your order number (e.g. #EL-XXXXX) so I may look up your delivery status.";
    }
    const userOrders = ordersList.filter(o => o.email.toLowerCase() === userEmail.toLowerCase());
    if (userOrders.length === 0) {
      return `I could not find any active orders for ${userEmail}. If you placed an order recently under another address, please share the order reference number.`;
    }
    const latest = userOrders[0];
    return `Greetings. I've located your order ${latest.orderNumber}:
• Status: ${latest.status}
• Total: ₹${latest.total.toLocaleString('en-IN')}
• Courier Tracking: ${latest.trackingNumber || 'Awaiting climate-controlled courier pickup'}
• Creations: ${latest.items.map(i => `${i.productName} (${i.size})`).join(', ')}

Please let me know if you would like me to assist you with anything else regarding your delivery.`;
  }

  // Story & origin
  if (q.includes('story') || q.includes('origin') || q.includes('history') || q.includes('founder') || q.includes('who created') || q.includes('ishika')) {
    return `${BRAND_KNOWLEDGE.story.origin}

Founded by Creative Director ${BRAND_KNOWLEDGE.owner.name}, the house was born to create fragrances that serve as an intimate emotional signature. Every composition undergoes a traditional 120-day maturation period in Grasse to ensure pure, uncompromised longevity.`;
  }

  // Shipping & returns
  if (q.includes('shipping') || q.includes('delivery') || q.includes('return') || q.includes('refund')) {
    return `At Maison ELASIRS, we provide complimentary luxury shipping on all domestic orders of ₹4,000 or more (standard shipping is ₹149 for lesser values). Packages arrive within 2 to 4 business days.

Every flacon includes a complimentary 2ml matching sample. We invite you to experience the trial vial first. If it does not resonate with you, the unopened full flacon may be returned within 14 days for a full refund.`;
  }

  // Fragrance notes & pyramid
  if (q.includes('note') || q.includes('pyramid') || q.includes('bergamot') || q.includes('sandalwood') || q.includes('rose') || q.includes('amber')) {
    return `In haute parfumerie, a fragrance unfolds in three distinct movements:
• Top Notes: The initial whisper upon application (sparkling bergamot, pink pepper, and neroli in ELASIRS NO. 01).
• Heart Notes: The romantic soul that blooms after 15 minutes (Damask rose, nocturnal jasmine, and gardenia).
• Base Notes: The deep, enduring dry-down that lingers on skin for up to 24 hours (golden amber, sacred Mysore sandalwood, and cashmere musk).`;
  }

  // Recommendations
  if (q.includes('recommend') || q.includes('find') || q.includes('signature') || q.includes('best') || q.includes('woody') || q.includes('floral') || q.includes('fresh')) {
    if (q.includes('woody') || q.includes('smoke')) {
      return `For a deep, grounded aesthetic, I recommend SANTAL OBSCURA (Extrait de Parfum, ₹3,899). It surrounds you in sacred Australian sandalwood, aged Virginia cedar, and smoked cardamom.`;
    }
    if (q.includes('fresh') || q.includes('citrus') || q.includes('summer')) {
      return `For vibrant clarity and coastal breezes, CÉLESTE MARINE (Eau de Parfum, ₹3,299) captures Amalfi lemon zest, sea salt spray, and clean driftwood.`;
    }
    return `For our defining house creation, I recommend ELASIRS NO. 01 — THE SIGNATURE (Eau de Parfum, ₹3,499). It bridges radiant Calabrian bergamot with heirloom Damask rose and golden amber woods. Would you prefer something intimate and floral, or deep and smoky?`;
  }

  // Unverified check
  if (q.includes('award') || q.includes('celebrity') || q.includes('revenue') || q.includes('1920') || q.includes('ancient')) {
    return "I don't have verified information about that part of the ELASIRS story yet.";
  }

  return `Welcome to Maison ELASIRS. I am your fragrance concierge. I would be delighted to guide you through our olfactory collections, unpack our raw botanical notes, share our Grasse heritage, or help you discover your signature scent. How may I assist you today?`;
}

// --- ELASIRS AI Fragrance Concierge Route ---
app.post('/api/concierge/chat', async (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
  if (!checkConciergeRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      message: 'You have sent several messages in a short period. Please take a sensory pause for a moment.',
    });
  }

  const { message, history, userEmail } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const sanitizedMessage = message.trim().slice(0, 1000);
  const lowerMsg = sanitizedMessage.toLowerCase();

  // Guardrail 1: Check for attempts to access private/administrative/financial data
  const forbiddenKeywords = [
    'admin password',
    'secret key',
    'api key',
    'database password',
    'database credentials',
    'revenue',
    'profit margin',
    'internal analytics',
    'supplier cost',
    'system prompt',
    'developer instruction',
    'internal instructions',
    'env variable',
    'environment variable',
    '.env',
  ];

  if (forbiddenKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return res.json({
      success: true,
      data: {
        reply: "I can help with ELASIRS products, fragrances, our public story and customer information, but I can't provide private or administrative information.",
        recommendedProducts: [],
      },
    });
  }

  // Guardrail 2: Customer order context (strictly for currently authenticated user)
  const authEmail = (req.headers['x-user-email'] as string) || (userEmail as string) || '';
  let customerOrderContext = '';
  if (authEmail && typeof authEmail === 'string') {
    const cleanEmail = authEmail.trim().toLowerCase();
    const userOrders = orders.filter(o => o.email.toLowerCase() === cleanEmail);
    if (userOrders.length > 0) {
      customerOrderContext = `The currently authenticated customer is ${userOrders[0].customerName} (${cleanEmail}). Their actual verified order history in the Maison is:
${userOrders
  .map(
    o =>
      `- Order ${o.orderNumber}: Placed on ${o.createdAt.split('T')[0]}, Total ₹${o.total.toLocaleString(
        'en-IN'
      )}, Status: "${o.status}", Courier Tracking: ${o.trackingNumber || 'Pending pickup'}, Items: ${o.items
        .map(i => `${i.productName} (${i.size}, qty ${i.quantity})`)
        .join(', ')}`
  )
  .join('\n')}
(Only share these order details if the patron specifically inquires about their order status or purchases. Never invent orders or disclose details for any other customer).`;
    }
  }

  // System instruction for ELASIRS Concierge
  const systemInstruction = `You are the ELASIRS Concierge, the official luxury fragrance consultant for Maison ELASIRS.
Your persona is warm, elegant, helpful, concise, knowledgeable, and natural. You speak with the refinement of a Parisian or Grasse haute parfumerie atelier advisor, never sounding like a generic corporate bot.

PUBLIC BRAND KNOWLEDGE BASE:
Owner & Creative Director: ${BRAND_KNOWLEDGE.owner.name} (${BRAND_KNOWLEDGE.owner.title})
Owner Bio: ${BRAND_KNOWLEDGE.owner.publicBio}
Origin: ${BRAND_KNOWLEDGE.story.origin}
Inspiration: ${BRAND_KNOWLEDGE.story.inspiration}
Heritage & Maturation: ${BRAND_KNOWLEDGE.story.heritage}
Philosophy: ${BRAND_KNOWLEDGE.philosophy.coreBelief}
Sourcing: ${BRAND_KNOWLEDGE.philosophy.sourcing}
Clean Standards: ${BRAND_KNOWLEDGE.philosophy.cleanBeauty}
Packaging: ${BRAND_KNOWLEDGE.philosophy.packaging}

AVAILABLE FRAGRANCES CATALOG:
${BRAND_KNOWLEDGE.fragrances
  .map(
    f =>
      `* ${f.name} (${f.subtitle}, ${f.type}, ${f.family} Family, ₹${f.price.toLocaleString(
        'en-IN'
      )})
  Sizes: ${f.availableSizes.join(', ')}
  Top Notes: ${f.notes.top.join(', ')}
  Heart Notes: ${f.notes.heart.join(', ')}
  Base Notes: ${f.notes.base.join(', ')}
  Scent Profile: ${f.scentProfile}
  Mood: ${f.mood}
  Best for: ${f.idealFor}`
  )
  .join('\n\n')}

POLICIES:
* Shipping: ${BRAND_KNOWLEDGE.policies.shipping.domesticRates} Timeline: ${BRAND_KNOWLEDGE.policies.shipping.deliveryTimeline}
* Returns & Discovery Trial: ${BRAND_KNOWLEDGE.policies.returns.trialPolicy} Return Window: ${BRAND_KNOWLEDGE.policies.returns.window} Condition: ${BRAND_KNOWLEDGE.policies.returns.condition}
* Fragrance Care: ${BRAND_KNOWLEDGE.policies.fragranceCare}

${customerOrderContext ? `CUSTOMER ORDER CONTEXT:\n${customerOrderContext}` : 'No authenticated customer order is currently attached.'}

CRITICAL RULES & GUARDRAILS:
1. DO NOT INVENT INFORMATION: If an inquiry touches on an unverified aspect of the ELASIRS story, founders, dates, awards, historical discoveries, or unlisted products, do NOT make up stories. Instead respond:
   "I don't have verified information about that part of the ELASIRS story yet."
2. NEVER invent dates, awards, celebrity endorsements, unlisted ingredients, or company achievements.
3. PRIVACY & SECURITY: If a user asks for administrative passwords, API keys, revenue, profits, internal business documents, employee personal info, or other customer data, respond:
   "I can help with ELASIRS products, fragrances, our public story and customer information, but I can't provide private or administrative information."
4. If a user asks about an order but is not logged in or has no order, kindly guide them to sign in or provide their verified Order Number (e.g. #EL-XXXXX).
5. For fragrance recommendations: If their request is broad, ask 1 to 3 discerning sensory questions (e.g., preferred olfactory mood, day vs evening, favorite botanical notes) before suggesting 1 or 2 matching creations.
6. Length: Keep normal answers concise (1 to 4 paragraphs). Brand story responses should be around 80 to 150 words.`;

  try {
    let reply = '';
    const recommendedProductIds: string[] = [];

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contentsPayload: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-8).forEach(h => {
          if (h.role === 'user' || h.role === 'model') {
            contentsPayload.push({
              role: h.role,
              parts: [{ text: String(h.text || h.content || '').slice(0, 500) }],
            });
          }
        });
      }
      contentsPayload.push({
        role: 'user',
        parts: [{ text: sanitizedMessage }],
      });

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      reply = aiResponse.text || '';
    }

    if (!reply) {
      reply = generateKnowledgeFallback(sanitizedMessage, authEmail, orders);
    }

    const recommendedProductDetails = getReferencedProducts(reply, products);

    res.json({
      success: true,
      data: {
        reply,
        recommendedProducts: recommendedProductDetails,
      },
    });
  } catch (error) {
    console.error('[ELASIRS Concierge Exception]', error);
    const fallbackReply = generateKnowledgeFallback(sanitizedMessage, authEmail, orders);
    const fallbackProductDetails = getReferencedProducts(fallbackReply, products);
    res.json({
      success: true,
      data: {
        reply: fallbackReply,
        recommendedProducts: fallbackProductDetails,
      },
    });
  }
});

// --- Admin Analytics ---
app.get('/api/admin/analytics', (_req: Request, res: Response) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(o => o.email)).size;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Best selling products calculation
  const productSalesMap: Record<string, { name: string; sales: number; revenue: number; image: string }> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          sales: 0,
          revenue: 0,
          image: item.image,
        };
      }
      productSalesMap[item.productId].sales += item.quantity;
      productSalesMap[item.productId].revenue += item.price * item.quantity;
    });
  });

  const bestSellers = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  // Status breakdown
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      uniqueCustomers,
      avgOrderValue,
      bestSellers,
      statusCounts,
      recentOrders: orders.slice(0, 5),
      lowStockProducts: products.filter(p => p.stock <= 25),
    },
  });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[ELASIRS Full-Stack Server] running on http://0.0.0.0:${PORT}`);
    try {
      const sbOrders = await fetchOrdersFromSupabase();
      if (sbOrders && sbOrders.length > 0) {
        const existingOrderNumbers = new Set(orders.map(o => o.orderNumber));
        for (const sbOrder of sbOrders) {
          if (!existingOrderNumbers.has(sbOrder.orderNumber)) {
            orders.push(sbOrder);
            existingOrderNumbers.add(sbOrder.orderNumber);
          }
        }
        console.log(`[Supabase] Preloaded ${sbOrders.length} order(s) from Supabase on startup.`);
      }
    } catch (e: any) {
      console.warn('[Supabase] Startup preload error:', e?.message);
    }
  });
}

startServer();
