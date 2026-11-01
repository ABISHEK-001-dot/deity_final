import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  Instagram,
  CheckCircle2,
  ChevronRight,
  Layers,
  Factory
} from 'lucide-react';
import type { IProduct, ICategory } from '../types/index.ts';
import { ProductCard } from '../components/product/ProductCard.tsx';
import { QuickViewModal } from '../components/product/QuickViewModal.tsx';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedQuickView, setSelectedQuickView] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?limit=20'),
          fetch('/api/products/categories')
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products || []);
        if (catData.success) setCategories(catData.categories || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendingProducts = products.slice(0, 8);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.bestseller).slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 overflow-x-hidden pt-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-neutral-850">
        {/* Ambient atmospheric backdrop lighting */}
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-amber-400/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Gen Z Streetwear Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700/80 text-xs uppercase font-bold tracking-widest text-amber-400 shadow-xl">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DROP 2026 ARCHIVE LIVE</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-white uppercase leading-[0.95]">
                TOP OFF <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                  YOUR LOOK.
                </span>
              </h1>

              <p className="text-neutral-400 text-base sm:text-lg lg:text-xl font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Premium caps. Bold identity. Everyday streetwear.
                Engineered with high-density cotton, precision 3D puff embroidery, and zero-compromise silhouettes.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  id="hero-shop-now-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-bold text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-amber-400/20 active:scale-95"
                >
                  SHOP NOW
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/collections"
                  id="hero-explore-collection-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-neutral-900/90 hover:bg-neutral-800 text-white font-display font-bold text-sm tracking-wider uppercase rounded-2xl border border-neutral-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  EXPLORE COLLECTION
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-neutral-900 text-neutral-400 text-xs">
                <div>
                  <strong className="text-white block text-sm font-bold">100%</strong>
                  Heavy Cotton Twill
                </div>
                <div>
                  <strong className="text-white block text-sm font-bold">Madurai</strong>
                  Heritage Craftsmanship
                </div>
                <div>
                  <strong className="text-white block text-sm font-bold">Free Shipping</strong>
                  Orders above ₹999
                </div>
              </div>
            </motion.div>

            {/* Right Hero Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=85"
                  alt="DEITY CAPS Streetwear Hero"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                {/* Floating Product Badge */}
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/60 shadow-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      FEATURED DROP
                    </span>
                    <h4 className="font-display font-bold text-base text-white">Shadow Black Cap</h4>
                    <p className="text-xs text-neutral-400">380 GSM Japanese Twill • ₹999</p>
                  </div>
                  <Link
                    to="/product/shadow-black-cap"
                    className="p-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPS MARQUEE / TICKER */}
      <div className="border-b border-neutral-850 bg-neutral-900/50 py-4 overflow-hidden">
        <div className="flex items-center gap-8 text-xs uppercase font-bold tracking-widest text-neutral-400 whitespace-nowrap animate-marquee">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> FREE EXPRESS SHIPPING OVER ₹999
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> MADURAI DIRECT FACTORY PRICING
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" /> 7-DAY EASY HASSLE-FREE RETURNS
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-amber-400" /> CUSTOM ADVERTISING & BULK ORDERS
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> LIMITED RUN STREETWEAR EDITIONS
          </span>
        </div>
      </div>

      {/* 3. FEATURED CATEGORIES SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">
              CURATED SILHOUETTES
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Featured Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-neutral-300 hover:text-amber-400 transition-colors"
          >
            View all categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id || idx}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer shadow-lg"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              <div className="absolute inset-x-3 bottom-3 text-center">
                <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </h3>
                {cat.itemCount !== undefined && (
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {cat.itemCount} styles
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="py-16 bg-neutral-900/30 border-y border-neutral-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-amber-400 mb-2">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>COMMUNITY FAVORITES</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Trending Streetwear Caps
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Explore Shop
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={p => setSelectedQuickView(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. BRAND STATEMENT: "WEAR YOUR IDENTITY" */}
      <section className="py-24 relative overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-amber-400">
            THE DEITY MANIFESTO
          </span>

          <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase text-white tracking-tight leading-none">
            WEAR YOUR IDENTITY.
          </h2>

          <p className="text-neutral-300 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
            Caps aren't just an accessory; they are the crown of streetwear. Born from the industrial manufacturing precision of Madurai and fueled by Gen Z culture, DEITY CAPS crafts headwear for those who reject generic templates and express raw individuality.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% In-House Factory Production
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> High-Density Stitch Integrity
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authentic Streetwear Drape
            </span>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS DROPS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">
              JUST RELEASED
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?filter=newArrival"
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-neutral-300 hover:text-amber-400 transition-colors"
          >
            View all drops
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={p => setSelectedQuickView(p)}
            />
          ))}
        </div>
      </section>

      {/* 7. MADURAI MANUFACTURING & CUSTOM/ADVERTISING CAPS SPOTLIGHT */}
      <section className="py-20 bg-neutral-900/50 border-y border-neutral-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold uppercase tracking-wider">
                <Factory className="w-3.5 h-3.5" />
                <span>Direct From Madurai Manufacturing Facility</span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Custom Advertising & Bulk Cap Manufacturing
              </h3>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Deity Cap is one of the premier cap manufacturers in Madurai district, Tamil Nadu.
                Beyond retail drops, we manufacture high-grade custom advertising caps, corporate merchandise, music festival headwear, and branded team snapbacks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <strong className="text-white block font-bold mb-0.5">Custom 3D Puff Embroidery</strong>
                  Multi-angle stitching of company or fest logos
                </div>
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <strong className="text-white block font-bold mb-0.5">Wholesale Tier Pricing</strong>
                  Direct factory rates for bulk runs from 25 to 10,000+ caps
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3.5 bg-white text-neutral-950 hover:bg-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Request Bulk / Custom Quote
                </Link>
                <a
                  href="tel:+919843566994"
                  className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Call: +91 98435 66994
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85"
                  alt="Custom Cap Manufacturing in Madurai"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-xs">
                  <p className="font-bold text-white">Door No 206, Keeranur, Madurai-625110</p>
                  <p className="text-neutral-400 text-[11px]">Industrial Stitching • Advertising Caps • Streetwear</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BEST SELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">
              MOST COVETED
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?filter=bestseller"
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-neutral-300 hover:text-amber-400 transition-colors"
          >
            View all bestsellers
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={p => setSelectedQuickView(p)}
            />
          ))}
        </div>
      </section>

      {/* 9. INSTAGRAM & SOCIAL MOVEMENT SECTION */}
      <section className="py-20 bg-neutral-950 border-t border-neutral-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-amber-400">
              @DEITY_ADVERTISINGCAPS_1
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              FOLLOW THE MOVEMENT
            </h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Tag <strong className="text-white">#DEITYCAPS</strong> to be featured on our official feed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                img: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=80',
                tag: '@aarav_fits'
              },
              {
                img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80',
                tag: '@riya.archive'
              },
              {
                img: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
                tag: '@karthik_blr'
              },
              {
                img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
                tag: '@devika.street'
              }
            ].map((item, i) => (
              <a
                key={i}
                href="https://instagram.com/deity_advertisingcaps_1"
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-lg"
              >
                <img
                  src={item.img}
                  alt="Streetwear community"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                  <Instagram className="w-5 h-5 text-amber-400" />
                  <span>{item.tag}</span>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://instagram.com/deity_advertisingcaps_1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Instagram className="w-4 h-4 text-amber-400" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedQuickView}
        isOpen={Boolean(selectedQuickView)}
        onClose={() => setSelectedQuickView(null)}
      />
    </div>
  );
};
