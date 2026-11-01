import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

// Get All Products with search, filtering, and sorting
router.get('/', (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      color,
      sort,
      featured,
      bestseller,
      newArrival,
      page = '1',
      limit = '12'
    } = req.query;

    let products = db.products.find();

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.features.some(f => f.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'All' && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Price filters
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => (p.salePrice || p.price) >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => (p.salePrice || p.price) <= max);
      }
    }

    // Color filter
    if (color && typeof color === 'string') {
      products = products.filter(p =>
        p.colors.some(c => c.name.toLowerCase().includes(color.toLowerCase()))
      );
    }

    // Flags
    if (featured === 'true') {
      products = products.filter(p => p.featured);
    }
    if (bestseller === 'true') {
      products = products.filter(p => p.bestseller);
    }
    if (newArrival === 'true') {
      products = products.filter(p => p.newArrival);
    }

    // Sorting
    switch (sort) {
      case 'price-low':
        products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestseller':
        products.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
      case 'featured':
      default:
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    const total = products.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      products: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve caps catalog.' });
  }
});

// Search live suggestions
router.get('/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.json({ success: true, suggestions: [] });
  }

  const query = q.toLowerCase().trim();
  const matchedProducts = db.products.find(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  ).slice(0, 6);

  const matchedCategories = db.categories.find().filter(c =>
    c.name.toLowerCase().includes(query)
  ).map(c => ({ type: 'category', name: c.name, slug: c.slug }));

  return res.json({
    success: true,
    suggestions: [
      ...matchedProducts.map(p => ({
        type: 'product',
        id: p._id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        price: p.salePrice || p.price,
        image: p.images[0]
      })),
      ...matchedCategories
    ]
  });
});

// Get Categories
router.get('/categories', (req, res) => {
  const categories = db.categories.find().map(cat => {
    const count = db.products.find(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
    return { ...cat, itemCount: count };
  });
  return res.json({ success: true, categories });
});

// Get Single Product by ID or Slug
router.get('/:id', (req, res) => {
  const product = db.products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Cap not found in catalog.' });
  }

  // Get approved reviews for this product
  const reviews = db.reviews.find(r => r.product === product._id && r.status === 'approved');

  return res.json({
    success: true,
    product: {
      ...product,
      reviews
    }
  });
});

// Get Related / Recommended Products
router.get('/related/:id', (req, res) => {
  const current = db.products.findById(req.params.id);
  let related = db.products.find(p => p._id !== req.params.id);

  if (current) {
    // Prioritize same category
    related.sort((a, b) => {
      const aSame = a.category === current.category ? 1 : 0;
      const bSame = b.category === current.category ? 1 : 0;
      return bSame - aSame;
    });
  }

  return res.json({
    success: true,
    products: related.slice(0, 4)
  });
});

export default router;
