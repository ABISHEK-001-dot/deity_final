import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import type { IProduct, ICategory } from '../types/index.ts';
import { ProductCard } from '../components/product/ProductCard.tsx';
import { QuickViewModal } from '../components/product/QuickViewModal.tsx';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuickView, setSelectedQuickView] = useState<IProduct | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters state initialized from query params
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [selectedSort, setSelectedSort] = useState<string>(
    searchParams.get('sort') || 'featured'
  );
  const [selectedSpecial, setSelectedSpecial] = useState<string>(
    searchParams.get('filter') || 'all'
  );
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/products/categories')
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products || []);
        if (catData.success) setCategories(catData.categories || []);
      } catch (err) {
        console.error('Error loading shop catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Sync URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSort !== 'featured') params.set('sort', selectedSort);
    if (selectedSpecial !== 'all') params.set('filter', selectedSpecial);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, selectedSort, selectedSpecial]);

  // Color options extracted dynamically from products
  const availableColors = useMemo(() => {
    const colorsMap = new Map<string, string>();
    products.forEach(p => {
      p.colors?.forEach(c => colorsMap.set(c.name, c.hex));
    });
    return Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category
        if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Special filter
        if (selectedSpecial === 'newArrival' && !p.newArrival) return false;
        if (selectedSpecial === 'bestseller' && !p.bestseller) return false;
        if (selectedSpecial === 'featured' && !p.featured) return false;

        // Search Query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchMat = p.material.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat && !matchMat) return false;
        }

        // Price
        const effectivePrice = p.salePrice || p.price;
        if (effectivePrice > maxPrice) return false;

        // Color
        if (selectedColor !== 'all') {
          const hasColor = p.colors?.some(c => c.name.toLowerCase() === selectedColor.toLowerCase());
          if (!hasColor) return false;
        }

        // Stock
        if (inStockOnly && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice || a.price;
        const priceB = b.salePrice || b.price;

        switch (selectedSort) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'price-asc':
            return priceA - priceB;
          case 'price-desc':
            return priceB - priceA;
          case 'rating':
            return b.rating - a.rating;
          case 'bestselling':
            return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
          case 'featured':
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [
    products,
    selectedCategory,
    selectedSpecial,
    searchQuery,
    maxPrice,
    selectedColor,
    inStockOnly,
    selectedSort
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedSort('featured');
    setSelectedSpecial('all');
    setMaxPrice(2000);
    setSelectedColor('all');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery !== '' ||
    selectedSpecial !== 'all' ||
    maxPrice < 2000 ||
    selectedColor !== 'all' ||
    inStockOnly;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title Section */}
        <div className="py-6 border-b border-neutral-850 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1 block">
              STREETWEAR ARCHIVE
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
              DEITY CAPS COLLECTION
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Showing {filteredProducts.length} caps engineered for modern street style
            </p>
          </div>

          {/* Quick Special Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecial('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedSpecial === 'all'
                  ? 'bg-amber-400 text-neutral-950'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
              }`}
            >
              All Drops
            </button>
            <button
              onClick={() => setSelectedSpecial('newArrival')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedSpecial === 'newArrival'
                  ? 'bg-amber-400 text-neutral-950'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setSelectedSpecial('bestseller')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedSpecial === 'bestseller'
                  ? 'bg-amber-400 text-neutral-950'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 mb-8">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, fabric, style..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Drawer Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <Filter className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium hidden md:inline">Sort by:</span>
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="bestselling">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="font-display font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  Filter Catalog
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-3">
                  Silhouette / Category
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>All Silhouettes</span>
                    <span className="text-[10px] opacity-75">{products.length}</span>
                  </button>
                  {categories.map(cat => {
                    const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                          selectedCategory.toLowerCase() === cat.name.toLowerCase()
                            ? 'bg-amber-400 text-neutral-950 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                    Max Price
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={2000}
                  step={50}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-neutral-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>₹500</span>
                  <span>₹2000</span>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="pt-4 border-t border-neutral-800">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-3">
                  Colorways
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedColor === 'all'
                        ? 'bg-white text-neutral-950 border-white font-bold'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    All
                  </button>
                  {availableColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        selectedColor.toLowerCase() === color.name.toLowerCase()
                          ? 'bg-neutral-800 text-white border-amber-400 shadow-sm'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                      }`}
                      title={color.name}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-neutral-600 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock toggle */}
              <div className="pt-4 border-t border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div
                    key={n}
                    className="aspect-square bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-neutral-850">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  No caps match your filters
                </h3>
                <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
                  Try clearing some filters or searching with a different term to explore our full Madurai streetwear drops.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onQuickView={p => setSelectedQuickView(p)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-y-0 right-0 max-w-full flex pl-10"
            >
              <div className="w-screen max-w-sm bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <h3 className="font-display font-bold text-base uppercase text-white">
                      Filter Catalog
                    </h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-2">
                      Categories
                    </label>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                          selectedCategory === 'all'
                            ? 'bg-amber-400 text-neutral-950 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        All Silhouettes
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat._id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                            selectedCategory.toLowerCase() === cat.name.toLowerCase()
                              ? 'bg-amber-400 text-neutral-950 font-bold'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                        Max Price
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">₹{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={2000}
                      step={50}
                      value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-amber-400 bg-neutral-800 h-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-800 flex gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedQuickView}
        isOpen={Boolean(selectedQuickView)}
        onClose={() => setSelectedQuickView(null)}
      />
    </div>
  );
};
