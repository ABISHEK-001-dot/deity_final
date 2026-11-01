import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { IProduct, IReview } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ProductCard } from '../components/product/ProductCard.tsx';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Review submission state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedColor(data.product.colors[0]?.name || 'Standard');
          setSelectedVariant(data.product.variants[0]?.size || 'One Size (Adjustable)');
          setActiveImageIdx(0);
          setQuantity(1);

          // Fetch related
          if (data.product.category) {
            const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=4`);
            const relData = await relRes.json();
            if (relData.success) {
              setRelatedProducts(relData.products.filter((p: IProduct) => p._id !== data.product._id));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching cap detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-28 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-32 pb-20 text-center px-4">
        <h2 className="font-display font-black text-3xl text-white mb-2">Cap Not Found</h2>
        <p className="text-neutral-400 text-sm mb-6">
          This drop may be archival or no longer available in our collection.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl inline-block"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);
  const price = product.salePrice || product.price;

  const handleAddToCart = async () => {
    await addToCart(product, quantity, selectedColor, selectedVariant);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product, quantity, selectedColor, selectedVariant);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Cap link copied to clipboard!', 'info');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please add your thoughts in the review comment.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
          userName: reviewerName.trim() || user?.name || 'Streetwear Fan'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Review submitted for verification!', 'success');
        setIsReviewModalOpen(false);
        setReviewComment('');
      } else {
        showToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      showToast('Failed to post review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 py-4 mb-4">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-white transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    {product.discount}% OFF
                  </span>
                )}
                {product.newArrival && (
                  <span className="bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    NEW DROP
                  </span>
                )}
              </div>

              {/* Share & Wishlist buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-neutral-300 hover:text-white backdrop-blur-md border border-neutral-800 transition-colors shadow-lg"
                  title="Share cap"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-full backdrop-blur-md border transition-all shadow-lg ${
                    isSaved
                      ? 'bg-red-500 text-white border-red-500 shadow-red-500/30'
                      : 'bg-neutral-950/70 hover:bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800'
                  }`}
                  title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIdx === i
                        ? 'border-amber-400 scale-105 shadow-lg shadow-amber-400/10'
                        : 'border-neutral-850 hover:border-neutral-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Purchase Form */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  {product.category}
                </span>
                <span className="text-xs text-neutral-500 font-mono">SKU: {product.sku}</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating & Reviews pill */}
              <div className="flex items-center gap-3 text-xs mb-4">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                </div>
                <a href="#reviews-section" className="text-neutral-400 hover:text-white underline">
                  {product.reviewCount} customer reviews
                </a>
                <span className="text-neutral-600">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Verified Streetwear
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  ₹{price}
                </span>
                {product.salePrice && (
                  <span className="text-lg text-neutral-500 line-through font-mono">
                    ₹{product.price}
                  </span>
                )}
                {product.discount && (
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                    SAVE {product.discount}%
                  </span>
                )}
                <span className="text-[11px] text-neutral-500 ml-auto block">Inclusive of GST</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-300 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2.5">
                  Selected Colorway: <strong className="text-white">{selectedColor}</strong>
                </label>
                <div className="flex items-center gap-3">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`relative p-1 rounded-full transition-all ${
                        selectedColor === c.name
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-950 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="block w-7 h-7 rounded-full border border-neutral-700 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fit / Variant selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2.5">
                  Silhouette Fit
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedVariant(v.size)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedVariant === v.size
                          ? 'bg-white text-neutral-950 border-white shadow-md'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-neutral-400 mb-2.5">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-800 rounded-xl bg-neutral-900 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold font-mono text-white min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-neutral-400">
                  {product.stock > 0 ? (
                    <span className="text-emerald-400 font-semibold">In Stock ({product.stock} units)</span>
                  ) : (
                    <span className="text-red-400 font-semibold">Sold Out</span>
                  )}
                </span>
              </div>
            </div>

            {/* Purchase CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  id="add-to-cart-page-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 py-4 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-display font-black text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-amber-400/20 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  ADD TO CART
                </button>

                <button
                  id="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 py-4 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-display font-black text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  BUY NOW
                </button>
              </div>

              {/* Key Assurance Badges */}
              <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-850 grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-400">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Free Shipping &gt; ₹999</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>7-Day Return Policy</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Madurai Certified</span>
                </div>
              </div>
            </div>

            {/* Specifications Details Accordion/Section */}
            <div className="pt-4 border-t border-neutral-850 space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-white">
                  Cap Craftsmanship & Details
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-400">
                  <li><strong className="text-neutral-200">Material:</strong> {product.material}</li>
                  <li><strong className="text-neutral-200">Closure:</strong> {product.closureType}</li>
                  <li><strong className="text-neutral-200">Origin:</strong> Keeranur Factory, Madurai, Tamil Nadu</li>
                  {product.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-neutral-300">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews-section" className="mt-24 pt-16 border-t border-neutral-850">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1 block">
                COMMUNITY FEEDBACK
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white">
                Customer Reviews ({product.reviewCount})
              </h3>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Write A Review
            </button>
          </div>

          {/* Existing reviews or sample verified reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map(rev => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                        {rev.userName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{rev.userName}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Verified Buyer</span>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-neutral-500 block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center rounded-2xl bg-neutral-900/30 border border-neutral-850">
                <p className="text-sm text-neutral-400 mb-3">Be the first to review this drop!</p>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Add Your Feedback
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-neutral-850">
            <h3 className="font-display font-black text-2xl uppercase text-white mb-8">
              You May Also Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Write a Cap Review</h3>
                <p className="text-xs text-neutral-400">{product.name}</p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star rating selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400' : 'text-neutral-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder={user?.name || 'e.g. Aryan'}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Your Thoughts & Fit Feedback
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="How does the brim curve feel? How is the 3D embroidery quality?"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
