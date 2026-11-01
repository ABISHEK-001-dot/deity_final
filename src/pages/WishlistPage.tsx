import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = async (product: any) => {
    await addToCart(product, 1, product.colors?.[0]?.name, product.variants?.[0]?.size);
    await removeFromWishlist(product._id);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 border-b border-neutral-850 mb-8 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1 block">
              SAVED PIECES
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight">
              My Wishlist ({wishlist.length})
            </h1>
          </div>
          {wishlist.length > 0 && (
            <Link
              to="/shop"
              className="text-xs uppercase font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Continue Exploring
            </Link>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-neutral-900/40 border border-neutral-850 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Bookmark your favorite streetwear drops and come back to them anytime.
            </p>
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              EXPLORE CAPS
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(product => {
              const price = product.salePrice || product.price;
              return (
                <div
                  key={product._id}
                  className="group relative flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:border-neutral-700 transition-all"
                >
                  <div className="relative aspect-square bg-neutral-950 overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.slug || product._id}`)}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(product._id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-neutral-950/80 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-800 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        {product.category}
                      </span>
                      <h3
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                        className="font-bold text-sm text-white hover:text-amber-400 cursor-pointer truncate mt-0.5"
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-mono font-bold text-white text-base">₹{price}</span>
                        {product.salePrice && (
                          <span className="font-mono text-xs text-neutral-500 line-through">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-800">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock <= 0}
                        className="w-full py-2.5 bg-white text-neutral-950 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {product.stock <= 0 ? 'Out of stock' : 'Move to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
