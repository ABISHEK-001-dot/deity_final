import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Heart, ShoppingBag, Check, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import type { IProduct } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface QuickViewModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  // Reset state when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name || 'Standard');
      setSelectedVariant(product.variants[0]?.size || 'One Size');
      setQuantity(1);
      setActiveImageIdx(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!isOpen || !product) return null;

  const inWishlist = isInWishlist(product._id);
  const price = product.salePrice || product.price;

  const handleAddToCart = async () => {
    await addToCart(product, quantity, selectedColor, selectedVariant);
    onClose();
  };

  const handleViewFullPage = () => {
    onClose();
    navigate(`/product/${product.slug || product._id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-neutral-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-neutral-950/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-700/50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="bg-neutral-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {product.discount}% OFF
                  </div>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <div className="absolute bottom-3 left-3 bg-amber-500 text-black text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Only {product.stock} Left
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIdx === i ? 'border-amber-400 scale-105' : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-semibold tracking-wider text-amber-400">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{product.rating}</span>
                    <span>({product.reviewCount} reviews)</span>
                  </div>
                </div>

                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2 leading-tight">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    ₹{price}
                  </span>
                  {product.salePrice && (
                    <span className="text-base text-neutral-500 line-through font-mono">
                      ₹{product.price}
                    </span>
                  )}
                  <span className="text-xs text-emerald-400 font-medium">Inclusive of all taxes</span>
                </div>

                <p className="text-sm text-neutral-400 line-clamp-3 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                      Colorway: <span className="text-white font-normal">{selectedColor}</span>
                    </label>
                    <div className="flex items-center gap-2.5">
                      {product.colors.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`group relative p-1 rounded-full transition-all ${
                            selectedColor === c.name ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={c.name}
                        >
                          <span
                            className="block w-6 h-6 rounded-full border border-neutral-700 shadow-inner"
                            style={{ backgroundColor: c.hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size / Fit Variant */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                      Fit & Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedVariant(v.size)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selectedVariant === v.size
                              ? 'bg-white text-neutral-950 border-white font-bold'
                              : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-display font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.stock <= 0 ? 'SOLD OUT' : 'ADD TO CART'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      inWishlist
                        ? 'bg-red-500/10 border-red-500/40 text-red-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-400' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleViewFullPage}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  View full cap specifications & reviews
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
