import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ICartItem, IProduct } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface CartContextType {
  items: ICartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon: { code: string; discountAmount: number; description?: string } | null;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: IProduct, quantity?: number, color?: string, variant?: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ICartItem[]>(() => {
    try {
      const saved = localStorage.getItem('deity_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const freeDeliveryThreshold = 999;

  // Sync cart from server if logged in
  useEffect(() => {
    if (user && token) {
      const fetchServerCart = async () => {
        try {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setItems(data.items);
            localStorage.setItem('deity_cart', JSON.stringify(data.items));
          }
        } catch (err) {
          console.error('Error fetching server cart:', err);
        }
      };
      fetchServerCart();
    }
  }, [user, token]);

  // Persist guest cart locally
  useEffect(() => {
    localStorage.setItem('deity_cart', JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryFee = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 99;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const addToCart = async (
    product: IProduct,
    quantity: number = 1,
    color?: string,
    variant?: string
  ): Promise<boolean> => {
    if (product.stock <= 0) {
      showToast('This cap is currently sold out!', 'error');
      return false;
    }

    const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Standard';
    const selectedVariant = variant || (product.variants && product.variants[0]?.size) || 'One Size (Adjustable)';

    if (token) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product._id,
            quantity,
            selectedColor,
            selectedVariant
          })
        });
        const data = await res.json();
        if (data.success && data.items) {
          setItems(data.items);
          showToast(`Added ${product.name} to your cart`, 'success');
          setIsCartDrawerOpen(true);
          return true;
        } else {
          showToast(data.message || 'Could not add to cart.', 'error');
          return false;
        }
      } catch (err) {
        showToast('Failed to add cap to cart.', 'error');
        return false;
      }
    } else {
      // Local cart for guests
      setItems(prev => {
        const idx = prev.findIndex(
          i =>
            i.productId === product._id &&
            i.selectedColor === selectedColor &&
            i.selectedVariant === selectedVariant
        );

        if (idx > -1) {
          const newItems = [...prev];
          const updatedQty = newItems[idx].quantity + quantity;
          if (updatedQty > product.stock) {
            showToast(`Max available stock is ${product.stock}`, 'error');
            return prev;
          }
          newItems[idx] = { ...newItems[idx], quantity: updatedQty };
          return newItems;
        } else {
          return [
            ...prev,
            {
              id: `guest-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: product._id,
              product,
              quantity,
              selectedColor,
              selectedVariant
            }
          ];
        }
      });

      showToast(`Added ${product.name} to cart`, 'success');
      setIsCartDrawerOpen(true);
      return true;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return false;

    if (item.product.stock < quantity) {
      showToast(`Only ${item.product.stock} caps in stock.`, 'error');
      return false;
    }

    if (token) {
      try {
        const res = await fetch(`/api/cart/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (data.success && data.items) {
          setItems(data.items);
          return true;
        }
      } catch (err) {
        showToast('Failed to update quantity.', 'error');
        return false;
      }
    }

    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
    );
    return true;
  };

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    const item = items.find(i => i.id === itemId);
    if (token) {
      try {
        const res = await fetch(`/api/cart/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.items) {
          setItems(data.items);
          showToast(`Removed from cart`, 'info');
          return true;
        }
      } catch (err) {
        showToast('Failed to remove item.', 'error');
        return false;
      }
    }

    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast(`Removed ${item?.product.name || 'item'} from cart`, 'info');
    return true;
  };

  const clearCart = () => {
    if (token) {
      fetch('/api/cart', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(console.error);
    }
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('deity_cart');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code.', 'error');
      return false;
    }

    try {
      const res = await fetch('/api/orders/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Invalid coupon code.', 'error');
        return false;
      }

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        description: data.message
      });
      showToast(data.message, 'success');
      return true;
    } catch (err) {
      showToast('Failed to validate coupon code.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promo code removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        total,
        appliedCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
