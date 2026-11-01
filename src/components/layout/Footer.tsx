import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, MapPin, Phone, Mail, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Welcome to the DEITY Streetwear community! 10% code sent to your inbox.', 'success');
    setEmail('');
  };

  return (
    <footer id="main-footer" className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Community Newsletter Bar */}
        <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/90 border border-neutral-800 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">
                STREETWEAR DROPS & EXCLUSIVES
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight">
                JOIN THE DEITY COMMUNITY
              </h3>
              <p className="text-neutral-400 text-sm mt-2 max-w-lg">
                Get first access to limited-edition cap drops, underground collaborations, and special manufacturer pricing.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>You're on the list! Check your email for code <strong>DEITY10</strong>.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    SUBSCRIBE
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand Info & Madurai Legacy */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-neutral-950 font-display font-black text-lg">
                D
              </div>
              <span className="font-display font-black tracking-wider text-2xl text-white">
                DEITY<span className="text-amber-400">.</span>CAPS
              </span>
            </Link>

            <p className="text-neutral-300 font-medium text-sm italic">
              "Built for those who wear their identity."
            </p>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              DEITY CAPS is a premier cap manufacturing powerhouse based in Madurai district, Tamil Nadu.
              We fuse authentic Gen Z streetwear edge with high-precision industrial cap manufacturing, producing retail drops, custom advertising headwear, and bespoke embroidered caps.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/deity_advertisingcaps_1"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 flex items-center justify-center transition-colors"
                title="Instagram @deity_advertisingcaps_1"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Streetwear Caps
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=newArrival" className="hover:text-white transition-colors">
                  New Arrivals Drop
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=bestseller" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Snapback" className="hover:text-white transition-colors">
                  Snapback Caps
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Trucker%20Caps" className="hover:text-white transition-colors">
                  Trucker Mesh Caps
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Limited%20Edition" className="hover:text-white transition-colors">
                  Limited Edition Archival
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand & Support */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Company & Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About DEITY CAPS
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  FAQ & Sizing Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Custom & Advertising Caps
                </Link>
              </li>
              <li>
                <span className="text-neutral-500 hover:text-neutral-400 cursor-pointer">
                  Free Shipping (Over ₹999)
                </span>
              </li>
              <li>
                <span className="text-neutral-500 hover:text-neutral-400 cursor-pointer">
                  7-Day Return Policy
                </span>
              </li>
              <li>
                <span className="text-neutral-500 hover:text-neutral-400 cursor-pointer">
                  Privacy Policy & Terms
                </span>
              </li>
            </ul>
          </div>

          {/* Madurai Manufacturing Details */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Manufacturing HQ
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Door No 206, Keeranur Village School, K. Valayarpatti, Keeranur, Thuvarangulam, Madurai-625110, Tamil Nadu, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+919843566994" className="hover:text-white transition-colors font-mono">
                  +91 98435 66994
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:deitycap@gmail.com" className="hover:text-white transition-colors">
                  deitycap@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="https://instagram.com/deity_advertisingcaps_1"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @deity_advertisingcaps_1
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin Login portal link */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 DEITY CAPS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Crafted for Gen Z & Young Adults</span>
            <span>•</span>
            <Link
              to="/admin/login"
              className="text-neutral-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
