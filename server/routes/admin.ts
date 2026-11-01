import { Router } from 'express';
import { db } from '../db.ts';
import { requireAdmin, type AuthRequest } from '../middleware/auth.ts';
import type { IProduct, ICoupon } from '../types.ts';

const router = Router();

// Protect ALL admin routes with requireAdmin middleware
router.use(requireAdmin);

// 1. Dashboard Stats & Analytics
router.get('/stats', (req: AuthRequest, res) => {
  try {
    const orders = db.orders.find();
    const products = db.products.find();
    const customers = db.users.find(u => u.role === 'customer');

    const totalSales = orders.reduce((sum, o) => (o.paymentStatus === 'completed' ? sum + o.total : sum), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = orders
      .filter(o => new Date(o.createdAt) >= today && o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    // Sales over last 7 days chart data
    const salesOverTime: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate >= d && oDate < nextD;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => (o.paymentStatus === 'completed' ? sum + o.total : sum), 0);

      salesOverTime.push({
        date: dayStr,
        sales: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Category performance
    const categoryCounts: Record<string, { count: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.products) {
        const prod = products.find(p => p._id === item.product);
        const cat = prod?.category || 'Streetwear';
        if (!categoryCounts[cat]) {
          categoryCounts[cat] = { count: 0, revenue: 0 };
        }
        categoryCounts[cat].count += item.quantity;
        categoryCounts[cat].revenue += item.price * item.quantity;
      }
    }

    const categoryPerformance = Object.entries(categoryCounts).map(([category, data]) => ({
      category,
      sold: data.count,
      revenue: data.revenue
    }));

    // Best selling products
    const productSalesMap: Record<string, number> = {};
    orders.forEach(o => {
      o.products.forEach(p => {
        productSalesMap[p.product] = (productSalesMap[p.product] || 0) + p.quantity;
      });
    });

    const bestSelling = products
      .map(p => ({
        _id: p._id,
        name: p.name,
        price: p.salePrice || p.price,
        image: p.images[0],
        category: p.category,
        stock: p.stock,
        unitsSold: productSalesMap[p._id] || (p.bestseller ? 25 : 8)
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders,
        pendingOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        outOfStockProducts
      },
      charts: {
        salesOverTime,
        categoryPerformance,
        bestSelling
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate admin statistics.' });
  }
});

// 2. Products CRUD
router.get('/products', (req: AuthRequest, res) => {
  const products = db.products.find();
  return res.json({ success: true, products });
});

router.post('/products', (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      category,
      images,
      price,
      salePrice,
      colors,
      variants,
      stock,
      sku,
      featured = false,
      bestseller = false,
      newArrival = true,
      material,
      features,
      closureType
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    }

    const calculatedDiscount = salePrice && price > salePrice
      ? Math.round(((price - salePrice) / price) * 100)
      : undefined;

    const newProduct = db.products.create({
      name,
      description: description || 'Premium DEITY streetwear headwear.',
      category,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85'
      ],
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      discount: calculatedDiscount,
      colors: colors || [{ name: 'Black', hex: '#0a0a0a' }],
      variants: variants || [{ size: 'One Size Adjustable', stock: Number(stock) || 20, sku: sku || `DC-${Date.now()}` }],
      stock: Number(stock) || 20,
      sku: sku || `DC-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: 5.0,
      reviewCount: 0,
      featured: Boolean(featured),
      bestseller: Boolean(bestseller),
      newArrival: Boolean(newArrival),
      material: material || '100% Heavy Cotton Twill',
      features: Array.isArray(features) ? features : ['Embroidered emblem', 'Pre-curved visor', 'Brass buckle closure'],
      closureType: closureType || 'Adjustable Slider'
    });

    return res.status(201).json({ success: true, product: newProduct, message: 'Cap created and published!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

router.put('/products/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = db.products.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updates: Partial<IProduct> = { ...req.body };
    if (updates.price && updates.salePrice) {
      updates.discount = Math.round(((updates.price - updates.salePrice) / updates.price) * 100);
    }

    const updated = db.products.update(existing._id, updates);
    return res.json({ success: true, product: updated, message: 'Product updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

router.delete('/products/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deleted = db.products.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, message: 'Product removed from store.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// 3. Inventory Management
router.get('/inventory', (req: AuthRequest, res) => {
  const products = db.products.find();
  const orders = db.orders.find();

  const inventoryList = products.map(p => {
    let sold = 0;
    orders.forEach(o => {
      o.products.forEach(item => {
        if (item.product === p._id) sold += item.quantity;
      });
    });

    let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (p.stock === 0) stockStatus = 'Out of Stock';
    else if (p.stock <= 10) stockStatus = 'Low Stock';

    return {
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.salePrice || p.price,
      stock: p.stock,
      soldQuantity: sold,
      stockStatus,
      image: p.images[0]
    };
  });

  return res.json({ success: true, inventory: inventoryList });
});

router.put('/inventory/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock count required.' });
    }

    const updated = db.products.update(id, { stock });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({ success: true, product: updated, message: `Stock updated to ${stock} units.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
});

// 4. Order Management
router.get('/orders', (req: AuthRequest, res) => {
  const { status, search } = req.query;
  let orders = db.orders.find();

  if (status && typeof status === 'string' && status !== 'All') {
    orders = orders.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.shippingAddress.city.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, orders });
});

router.put('/orders/:id/status', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
    }

    const updates: any = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (trackingNumber) updates.trackingNumber = trackingNumber;

    const updated = db.orders.update(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      order: updated,
      message: `Order status advanced to "${updated.orderStatus}"`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// 5. Customer Management
router.get('/customers', (req: AuthRequest, res) => {
  const customers = db.users.find(u => u.role === 'customer');
  const orders = db.orders.find();

  const customerList = customers.map(c => {
    const customerOrders = orders.filter(o => o.user === c._id || o.customerEmail === c.email);
    const totalSpent = customerOrders.reduce((sum, o) => (o.paymentStatus === 'completed' ? sum + o.total : sum), 0);

    return {
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone || c.addresses[0]?.phone || 'Not provided',
      registrationDate: c.createdAt,
      orderCount: customerOrders.length,
      totalSpent,
      city: c.addresses[0]?.city || 'N/A',
      status: 'Active'
    };
  });

  return res.json({ success: true, customers: customerList });
});

// 6. Coupon Management
router.get('/coupons', (req: AuthRequest, res) => {
  const coupons = db.coupons.find();
  return res.json({ success: true, coupons });
});

router.post('/coupons', (req: AuthRequest, res) => {
  try {
    const { code, discountType, discountValue, minimumOrder, expiryDate, description } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code, type, and value required.' });
    }

    const existing = db.coupons.findByCode(code);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    const newCoupon = db.coupons.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 0,
      expiryDate: expiryDate || '2026-12-31T23:59:59.000Z',
      active: true,
      description: description || `${discountValue}${discountType === 'percentage' ? '%' : '₹'} off`
    });

    return res.status(201).json({ success: true, coupon: newCoupon, message: 'Coupon created!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
});

router.put('/coupons/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updated = db.coupons.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    return res.json({ success: true, coupon: updated, message: 'Coupon updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

router.delete('/coupons/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deleted = db.coupons.delete(id);
    return res.json({ success: true, deleted, message: 'Coupon deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

// 7. Reviews Moderation
router.get('/reviews', (req: AuthRequest, res) => {
  const reviews = db.reviews.find();
  const products = db.products.find();

  const populatedReviews = reviews.map(r => {
    const prod = products.find(p => p._id === r.product);
    return {
      ...r,
      productName: prod?.name || 'Unknown Cap',
      productImage: prod?.images[0]
    };
  });

  return res.json({ success: true, reviews: populatedReviews });
});

router.put('/reviews/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.reviews.update(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    return res.json({ success: true, review: updated, message: `Review marked as ${status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

router.delete('/reviews/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deleted = db.reviews.delete(id);
    return res.json({ success: true, deleted, message: 'Review deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove review.' });
  }
});

// 8. Categories
router.post('/categories', (req: AuthRequest, res) => {
  try {
    const { name, image, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name required.' });
    }
    const cat = db.categories.create({
      name,
      image: image || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      description: description || ''
    });
    return res.status(201).json({ success: true, category: cat, message: 'Category created!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

export default router;
