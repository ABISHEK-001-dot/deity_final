import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';

// Layout & Overlays
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';

// Pages
import { Home } from './pages/Home.tsx';
import { Shop } from './pages/Shop.tsx';
import { ProductDetail } from './pages/ProductDetail.tsx';
import { Collections } from './pages/Collections.tsx';
import { About } from './pages/About.tsx';
import { Contact } from './pages/Contact.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { Checkout } from './pages/Checkout.tsx';
import { OrderSuccess } from './pages/OrderSuccess.tsx';
import { Payment } from './pages/Payment.tsx';
import { OrderPending } from './pages/OrderPending.tsx';
import { Login } from './pages/auth/Login.tsx';
import { Register } from './pages/auth/Register.tsx';
import { UserAccount } from './pages/account/UserAccount.tsx';
import { AdminLogin } from './pages/admin/AdminLogin.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';

// Scroll restoration
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Route wrapper to conditionally hide navbar & footer on admin dashboard if preferred or keep universal
const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-amber-400 selection:text-neutral-950">
      <ScrollToTop />
      {!isAdminDashboard && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Storefront Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Checkout & Orders */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-pending/:orderId" element={<OrderPending />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />

          {/* Customer Auth & Account */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<UserAccount />} />

          {/* Admin Command Center */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAdminDashboard && <Footer />}

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppLayout />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
