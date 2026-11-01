import { Router } from 'express';
import { db } from '../db.ts';
import { authenticate, type AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get reviews for a product
router.get('/product/:productId', (req, res) => {
  try {
    const reviews = db.reviews.find(
      r => r.product === req.params.productId && r.status === 'approved'
    );
    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// Submit a Review (Customer authenticated)
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating (1-5), and comment are required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    const product = db.products.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const newReview = db.reviews.create({
      user: req.user!._id,
      userName: req.user!.name,
      product: product._id,
      rating: numRating,
      comment: comment.trim(),
      status: 'approved' // auto-approve verified customer reviews
    });

    // Update product average rating & review count
    const allProdReviews = db.reviews.find(r => r.product === product._id && r.status === 'approved');
    const avgRating = Number(
      (allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length).toFixed(1)
    );

    db.products.update(product._id, {
      rating: avgRating,
      reviewCount: allProdReviews.length
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review: newReview
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to post review.' });
  }
});

export default router;
