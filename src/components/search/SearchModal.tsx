import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Sparkles, Tag } from 'lucide-react';
import type { IProduct } from '../../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const popularTags = ['Snapback', 'Shadow Black', 'Vintage Wash', 'Trucker', 'Dad Caps', 'Merino Wool'];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSuggestions([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectTag = (tag: string) => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };

  const handleSelectProduct = (item: any) => {
    onClose();
    if (item.type === 'category') {
      navigate(`/shop?category=${encodeURIComponent(item.name)}`);
    } else {
      navigate(`/product/${item.slug || item.id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header & Search Input */}
          <form onSubmit={handleSubmit} className="relative flex items-center border-b border-neutral-800 px-4 py-3 sm:py-4">
            <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search caps by name, fit, material, or style..."
              className="w-full bg-transparent text-white placeholder-neutral-500 text-base sm:text-lg focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-neutral-400 hover:text-white mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs uppercase tracking-wider font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              ESC
            </button>
          </form>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Suggestions */}
            {suggestions.length > 0 ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Matching Results ({suggestions.length})
                </div>
                <div className="space-y-2">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectProduct(item)}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-neutral-800/80 cursor-pointer transition-colors group"
                    >
                      {item.type === 'product' ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0 border border-neutral-700/50"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-semibold truncate group-hover:text-amber-400 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-xs text-neutral-400">{item.category}</p>
                          </div>
                          <div className="text-sm font-bold text-white shrink-0">
                            ₹{item.price}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium">
                              Category: <span className="font-bold text-amber-400">{item.name}</span>
                            </h4>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-800 mt-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    View all results for "{query}"
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : query.length >= 2 && !isLoading ? (
              <div className="text-center py-8">
                <p className="text-neutral-400 text-sm">No caps found matching "{query}".</p>
                <p className="text-xs text-neutral-500 mt-1">Try searching for "snapback", "black", or "vintage".</p>
              </div>
            ) : (
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
                  Trending Streetwear Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700/50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">Enter</kbd> to search</span>
                  <span>Direct delivery across India from Madurai</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
