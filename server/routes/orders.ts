import { Router } from 'express';
import { db } from '../db.ts';
import { authenticate, optionalAuth, type AuthRequest } from '../middleware/auth.ts';
import type { IOrder, IOrderItem } from '../types.ts';

const router = Router();

// Validate and Apply Coupon
router.post('/validate-coupon', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const coupon = db.coupons.findByCode(code);
    if (!coupon || !coupon.active) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive promo code.' });
    }

    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'This promo code has expired.' });
    }

    if (subtotal < coupon.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minimumOrder} required for coupon ${coupon.code}.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return res.json({
      success: true,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message: `Coupon ${coupon.code} applied! You saved ₹${discountAmount}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
});

// Create Order (Guest or Logged-in Customer)
router.post('/', optionalAuth, (req: AuthRequest, res) => {
  try {
    const {
      products,
      shippingAddress,
      couponCode,
      paymentMethod = 'UPI / Online Card',
      customerName,
      customerEmail,
      customerPhone
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty when placing an order.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    // Verify stock and calculate real subtotal
    let subtotal = 0;
    const verifiedOrderItems: IOrderItem[] = [];

    for (const item of products) {
      const product = db.products.findById(item.product || item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.name}" no longer available.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} units left.`
        });
      }

      const itemPrice = product.salePrice || product.price;
      subtotal += itemPrice * item.quantity;

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: itemPrice,
        quantity: item.quantity,
        color: item.color || item.selectedColor,
        variant: item.variant || item.selectedVariant
      });
    }

    // Calculate discount if coupon provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = db.coupons.findByCode(couponCode);
      if (coupon && coupon.active && subtotal >= coupon.minimumOrder) {
        appliedCoupon = coupon;
        if (coupon.discountType === 'percentage') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        db.coupons.update(coupon._id, { usageCount: coupon.usageCount + 1 });
      }
    }

    // Delivery fee rule: Free delivery above ₹999, else ₹99
    const deliveryFee = subtotal >= 999 ? 0 : 99;
    const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

    // DECREMENT INVENTORY AUTOMATICALLY (Requirement 19)
    for (const item of verifiedOrderItems) {
      const product = db.products.findById(item.product);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        db.products.update(product._id, { stock: newStock });
      }
    }

    const orderNumber = `DC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = req.user?._id || 'guest';
    const email = req.user?.email || customerEmail || shippingAddress.phone + '@guest.deitycaps.com';
    const name = req.user?.name || customerName || shippingAddress.fullName;
    const phone = req.user?.phone || customerPhone || shippingAddress.phone;

    // Delivery ETA: 3 to 5 business days
    const etaDate = new Date(Date.now() + 4 * 86400000);
    const etaFormatted = `Estimated by ${etaDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;

    const newOrder: IOrder = db.orders.create({
      orderNumber,
      user: userId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      products: verifiedOrderItems,
      shippingAddress,
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      deliveryFee,
      total: finalTotal,
      paymentMethod,
       paymentStatus: 'pending',
       orderStatus: 'Pending',
      paymentId: `pay_mock_${Date.now()}`,
      trackingNumber: `DEITY-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: etaFormatted
    });

    // Clear cart if logged in
    if (req.user) {
      db.carts.set(req.user._id, []);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Welcome to the DEITY movement.',
      order: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process order.' });
  }
});

// Get User's Orders
router.get('/my-orders', authenticate, (req: AuthRequest, res) => {
  try {
    const orders = db.orders.find(o => o.user === req.user!._id || o.customerEmail === req.user!.email);
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user orders.' });
  }
});

// Get Single Order by ID or Order Number
router.get('/:id', optionalAuth, (req: AuthRequest, res) => {
  try {
    const order = db.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Allow user who placed the order or admin
    if (req.user && req.user.role !== 'admin' && order.user !== req.user._id && order.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
});

// Mark order as paid (pending admin verification)
router.post('/:id/pay', optionalAuth, (req: AuthRequest, res) => {
  try {
    let order = db.orders.findById(req.params.id);
    if (!order) {
      const all = db.orders.find(o => o.orderNumber === req.params.id);
      order = all[0];
    }
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const updated = db.orders.update(order._id, { paymentStatus: 'pending', orderStatus: 'Pending' });
    return res.json({ success: true, order: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process payment.' });
  }
});

export default router;
