import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, ArrowRight, Truck, Tag, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    total,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const handleMoveToWishlist = async (item: any) => {
    await toggleWishlist(item.product);
    await removeFromCart(item.id);
  };

  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsCartDrawerOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl text-neutral-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-bold text-lg tracking-wider uppercase text-white">
                    Your Cart ({itemCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              <div className="px-6 py-3.5 bg-neutral-950/80 border-b border-neutral-800">
                <div className="flex items-center justify-between text-xs font-medium mb-2">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    {subtotal >= freeDeliveryThreshold ? (
                      <span className="text-emerald-400 font-semibold">Free Express Delivery Unlocked!</span>
                    ) : (
                      <span>
                        Add <strong className="text-amber-400">₹{amountNeededForFreeDelivery}</strong> more for Free Delivery
                      </span>
                    )}
                  </span>
                  <span className="text-neutral-500 font-mono text-[11px]">{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeDeliveryProgress}%` }}
                    className={`h-full ${
                      freeDeliveryProgress === 100 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h4 className="font-display font-bold text-lg text-white mb-1">Your cart is empty</h4>
                    <p className="text-neutral-400 text-sm max-w-xs mb-6">
                      Looks like you haven't topped off your look with a DEITY cap yet.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        navigate('/shop');
                      }}
                      className="px-6 py-3 bg-white text-neutral-950 hover:bg-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
                    >
                      EXPLORE STREETWEAR CAPS
                    </button>
                  </div>
                ) : (
                  items.map(item => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 group"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-xl object-cover bg-neutral-800 shrink-0 border border-neutral-800"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => {
                                  setIsCartDrawerOpen(false);
                                  navigate(`/product/${item.product.slug || item.product._id}`);
                                }}
                                className="font-semibold text-sm text-white hover:text-amber-400 cursor-pointer transition-colors truncate"
                              >
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                                title="Remove cap"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                              <span>{item.selectedColor || 'Standard'}</span>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{item.selectedVariant || 'Adjustable'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-white min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-sm text-white font-mono">
                                ₹{price * item.quantity}
                              </span>
                              {item.product.salePrice && (
                                <span className="block text-[10px] text-neutral-500 line-through">
                                  ₹{item.product.price * item.quantity}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 mt-1 border-t border-neutral-850 flex items-center justify-end">
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                            >
                              <Heart className="w-3 h-3" />
                              Move to wishlist
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="p-6 bg-neutral-950 border-t border-neutral-800 space-y-4">
                  {/* Promo coupon input */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        <span>
                          Code <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discountAmount})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-neutral-400 hover:text-white text-xs underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Promo code (e.g. DEITY10)"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-neutral-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-xl transition-colors shrink-0"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-mono">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount</span>
                        <span className="font-mono">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Express Shipping</span>
                      <span className="text-white font-mono">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-400 font-semibold">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline text-sm font-bold text-white">
                      <span>Total Amount</span>
                      <span className="text-lg font-mono text-amber-400">₹{total}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleCheckout}
                      className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-400/20 active:scale-[0.99]"
                    >
                      PROCEED TO CHECKOUT
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="w-full py-2.5 text-neutral-400 hover:text-white text-xs font-medium uppercase tracking-wider text-center transition-colors"
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
