import { Router } from 'express';
import { db } from '../db.ts';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';
import type { ICartItem } from '../types.ts';

const router = Router();

// All cart endpoints require user authentication (guest carts are handled in frontend localStorage)
router.use(authenticate);

// Get User Cart
router.get('/', (req: AuthRequest, res) => {
  try {
    const items = db.carts.get(req.user!._id);
    // Refresh product info in case prices or stock changed
    const freshItems: ICartItem[] = items.map(item => {
      const prod = db.products.findById(item.productId);
      return prod ? { ...item, product: prod } : item;
    }).filter(item => Boolean(item.product));

    db.carts.set(req.user!._id, freshItems);
    return res.json({ success: true, items: freshItems });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
});

// Add Item to Cart
router.post('/', (req: AuthRequest, res) => {
  try {
    const { productId, quantity = 1, selectedColor, selectedVariant } = req.body;
    const product = db.products.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units remaining in stock.`
      });
    }

    const items = db.carts.get(req.user!._id);
    const existingIndex = items.findIndex(
      item =>
        item.productId === productId &&
        item.selectedColor === selectedColor &&
        item.selectedVariant === selectedVariant
    );

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Max stock available is ${product.stock}.`
        });
      }
      items[existingIndex].quantity = newQty;
    } else {
      const newItem: ICartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId,
        product,
        quantity,
        selectedColor,
        selectedVariant
      };
      items.push(newItem);
    }

    db.carts.set(req.user!._id, items);
    return res.json({ success: true, items, message: 'Added to cart' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// Update Cart Item Quantity
router.put('/:itemId', (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const items = db.carts.get(req.user!._id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    const product = db.products.findById(items[itemIndex].productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot exceed available stock of ${product.stock} units.`
      });
    }

    items[itemIndex].quantity = quantity;
    db.carts.set(req.user!._id, items);

    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update item quantity.' });
  }
});

// Remove Item from Cart
router.delete('/:itemId', (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;
    let items = db.carts.get(req.user!._id);
    items = items.filter(i => i.id !== itemId);
    db.carts.set(req.user!._id, items);
    return res.json({ success: true, items, message: 'Item removed from cart.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
});

// Clear Entire Cart
router.delete('/', (req: AuthRequest, res) => {
  try {
    db.carts.set(req.user!._id, []);
    return res.json({ success: true, items: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

export default router;
