import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IProduct } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface WishlistContextType {
  wishlist: IProduct[];
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: IProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deity_wishlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { token, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (token) {
      const fetchWishlist = async () => {
        try {
          const res = await fetch('/api/auth/wishlist', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setWishlist(data.wishlist || []);
            setWishlistIds(data.ids || []);
            localStorage.setItem('deity_wishlist_ids', JSON.stringify(data.ids || []));
          }
        } catch (err) {
          console.error('Error fetching wishlist:', err);
        }
      };
      fetchWishlist();
    } else {
      // Fetch products for stored ids in guest mode
      if (wishlistIds.length > 0) {
        fetch('/api/products?limit=50')
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.products)) {
              setWishlist(data.products.filter((p: IProduct) => wishlistIds.includes(p._id)));
            }
          })
          .catch(console.error);
      } else {
        setWishlist([]);
      }
    }
  }, [token, user]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (product: IProduct) => {
    const isPresent = wishlistIds.includes(product._id);

    if (token) {
      try {
        const res = await fetch(`/api/auth/wishlist/${product._id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWishlistIds(data.ids || []);
          setWishlist(data.wishlist || []);
          showToast(data.message, isPresent ? 'info' : 'success');
        }
      } catch (err) {
        showToast('Wishlist operation failed.', 'error');
      }
    } else {
      // Guest mode
      if (isPresent) {
        const newIds = wishlistIds.filter(id => id !== product._id);
        setWishlistIds(newIds);
        setWishlist(prev => prev.filter(p => p._id !== product._id));
        localStorage.setItem('deity_wishlist_ids', JSON.stringify(newIds));
        showToast('Removed from wishlist', 'info');
      } else {
        const newIds = [...wishlistIds, product._id];
        setWishlistIds(newIds);
        setWishlist(prev => [...prev, product]);
        localStorage.setItem('deity_wishlist_ids', JSON.stringify(newIds));
        showToast('Added to wishlist', 'success');
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const item = wishlist.find(p => p._id === productId);
    if (item) {
      await toggleWishlist(item);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
