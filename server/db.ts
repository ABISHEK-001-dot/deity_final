import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import type {
  IUser,
  IProduct,
  IOrder,
  IReview,
  ICoupon,
  ICategory,
  ICartItem,
} from './types.ts';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface IDataStore {
  users: IUser[];
  products: IProduct[];
  orders: IOrder[];
  reviews: IReview[];
  coupons: ICoupon[];
  categories: ICategory[];
  carts: Record<string, ICartItem[]>; // userId -> items
}

// In-memory working database with auto-sync to disk
let store: IDataStore = {
  users: [],
  products: [],
  orders: [],
  reviews: [],
  coupons: [],
  categories: [],
  carts: {},
};

// Realistic Seed Data
const initialCategories: ICategory[] = [
  {
    _id: 'cat-snapback',
    name: 'Snapback',
    slug: 'snapback',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    description: 'Flat brim classics engineered with high-crown structure and snap closures.'
  },
  {
    _id: 'cat-baseball',
    name: 'Baseball Caps',
    slug: 'baseball-caps',
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80',
    description: 'Curved visor athletic silhouettes with moisture-wicking headbands.'
  },
  {
    _id: 'cat-trucker',
    name: 'Trucker Caps',
    slug: 'trucker-caps',
    image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
    description: 'Breathable foam and high-density poly mesh caps built for summer streetwear.'
  },
  {
    _id: 'cat-dad',
    name: 'Dad Caps',
    slug: 'dad-caps',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80',
    description: 'Low-profile, unstructured cotton twill caps with antique brass buckle sliders.'
  },
  {
    _id: 'cat-premium',
    name: 'Premium Collection',
    slug: 'premium-collection',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight brushed twill, 3D puff embroidery, and satin lined crowns.'
  },
  {
    _id: 'cat-limited',
    name: 'Limited Edition',
    slug: 'limited-edition',
    image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=80',
    description: 'Rare numbered drop runs with custom metallic hardware and collector packaging.'
  }
];

