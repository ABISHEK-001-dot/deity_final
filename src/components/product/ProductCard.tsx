import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import type { IProduct } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface ProductCardProps {
  product: IProduct;
  onQuickView?: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const isSaved = isInWishlist(product._id);
  const price = product.salePrice || product.price;

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product._id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedColor, product.variants[0]?.size);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      id={`product-card-${product._id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/5"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount && (
            <span className="bg-red-500 text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-md">
              {product.discount}% OFF
            </span>
          )}
          {product.newArrival && (
            <span className="bg-amber-400 text-neutral-950 font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-md">
              NEW DROP
            </span>
          )}
          {product.bestseller && !product.newArrival && (
            <span className="bg-neutral-800/90 backdrop-blur-md text-neutral-200 border border-neutral-700 font-semibold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-md">
              BESTSELLER
            </span>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="bg-rose-950/80 text-rose-300 border border-rose-800/40 text-[9px] font-bold px-2 py-0.5 rounded-md">
              LOW STOCK ({product.stock})
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          id={`wishlist-btn-${product._id}`}
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Quick View Overlay button */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10">
          <button
            onClick={handleQuickView}
            className="w-full py-2 bg-neutral-950/90 hover:bg-white hover:text-neutral-950 text-neutral-200 backdrop-blur-md border border-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xl"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400 uppercase tracking-wider font-semibold text-[11px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-neutral-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white text-[11px]">{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Color preview dots */}
          {product.colors && product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3" onClick={e => e.stopPropagation()}>
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColor === c.name
                      ? 'ring-1 ring-amber-400 border-white scale-110'
                      : 'border-neutral-700 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Price & Add to Cart */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-extrabold font-mono text-white">
                ₹{price}
              </span>
              {product.salePrice && (
                <span className="text-xs text-neutral-500 line-through font-mono">
                  ₹{product.price}
                </span>
              )}
            </div>
          </div>

          <button
            id={`add-to-cart-${product._id}`}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-2.5 bg-white text-neutral-950 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
            title={product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
