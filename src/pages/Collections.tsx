import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers, Shield, Factory } from 'lucide-react';

export const Collections: React.FC = () => {
  const navigate = useNavigate();

  const collections = [
    {
      id: 'street-essentials',
      title: 'Street Essentials',
      tagline: 'The daily rotation',
      description: 'Understated silhouettes engineered for heavy daily wear. Heavy cotton twill with reinforced internal stitching.',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
      badge: 'CORE DROP',
      filter: 'Snapback'
    },
    {
      id: 'premium-series',
      title: 'The Premium Series',
      tagline: '380 GSM Japanese Twill',
      description: 'Crafted with premium high-density fabric, metallic closure buckles, and raised 3D puff embroidery.',
      image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=80',
      badge: 'LUXURY STREET',
      filter: 'Premium Collection'
    },
    {
      id: 'limited-edition',
      title: 'Limited Edition Archival',
      tagline: 'Numbered production runs',
      description: 'Rare collaborations and limited-edition colorways produced in strictly capped batches of 100 units.',
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
      badge: 'ARCHIVAL RUN',
      filter: 'Limited Edition'
    },
    {
      id: 'summer-trucker',
      title: 'Summer Mesh Drop',
      tagline: 'Breathable airflow headwear',
      description: 'Cooling poly-mesh rear panels paired with reinforced front buckram. Built for heat, gigs, and road trips.',
      image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1000&q=80',
      badge: 'SUMMER SERIES',
      filter: 'Trucker Caps'
    },
    {
      id: 'everyday-caps',
      title: 'Everyday Dad Caps',
      tagline: 'Low-profile relaxed comfort',
      description: 'Unstructured crowns and pre-curved visors with soft garment-washed finishes for effortless fits.',
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=80',
      badge: 'RELAXED FIT',
      filter: 'Dad Caps'
    },
    {
      id: 'custom-advertising',
      title: 'Custom & Advertising Caps',
      tagline: 'Direct Madurai Factory Manufacturing',
      description: 'Need caps for college fests, corporate teams, or brand launches? We produce bulk custom embroidered headwear.',
      image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=80',
      badge: 'B2B & BULK',
      link: '/contact'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 border-b border-neutral-850 mb-12">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-amber-400 mb-2 block">
            CURATED CAPSULES
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase text-white tracking-tight">
            DEITY COLLECTIONS
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
            Each capsule represents an obsession with headwear geometry, fabric density, and Gen Z streetwear aesthetics.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map(col => (
            <div
              key={col.id}
              onClick={() => {
                if (col.link) {
                  navigate(col.link);
                } else {
                  navigate(`/shop?category=${encodeURIComponent(col.filter || '')}`);
                }
              }}
              className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-850 hover:border-neutral-700 cursor-pointer shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Aspect */}
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                <span className="absolute top-4 left-4 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/60 text-amber-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  {col.badge}
                </span>
              </div>

              {/* Details Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-400">{col.tagline}</span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white uppercase group-hover:text-amber-400 transition-colors mt-1">
                    {col.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed mt-2">
                    {col.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>EXPLORE CAPSULE</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