const initialProducts: IProduct[] = [
  {
    _id: 'prod-01',
    name: 'Shadow Black Cap',
    slug: 'shadow-black-cap',
    description: 'An aggressive, deep-black unstructured dad cap woven from 380 GSM Japanese cotton twill. Features minimalist DEITY tonal micro-embroidery on the crown with a brushed silver buckle closure.',
    category: 'Dad Caps',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1299,
    salePrice: 999,
    discount: 23,
    colors: [
      { name: 'Onyx Black', hex: '#121212' },
      { name: 'Smoke Grey', hex: '#4b5563' }
    ],
    variants: [
      { size: 'One Size (Adjustable 54-61cm)', stock: 35, sku: 'DC-SBC-BLK-OS' }
    ],
    stock: 35,
    sku: 'DC-SBC-01',
    rating: 4.9,
    reviewCount: 42,
    featured: true,
    bestseller: true,
    newArrival: false,
    material: '100% Organic Heavy Cotton Twill',
    features: ['Anti-sweat cooling band', 'Pre-curved 7cm visor', 'Tonal matte embroidery', 'Metal eyelet ventilation'],
    closureType: 'Antique Brass Slider Buckle',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    _id: 'prod-02',
    name: 'Deity Classic Black',
    slug: 'deity-classic-black',
    description: 'The definitive silhouette that started the movement. Structured 6-panel A-frame construction with crisp white 3D puff embroidery of the DEITY monogram on front panel.',
    category: 'Snapback',
    images: [
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1499,
    salePrice: 1299,
    discount: 13,
    colors: [
      { name: 'Jet Black / White', hex: '#000000' },
      { name: 'Black / Crimson', hex: '#881337' }
    ],
    variants: [
      { size: 'Adjustable Snap (55-62cm)', stock: 24, sku: 'DC-DCB-BLK-OS' }
    ],
    stock: 24,
    sku: 'DC-DCB-02',
    rating: 4.8,
    reviewCount: 38,
    featured: true,
    bestseller: true,
    newArrival: false,
    material: '80% Acrylic / 20% Wool Blend',
    features: ['Structured high crown', 'Flat brim with green undervisor', 'Snapback dual-peg closure', 'Interior custom seam taping'],
    closureType: 'Heavy Duty Snapback',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    _id: 'prod-03',
    name: 'Urban Street Cap',
    slug: 'urban-street-cap',
    description: 'Engineered for night shifts and metro commutes. Ripstop tactical nylon cap treated with DWR water-repellent coating and subtle reflective 3M piping on the visor rim.',
    category: 'Baseball Caps',
    images: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1199,
    salePrice: 899,
    discount: 25,
    colors: [
      { name: 'Dark Charcoal', hex: '#1f2937' },
      { name: 'Military Olive', hex: '#3f4c38' }
    ],
    variants: [
      { size: 'Standard Adjustable (55-60cm)', stock: 19, sku: 'DC-USC-CHR-OS' }
    ],
    stock: 19,
    sku: 'DC-USC-03',
    rating: 4.7,
    reviewCount: 29,
    featured: false,
    bestseller: false,
    newArrival: true,
    material: 'Cordura Ripstop Nylon + QuickDry Liner',
    features: ['Water & sweat resistant', 'Reflective 3M brim piping', 'Laser-cut ventilation ports', 'Quick-release buckle'],
    closureType: 'Nylon Webbing with Duraflex Clasp',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    _id: 'prod-04',
    name: 'Midnight Snapback',
    slug: 'midnight-snapback',
    description: 'Sleek nocturnal aesthetics. Pitch-black wool blend chassis paired with an ultra-soft suede visor and custom laser-engraved metal DEITY badge on the left temple.',
    category: 'Snapback',
    images: [
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1599,
    salePrice: 1399,
    discount: 13,
    colors: [
      { name: 'Midnight Pitch', hex: '#09090b' },
      { name: 'Midnight Navy', hex: '#0f172a' }
    ],
    variants: [
      { size: 'Snapback Pro (56-62cm)', stock: 15, sku: 'DC-MSB-MID-OS' }
    ],
    stock: 15,
    sku: 'DC-MSB-04',
    rating: 4.9,
    reviewCount: 31,
    featured: true,
    bestseller: true,
    newArrival: false,
    material: 'Virgin Wool Crown + Faux Suede Visor',
    features: ['Suede flat bill', 'Laser etched metallic deity emblem', 'Padded cotton sweatband', 'Reinforced buckram front'],
    closureType: 'Matte Black Snapback',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    _id: 'prod-05',
    name: 'Essential Beige Cap',
    slug: 'essential-beige-cap',
    description: 'Clean neutral tone made for everyday earth-tone wardrobes. Garment-dyed sand beige with relaxed crown profile and soft curved peak.',
    category: 'Dad Caps',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 999,
    salePrice: 799,
    discount: 20,
    colors: [
      { name: 'Warm Sand Beige', hex: '#d7c4b7' },
      { name: 'Chalk White', hex: '#f3f4f6' }
    ],
    variants: [
      { size: 'Unisex Fit (54-59cm)', stock: 42, sku: 'DC-EBC-BGE-OS' }
    ],
    stock: 42,
    sku: 'DC-EBC-05',
    rating: 4.6,
    reviewCount: 22,
    featured: false,
    bestseller: false,
    newArrival: true,
    material: '100% Chino Washed Cotton',
    features: ['Garment washed for vintage drape', 'Embroidered ventilation eyelets', 'Self-fabric tuck-in strap', 'Brass clasp'],
    closureType: 'Fabric Strap with Metal Tri-Glide',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    _id: 'prod-06',
    name: 'Vintage Wash Cap',
    slug: 'vintage-wash-cap',
    description: 'Acid-washed and distressed by hand to give authentic 90s archive energy. Every piece features distinct subtle distressing around the brim edges and crown seams.',
    category: 'Baseball Caps',
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1399,
    salePrice: 1099,
    discount: 21,
    colors: [
      { name: 'Washed Slate', hex: '#475569' },
      { name: 'Faded Espresso', hex: '#3e2723' }
    ],
    variants: [
      { size: 'Retro Fit (55-60cm)', stock: 28, sku: 'DC-VWC-SLT-OS' }
    ],
    stock: 28,
    sku: 'DC-VWC-06',
    rating: 4.8,
    reviewCount: 35,
    featured: true,
    bestseller: false,
    newArrival: true,
    material: '100% Enzyme Washed Cotton Twill',
    features: ['Hand-distressed visor details', 'Soft unconstructed front', 'Embroidered archive typography', 'Antiqued hardware'],
    closureType: 'Vintage Metal Buckle with Grommet',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: 'prod-07',
    name: 'Deity Signature Cap',
    slug: 'deity-signature-cap',
    description: 'The pinnacle of our Madurai manufacturing heritage. Embroidered with over 45,000 stitches of high-density Japanese thread detailing our signature calligraphic Deity motif.',
    category: 'Premium Collection',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1899,
    salePrice: 1499,
    discount: 21,
    colors: [
      { name: 'Obsidian & Gold', hex: '#0f0f12' },
      { name: 'Pure Platinum', hex: '#e2e8f0' }
    ],
    variants: [
      { size: 'Custom Fit (56-61cm)', stock: 18, sku: 'DC-DSC-OBS-OS' }
    ],
    stock: 18,
    sku: 'DC-DSC-07',
    rating: 5.0,
    reviewCount: 47,
    featured: true,
    bestseller: true,
    newArrival: false,
    material: 'Premium Merino Wool & Heavy Canvas blend',
    features: ['45,000+ stitch micro-density embroidery', 'Silk-lined interior crown', 'Gold foil brand certificate inside', 'Magnetic leather buckle'],
    closureType: 'Genuine Leather Strap with Magnet Lock',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    _id: 'prod-08',
    name: 'Monochrome Trucker',
    slug: 'monochrome-trucker',
    description: 'High-volume foam front with ultra-breathable open-weave mesh back. Clean monochrome color-blocking with silk-screen printed Deity graphic typography across the front panel.',
    category: 'Trucker Caps',
    images: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1099,
    salePrice: 849,
    discount: 23,
    colors: [
      { name: 'Black / White Mesh', hex: '#111827' },
      { name: 'All Blackout', hex: '#030712' }
    ],
    variants: [
      { size: 'Trucker Standard (55-61cm)', stock: 32, sku: 'DC-MTC-BWM-OS' }
    ],
    stock: 32,
    sku: 'DC-MTC-08',
    rating: 4.7,
    reviewCount: 19,
    featured: false,
    bestseller: true,
    newArrival: false,
    material: 'High-Density Poly Foam + Nylon Mesh',
    features: ['Zero-sweat breathability', 'Structured 5-panel foam chassis', 'Padded terrycloth inner band', 'Heavy duty double snap'],
    closureType: 'Dual Peg Snapback',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    _id: 'prod-09',
    name: 'Premium Embroidered Cap',
    slug: 'premium-embroidered-cap',
    description: 'Intricate botanical-streetwear hybrid embroidery across side profile and front visor. Custom woven label inside with serialized production code.',
    category: 'Premium Collection',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1699,
    salePrice: 1399,
    discount: 18,
    colors: [
      { name: 'Midnight Emerald', hex: '#064e3b' },
      { name: 'Deep Burgundy', hex: '#4c0519' }
    ],
    variants: [
      { size: 'Universal (55-60cm)', stock: 12, sku: 'DC-PEC-EMR-OS' }
    ],
    stock: 12,
    sku: 'DC-PEC-09',
    rating: 4.9,
    reviewCount: 26,
    featured: true,
    bestseller: false,
    newArrival: true,
    material: '100% Heavy Peached Cotton',
    features: ['Multi-color 8-needle embroidery', 'Silky comfort interior tape', 'Laser stamped back closure', 'Shape retention buckram'],
    closureType: 'Gunmetal Clasp with Hidden Tuck',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    _id: 'prod-10',
    name: 'Limited Edition Black',
    slug: 'limited-edition-black',
    description: 'Strictly capped at 150 pieces worldwide. Crafted from custom-milled stealth matte twill with individually engraved numbered stainless steel plate riveted to the back arch.',
    category: 'Limited Edition',
    images: [
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 2199,
    salePrice: 1899,
    discount: 14,
    colors: [
      { name: 'Stealth Matte Black', hex: '#050505' }
    ],
    variants: [
      { size: 'Pro Arch (56-62cm)', stock: 8, sku: 'DC-LEB-STL-OS' }
    ],
    stock: 8, // Low Stock indicator!
    sku: 'DC-LEB-10',
    rating: 5.0,
    reviewCount: 54,
    featured: true,
    bestseller: true,
    newArrival: false,
    material: 'Technical Kevlar-reinforced Twill',
    features: ['Numbered steel authenticity plate', 'Waterproof sealed seams', 'Matte rubberized front crest', 'Collector hardbox packaging included'],
    closureType: 'Fidlock Magnetic Slide Buckle',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    _id: 'prod-11',
    name: 'Street Core Cap',
    slug: 'street-core-cap',
    description: 'Everyday workhorse cap engineered for maximum resilience. Features heavy gauge contrast stitching, durable eyelets, and an unyielding shape-memory visor.',
    category: 'Baseball Caps',
    images: [
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1099,
    salePrice: 899,
    discount: 18,
    colors: [
      { name: 'Raw Black', hex: '#171717' },
      { name: 'Cement Grey', hex: '#64748b' }
    ],
    variants: [
      { size: 'Medium/Large (56-60cm)', stock: 50, sku: 'DC-SCC-RAW-OS' }
    ],
    stock: 50,
    sku: 'DC-SCC-11',
    rating: 4.7,
    reviewCount: 20,
    featured: false,
    bestseller: false,
    newArrival: false,
    material: '100% Heavy Duty Cotton Drill',
    features: ['Double-stitched stress zones', 'High-density inner band', 'Fade-resistant reactive dyes', 'Solid metal slider'],
    closureType: 'Embossed Metal Slider',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    _id: 'prod-12',
    name: 'Everyday Essential',
    slug: 'everyday-essential',
    description: 'The featherweight cap you grab on your way out the door. Minimal branding, relaxed dad cap crown, and pre-softened washed cotton that molds to your head on day one.',
    category: 'Dad Caps',
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 899,
    salePrice: 699,
    discount: 22,
    colors: [
      { name: 'Washed Black', hex: '#262626' },
      { name: 'Muted Khaki', hex: '#a89f91' },
      { name: 'Washed Navy', hex: '#1e293b' }
    ],
    variants: [
      { size: 'One Size (54-60cm)', stock: 65, sku: 'DC-EDE-BLK-OS' }
    ],
    stock: 65,
    sku: 'DC-EDE-12',
    rating: 4.8,
    reviewCount: 33,
    featured: false,
    bestseller: true,
    newArrival: false,
    material: 'Pre-shrunk 100% Breathable Cotton',
    features: ['Ultra-lightweight 220 GSM', 'No break-in time needed', 'Soft curved brim', 'Brass adjuster'],
    closureType: 'Fabric Strap with Brass Slide',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
  },
  {
    _id: 'prod-13',
    name: 'Custom Advertising & Brand Cap',
    slug: 'custom-advertising-cap',
    description: 'Direct from our Madurai manufacturing facility. Bulk customizable corporate, club, music tour, or brand caps with your custom 3D embroidery, patch, or screen-printing. Minimum order 25 units with tiered wholesale pricing.',
    category: 'Limited Edition',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85'
    ],
    price: 1499,
    salePrice: 1199,
    discount: 20,
    colors: [
      { name: 'Custom Brand Colors', hex: '#0a0a0a' },
      { name: 'Factory White', hex: '#ffffff' }
    ],
    variants: [
      { size: 'Custom Sized / Adjustable', stock: 100, sku: 'DC-B2B-MAD-OS' }
    ],
    stock: 100,
    sku: 'DC-B2B-13',
    rating: 5.0,
    reviewCount: 62,
    featured: true,
    bestseller: false,
    newArrival: true,
    material: 'Heavy Twill / Poly-Cotton / Mesh options',
    features: ['Custom logo digitization included', 'Direct factory pricing from Madurai', 'Samples available within 48 hours', 'Screenprint & 3D embroidery'],
    closureType: 'Snapback / Velcro / Buckle on request',
    customizable: true,
    createdAt: new Date().toISOString()
  }
];

const initialCoupons: ICoupon[] = [
  {
    _id: 'coup-01',
    code: 'DEITY10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 499,
    expiryDate: '2026-12-31T23:59:59.000Z',
    active: true,
    usageCount: 142,
    description: '10% off on all streetwear caps over ₹499'
  },
  {
    _id: 'coup-02',
    code: 'STREET200',
    discountType: 'fixed',
    discountValue: 200,
    minimumOrder: 1199,
    expiryDate: '2026-12-31T23:59:59.000Z',
    active: true,
    usageCount: 89,
    description: 'Flat ₹200 off on orders above ₹1,199'
  },
  {
    _id: 'coup-03',
    code: 'GENZFIRST',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrder: 999,
    expiryDate: '2026-12-31T23:59:59.000Z',
    active: true,
    usageCount: 215,
    description: 'Welcome drop: 15% off your first cap drop order'
  }
];

const initialReviews: IReview[] = [
  {
    _id: 'rev-01',
    user: 'user-02',
    userName: 'Aarav Sharma',
    product: 'prod-01',
    rating: 5,
    comment: 'The stitching quality on the Shadow Black Cap is unmatched. Fits like a dream, fabric feels premium and does not fade after sweat.',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    _id: 'rev-02',
    user: 'user-03',
    userName: 'Riya Sen',
    product: 'prod-02',
    rating: 5,
    comment: 'Classic Gen Z staple! Loved the 3D puff embroidery. Packaging arrived in pristine condition within 2 days in Bangalore.',
    status: 'approved',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    _id: 'rev-03',
    user: 'user-04',
    userName: 'Karthik Raja',
    product: 'prod-07',
    rating: 5,
    comment: 'Proud that Deity Caps is manufactured right in Madurai, Tamil Nadu! The quality rivals New Era and Supreme. 10/10.',
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    _id: 'rev-04',
    user: 'user-05',
    userName: 'Devika Nair',
    product: 'prod-04',
    rating: 4,
    comment: 'The suede brim feels super luxurious. Looks fire with dark hoodies.',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// MongoDB state
let isMongoConnected = false;
let mongoFallbackLogged = false;
const MONGO_URI = process.env.MONGODB_URI;

function switchToLocalStore(reason: unknown): void {
  const message = reason instanceof Error ? reason.message : String(reason);
  isMongoConnected = false;

  // The disk store is written before every cloud sync attempt, so writes stay
  // durable even when Atlas or DNS becomes unavailable.
  if (!mongoFallbackLogged) {
    mongoFallbackLogged = true;
    console.warn(`[Database] MongoDB sync unavailable (${message}). Continuing with local persistent storage.`);
  }
}

// Mongoose reconnects in the background. If Atlas becomes available again,
// resume collection syncing on the next write instead of requiring a restart.
mongoose.connection.on('connected', () => {
  if (MONGO_URI) {
    isMongoConnected = true;
    mongoFallbackLogged = false;
  }
});

mongoose.connection.on('disconnected', () => {
  if (isMongoConnected) switchToLocalStore('MongoDB connection was disconnected');
});

interface IStoreDoc extends mongoose.Document {
  key: string;
  data: any;
}

// Mongoose Schema for Store syncing
const storeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const StoreModel = (mongoose.models.DeityStore as mongoose.Model<IStoreDoc>) || mongoose.model<IStoreDoc>('DeityStore', storeSchema);

type MongoRecord = { _id: string; [key: string]: unknown };

function getMongoDatabase() {
  return mongoose.connection.readyState === 1 ? mongoose.connection.db : undefined;
}

async function loadSplitMongoStore(): Promise<IDataStore | null> {
  const database = getMongoDatabase();
  if (!database) return null;

  const [users, products, orders, reviews, coupons, categories, cartDocuments] = await Promise.all([
    database.collection<IUser>('users').find().toArray(),
    database.collection<IProduct>('products').find().toArray(),
    database.collection<IOrder>('orders').find().toArray(),
    database.collection<IReview>('reviews').find().toArray(),
    database.collection<ICoupon>('coupons').find().toArray(),
    database.collection<ICategory>('categories').find().toArray(),
    database.collection<{ _id: string; items: ICartItem[] }>('carts').find().toArray(),
  ]);

  if (users.length === 0 && products.length === 0 && orders.length === 0) return null;

  return {
    users,
    products,
    orders,
    reviews,
    coupons,
    categories,
    carts: Object.fromEntries(cartDocuments.map(cart => [cart._id, cart.items || []])),
  };
}

async function replaceMongoCollection(name: string, documents: MongoRecord[]): Promise<void> {
  const database = getMongoDatabase();
  if (!database) throw new Error('MongoDB connection is no longer ready');

  const collection = database.collection<MongoRecord>(name);
  const ids = documents.map(document => document._id);
  if (documents.length > 0) {
    await collection.bulkWrite(documents.map(document => ({
      replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true },
    })));
  }
  await collection.deleteMany(ids.length > 0 ? { _id: { $nin: ids } } : {});
}

async function syncSplitMongoStore(): Promise<void> {
  await Promise.all([
    replaceMongoCollection('users', store.users as unknown as MongoRecord[]),
    replaceMongoCollection('products', store.products as unknown as MongoRecord[]),
    replaceMongoCollection('orders', store.orders as unknown as MongoRecord[]),
    replaceMongoCollection('reviews', store.reviews as unknown as MongoRecord[]),
    replaceMongoCollection('coupons', store.coupons as unknown as MongoRecord[]),
    replaceMongoCollection('categories', store.categories as unknown as MongoRecord[]),
    replaceMongoCollection('carts', Object.entries(store.carts).map(([userId, items]) => ({ _id: userId, items }))),
  ]);
}

export function getDatabaseStatus() {
  return {
    isMongoConnected,
    mode: isMongoConnected ? 'MongoDB Atlas (Cloud Cluster)' : 'Persistent Local Engine (store.json)',
    host: isMongoConnected ? 'cluster0.swt4oka.mongodb.net' : 'Local Disk',
    databaseName: 'deitycaps'
  };
}

// Initialize database with MongoDB Atlas or persisted file with fresh seed data
export async function initDb(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Try connecting to MongoDB Atlas first
    if (MONGO_URI) {
      try {
        await mongoose.connect(MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
          dbName: 'deitycaps'
        });
        isMongoConnected = true;
        mongoFallbackLogged = false;
        console.log('[Database] Successfully connected to MongoDB Atlas (cluster0.swt4oka.mongodb.net/deitycaps)!');

        // Prefer the separate application collections. This is the normal
        // layout: `users`, `products`, `orders`, etc. under `deitycaps`.
        const splitStore = await loadSplitMongoStore();
        if (splitStore) {
          store = splitStore;
          console.log('[Database] Loaded DEITY CAPS data from separate MongoDB collections.');
          fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
          return;
        }

        // One-time compatibility migration from the previous single-document
        // `deitystores/main_store` layout.
        const legacyStore = await StoreModel.findOne({ key: 'main_store' });
        if (legacyStore?.data?.products?.length > 0) {
          store = legacyStore.data as IDataStore;
          await syncSplitMongoStore();
          console.log('[Database] Migrated legacy DEITY CAPS store into separate MongoDB collections.');
          fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
          return;
        }

        console.log('[Database] MongoDB Atlas database initialized for first time. Will sync seed data...');
      } catch (mongoErr: any) {
        console.warn('[Database] MongoDB Atlas connection notice:', mongoErr.message || mongoErr);
        console.log('[Database] Operating with local persistent store engine.');
      }
    }

    if (fs.existsSync(STORE_FILE)) {
      const fileData = fs.readFileSync(STORE_FILE, 'utf-8');
      store = JSON.parse(fileData);
      console.log(`[Database] Loaded persistent data store from ${STORE_FILE}`);
    } else {
      console.log('[Database] Creating initial seeded store...');
      // Hash admin & customer default passwords
      const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
      const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);

      store.users = [
        {
          _id: 'user-admin',
          name: 'Deity Admin',
          email: 'admin@deitycaps.com',
          password: adminPasswordHash,
          role: 'admin',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          phone: '+91 98435 66994',
          addresses: [
            {
              id: 'addr-admin-01',
              fullName: 'Deity Factory Operations',
              phone: '+91 98435 66994',
              street: 'Door No 206, Keeranur Village School, K. Valayarpatti',
              city: 'Madurai',
              state: 'Tamil Nadu',
              pincode: '625110',
              isDefault: true
            }
          ],
          wishlist: [],
          createdAt: new Date('2026-01-01').toISOString()
        },
        {
          _id: 'user-demo-customer',
          name: 'Rohan Verma',
          email: 'customer@deitycaps.com',
          password: customerPasswordHash,
          role: 'customer',
          profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
          phone: '+91 98765 43210',
          addresses: [
            {
              id: 'addr-cust-01',
              fullName: 'Rohan Verma',
              phone: '+91 98765 43210',
              street: 'Flat 402, Skyline Residency, Indiranagar',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560038',
              isDefault: true
            }
          ],
          wishlist: ['prod-01', 'prod-04', 'prod-07'],
          createdAt: new Date('2026-02-10').toISOString()
        }
      ];

      store.products = initialProducts;
      store.categories = initialCategories;
      store.coupons = initialCoupons;
      store.reviews = initialReviews;
      store.carts = {
        'user-demo-customer': [
          {
            id: 'cart-item-1',
            productId: 'prod-01',
            product: initialProducts[0],
            quantity: 1,
            selectedColor: 'Onyx Black',
            selectedVariant: 'One Size (Adjustable 54-61cm)'
          }
        ]
      };

      // Sample initial order for customer
      store.orders = [
        {
          _id: 'order-1001',
          orderNumber: 'DC-ORD-1001',
          user: 'user-demo-customer',
          customerName: 'Rohan Verma',
          customerEmail: 'customer@deitycaps.com',
          customerPhone: '+91 98765 43210',
          products: [
            {
              product: 'prod-02',
              name: 'Deity Classic Black',
              image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80',
              price: 1299,
              quantity: 1,
              color: 'Jet Black / White',
              variant: 'Adjustable Snap (55-62cm)'
            }
          ],
          shippingAddress: {
            id: 'addr-cust-01',
            fullName: 'Rohan Verma',
            phone: '+91 98765 43210',
            street: 'Flat 402, Skyline Residency, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            isDefault: true
          },
          subtotal: 1299,
          discount: 130,
          couponCode: 'DEITY10',
          deliveryFee: 0,
          total: 1169,
          paymentMethod: 'UPI / Online Card',
          paymentStatus: 'completed',
          orderStatus: 'Delivered',
          paymentId: 'pay_mock_12345678',
          trackingNumber: 'DTDC-BLR-89218',
          estimatedDelivery: 'Delivered on 10 Sep 2026',
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
          _id: 'order-1002',
          orderNumber: 'DC-ORD-1002',
          user: 'user-demo-customer',
          customerName: 'Rohan Verma',
          customerEmail: 'customer@deitycaps.com',
          customerPhone: '+91 98765 43210',
          products: [
            {
              product: 'prod-07',
              name: 'Deity Signature Cap',
              image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
              price: 1499,
              quantity: 1,
              color: 'Obsidian & Gold'
            }
          ],
          shippingAddress: {
            id: 'addr-cust-01',
            fullName: 'Rohan Verma',
            phone: '+91 98765 43210',
            street: 'Flat 402, Skyline Residency, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            isDefault: true
          },
          subtotal: 1499,
          discount: 0,
          deliveryFee: 0,
          total: 1499,
          paymentMethod: 'Test Card Payment',
          paymentStatus: 'completed',
          orderStatus: 'Shipped',
          paymentId: 'pay_mock_98765432',
          trackingNumber: 'BLUEDART-MAA-45192',
          estimatedDelivery: 'Arriving in 2 days',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ];

      saveDb();
    }

    // A newly connected but empty Atlas database must receive the local
    // store as well. Previously this only happened after a later write,
    // leaving the `DeityStore` collection empty on first connection.
    if (isMongoConnected) {
      await syncSplitMongoStore();
      console.log('[Database] Synced local DEITY CAPS data to separate MongoDB collections.');
    }
  } catch (err) {
    console.error('[Database] Error initializing db store:', err);
  }
}

export function saveDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');

    // Async sync to the separate MongoDB collections if connected.
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      void syncSplitMongoStore().catch(err => {
        switchToLocalStore(err);
      });
    } else if (isMongoConnected) {
      switchToLocalStore('MongoDB connection is no longer ready');
    }
  } catch (err) {
    console.error('[Database] Failed to write store to disk:', err);
  }
}

