import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  Shield,
  LogOut,
  ChevronDown,
  Package,
  Sliders,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { SearchModal } from '../search/SearchModal.tsx';
import { MobileMenu } from './MobileMenu.tsx';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll detection for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'New Arrivals', path: '/shop?filter=newArrival', badge: 'NEW' },
    { label: 'Best Sellers', path: '/shop?filter=bestseller', icon: Flame },
    { label: 'Collections', path: '/collections' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/90 py-3.5 shadow-2xl'
            : 'bg-neutral-950/70 backdrop-blur-md border-b border-neutral-800/40 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-trigger"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* DEITY CAPS Logo */}
          <Link
            to="/"
            id="brand-logo"
            className="flex items-center gap-2 group cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-neutral-950 font-display font-black text-lg group-hover:bg-amber-400 transition-colors shadow-md">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black tracking-wider text-xl sm:text-2xl text-white leading-none">
                DEITY<span className="text-amber-400">.</span>CAPS
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-semibold leading-none mt-1">
                MADURAI STREETWEAR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={idx}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white bg-neutral-900 border border-neutral-700/80 shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`
                  }
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-neutral-950 font-black rounded-full">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Action Icons Right */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger */}
            <button
              id="search-icon-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:p-2.5 text-neutral-300 hover:text-white hover:bg-neutral-800/70 rounded-full transition-colors relative"
              title="Search caps"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              id="wishlist-nav-link"
              className="p-2 sm:p-2.5 text-neutral-300 hover:text-white hover:bg-neutral-800/70 rounded-full transition-colors relative"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-neutral-950 font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-neutral-950">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              id="cart-nav-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2 sm:p-2.5 text-neutral-300 hover:text-white hover:bg-neutral-800/70 rounded-full transition-colors relative"
              title="Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-white text-neutral-950 font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-neutral-950 animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Admin Quick Switcher Badge (if logged in as admin) */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 text-xs font-bold uppercase tracking-wider hover:bg-amber-400/25 transition-colors"
                title="Admin Command Center"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account / Profile Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  id="user-profile-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 transition-colors"
                >
                  <img
                    src={user?.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover bg-neutral-800 border border-neutral-700"
                  />
                  <span className="text-xs font-bold max-w-[80px] truncate hidden md:inline">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                </button>
              ) : (
                <Link
                  to="/login"
                  id="login-nav-btn"
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && isAuthenticated && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3 py-2.5 border-b border-neutral-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                        Administrator
                      </span>
                    )}
                  </div>

                  <Link
                    to="/account"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/account?tab=orders"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Package className="w-4 h-4 text-neutral-400" />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-neutral-400" />
                    Wishlist ({wishlistIds.length})
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-400/10 transition-colors"
                    >
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="pt-1 mt-1 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => {
          setIsMobileMenuOpen(false);
          setIsSearchOpen(true);
        }}
      />
    </>
  );
};
