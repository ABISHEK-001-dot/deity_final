import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, ShieldCheck, Sparkles, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="py-12 border-b border-neutral-850 mb-16 text-center max-w-4xl mx-auto space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.3em] text-amber-400">
            HERITAGE & VISION
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl uppercase text-white tracking-tight">
            BUILT IN MADURAI. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500">
              WORN EVERYWHERE.
            </span>
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
            Deity Cap is one of the premier cap manufacturers in Madurai district, Tamil Nadu.
            We blend heavy industrial textile craftsmanship with underground Gen Z streetwear culture.
          </p>
        </div>

        {/* 2-Column Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Factory className="w-4 h-4" /> The Factory Floor
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase text-white leading-tight">
              Direct-From-Manufacturer Integrity
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Most streetwear labels outsource their production through multiple broker tiers, diluting fabric quality and inflating price tags. At DEITY CAPS, every snapback, trucker mesh, and dad cap is created under our own roof in Keeranur Village, Madurai.
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Our plant operates state-of-the-art computerized Tajima embroidery heads capable of high-density 3D puff stitching, reinforced crown blocking, and precision laser eyelet venting.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-display font-black text-3xl text-white block">380 GSM</span>
                <span className="text-xs text-neutral-400">Heavyweight Japanese Twill</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="font-display font-black text-3xl text-amber-400 block">100%</span>
                <span className="text-xs text-neutral-400">In-House Manufacturing</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=85"
                alt="DEITY CAPS Madurai Manufacturing Plant"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Keeranur Industrial Unit, Madurai, Tamil Nadu
                </p>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Serving individual streetwear enthusiasts and enterprise advertising partners across India.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-850 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl uppercase text-white">
              Gen Z Streetwear Aesthetic
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Designed for young creatives, artists, skaters, and trendsetters who consider headwear as the cornerstone of their visual expression.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-850 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl uppercase text-white">
              Zero-Compromise Build
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Moisture-wicking internal cotton sweatbands, shape-retentive buckram, rust-proof metallic adjusters, and double-needle needlework.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-850 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl uppercase text-white">
              Ethical & Sustainable
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Low-impact reactive dyes that resist UV fading, zero-plastic biodegradable kraft packaging, and fair artisan compensation.
            </p>
          </div>
        </div>

        {/* CTA to Shop or Contact */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 text-center space-y-6">
          <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            Ready to Upgrade Your Headwear?
          </h3>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto">
            Discover our latest limited archival drops or get in touch for customized bulk cap orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              SHOP STREETWEAR CAPS
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              CONTACT MADURAI FACTORY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