// Database helper functions mimicking MongoDB/Mongoose APIs cleanly
export const db = {
  users: {
    find: (predicate?: (u: IUser) => boolean) => (predicate ? store.users.filter(predicate) : store.users),
    findById: (id: string) => store.users.find(u => u._id === id),
    findOne: (predicate: (u: IUser) => boolean) => store.users.find(predicate),
    create: (user: Omit<IUser, '_id' | 'createdAt'> & { _id?: string; createdAt?: string }) => {
      const newUser: IUser = {
        _id: user._id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: user.createdAt || new Date().toISOString(),
        ...user
      };
      store.users.push(newUser);
      saveDb();
      return newUser;
    },
    update: (id: string, updates: Partial<IUser>) => {
      const idx = store.users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      store.users[idx] = { ...store.users[idx], ...updates };
      saveDb();
      return store.users[idx];
    },
    delete: (id: string) => {
      const idx = store.users.findIndex(u => u._id === id);
      if (idx === -1) return false;
      store.users.splice(idx, 1);
      saveDb();
      return true;
    }
  },

  products: {
    find: (predicate?: (p: IProduct) => boolean) => (predicate ? store.products.filter(predicate) : store.products),
    findById: (id: string) => store.products.find(p => p._id === id || p.slug === id),
    findOne: (predicate: (p: IProduct) => boolean) => store.products.find(predicate),
    create: (prod: Omit<IProduct, '_id' | 'createdAt' | 'slug'> & { _id?: string; slug?: string; createdAt?: string }) => {
      const slug = prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newProduct: IProduct = {
        _id: prod._id || `prod-${Date.now()}`,
        slug,
        createdAt: prod.createdAt || new Date().toISOString(),
        ...prod
      };
      store.products.push(newProduct);
      saveDb();
      return newProduct;
    },
    update: (id: string, updates: Partial<IProduct>) => {
      const idx = store.products.findIndex(p => p._id === id);
      if (idx === -1) return null;
      store.products[idx] = { ...store.products[idx], ...updates };
      saveDb();
      return store.products[idx];
    },
    delete: (id: string) => {
      const idx = store.products.findIndex(p => p._id === id);
      if (idx === -1) return false;
      store.products.splice(idx, 1);
      saveDb();
      return true;
    }
  },

  orders: {
    find: (predicate?: (o: IOrder) => boolean) => (predicate ? store.orders.filter(predicate) : store.orders),
    findById: (id: string) => store.orders.find(o => o._id === id || o.orderNumber === id),
    create: (order: Omit<IOrder, '_id' | 'createdAt' | 'orderNumber'> & { _id?: string; orderNumber?: string }) => {
      const orderNumber = order.orderNumber || `DC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: IOrder = {
        _id: order._id || `order-${Date.now()}`,
        orderNumber,
        createdAt: new Date().toISOString(),
        ...order
      };
      store.orders.unshift(newOrder); // newest first
      saveDb();
      return newOrder;
    },
    update: (id: string, updates: Partial<IOrder>) => {
      const idx = store.orders.findIndex(o => o._id === id);
      if (idx === -1) return null;
      store.orders[idx] = { ...store.orders[idx], ...updates };
      saveDb();
      return store.orders[idx];
    }
  },

  categories: {
    find: () => store.categories,
    findById: (id: string) => store.categories.find(c => c._id === id || c.slug === id),
    create: (cat: Omit<ICategory, '_id' | 'slug'> & { _id?: string; slug?: string }) => {
      const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: ICategory = {
        _id: cat._id || `cat-${Date.now()}`,
        slug,
        ...cat
      };
      store.categories.push(newCat);
      saveDb();
      return newCat;
    }
  },

  coupons: {
    find: () => store.coupons,
    findByCode: (code: string) => store.coupons.find(c => c.code.toUpperCase() === code.toUpperCase()),
    create: (coupon: Omit<ICoupon, '_id' | 'usageCount'> & { _id?: string }) => {
      const newCoupon: ICoupon = {
        _id: coupon._id || `coup-${Date.now()}`,
        usageCount: 0,
        ...coupon
      };
      store.coupons.push(newCoupon);
      saveDb();
      return newCoupon;
    },
    update: (id: string, updates: Partial<ICoupon>) => {
      const idx = store.coupons.findIndex(c => c._id === id);
      if (idx === -1) return null;
      store.coupons[idx] = { ...store.coupons[idx], ...updates };
      saveDb();
      return store.coupons[idx];
    },
    delete: (id: string) => {
      const idx = store.coupons.findIndex(c => c._id === id);
      if (idx === -1) return false;
      store.coupons.splice(idx, 1);
      saveDb();
      return true;
    }
  },

  reviews: {
    find: (predicate?: (r: IReview) => boolean) => (predicate ? store.reviews.filter(predicate) : store.reviews),
    create: (review: Omit<IReview, '_id' | 'createdAt'>) => {
      const newReview: IReview = {
        _id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        ...review
      };
      store.reviews.unshift(newReview);
      saveDb();
      return newReview;
    },
    update: (id: string, updates: Partial<IReview>) => {
      const idx = store.reviews.findIndex(r => r._id === id);
      if (idx === -1) return null;
      store.reviews[idx] = { ...store.reviews[idx], ...updates };
      saveDb();
      return store.reviews[idx];
    },
    delete: (id: string) => {
      const idx = store.reviews.findIndex(r => r._id === id);
      if (idx === -1) return false;
      store.reviews.splice(idx, 1);
      saveDb();
      return true;
    }
  },

  carts: {
    get: (userId: string) => store.carts[userId] || [],
    set: (userId: string, items: ICartItem[]) => {
      store.carts[userId] = items;
      saveDb();
      return store.carts[userId];
    }
  }
};
