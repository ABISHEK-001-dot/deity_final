import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Heart, ShoppingBag, Search, Phone, MapPin, Instagram, Shield, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenSearch }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All Caps', path: '/shop' },
    { label: 'New Arrivals', path: '/shop?filter=newArrival' },
    { label: 'Best Sellers', path: '/shop?filter=bestseller' },
    { label: 'Collections', path: '/collections' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact & Bulk Orders', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-4/5 max-w-sm h-full bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between overflow-y-auto shadow-2xl text-neutral-100"
          >
            {/* Top header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-wider text-white">
                  DEITY<span className="text-amber-400">.</span>CAPS
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/60 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="p-4 grid grid-cols-3 gap-2 border-b border-neutral-800">
              <button
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white"
              >
                <Search className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-medium">Search</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/wishlist');
                }}
                className="relative flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white"
              >
                <Heart className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-medium">Wishlist</span>
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1.5 right-2 w-4 h-4 bg-amber-400 text-neutral-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onClose();
                  setIsCartDrawerOpen(true);
                }}
                className="relative flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white"
              >
                <ShoppingBag className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-medium">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-4 h-4 bg-amber-400 text-neutral-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Main Navigation Links */}
            <div className="flex-1 px-4 py-6 space-y-1">
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-2">
                Navigation
              </span>
              {navLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLinkClick(link.path)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-all text-left"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                </button>
              ))}

              {/* Admin direct link if logged in as admin */}
              {isAdmin && (
                <button
                  onClick={() => handleLinkClick('/admin/dashboard')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 transition-all text-left mt-4"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Command Portal
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Account / Auth Bottom Box */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div
                    onClick={() => handleLinkClick('/account')}
                    className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
                  >
                    <img
                      src={user?.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                      alt={user?.name}
                      className="w-9 h-9 rounded-lg object-cover bg-neutral-800 border border-neutral-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleLinkClick('/account')}
                      className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-neutral-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLinkClick('/login')}
                    className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Madurai Factory direct contact */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Madurai, TN
                </span>
                <a
                  href="tel:+919843566994"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  +91 98435 66994
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
