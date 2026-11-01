import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, authenticate, type AuthRequest } from '../middleware/auth.ts';
import type { IAddress } from '../types.ts';

const router = Router();

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existing = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.users.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      addresses: [],
      wishlist: [],
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=171717&textColor=ffffff`
    });

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPass } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to DEITY CAPS.',
      token,
      user: userWithoutPass
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
});

// Customer & General Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPass } = user;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userWithoutPass
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// Admin-Specific Login (Strict role check)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin credentials required.' });
    }

    const user = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This account does not possess administrator privileges.'
      });
    }

    const token = generateToken(user);
    const { password: _, ...adminWithoutPass } = user;

    return res.json({
      success: true,
      message: 'Admin authorization granted. Welcome back, Commander.',
      token,
      user: adminWithoutPass
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Admin login processing error.' });
  }
});

// Google OAuth Login & Registration
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Google profile information missing.' });
    }

    let user = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new customer account from Google OAuth
      user = db.users.create({
        name,
        email: email.toLowerCase(),
        googleId: googleId || `goog_${Date.now()}`,
        role: 'customer',
        profileImage: profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=171717&textColor=ffffff`,
        addresses: [],
        wishlist: []
      });
    } else if (googleId && !user.googleId) {
      // Link Google ID if not yet linked
      user = db.users.update(user._id, {
        googleId,
        profileImage: user.profileImage || profileImage
      }) || user;
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPass } = user;

    return res.json({
      success: true,
      message: `Signed in with Google as ${user.name}`,
      token,
      user: userWithoutPass
    });
  } catch (err: any) {
    console.error('Google Auth error:', err);
    return res.status(500).json({ success: false, message: 'Failed to authenticate with Google.' });
  }
});

// Get Current Logged-in User
router.get('/me', authenticate, (req: AuthRequest, res) => {
  const { password: _, ...userWithoutPass } = req.user!;
  return res.json({ success: true, user: userWithoutPass });
});

// Update Profile
router.put('/profile', authenticate, (req: AuthRequest, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const updated = db.users.update(req.user!._id, {
      name: name ?? req.user!.name,
      phone: phone ?? req.user!.phone,
      profileImage: profileImage ?? req.user!.profileImage
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { password: _, ...userWithoutPass } = updated;
    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userWithoutPass
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Manage Saved Addresses
router.post('/addresses', authenticate, (req: AuthRequest, res) => {
  try {
    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All address fields are required.' });
    }

    const newAddress: IAddress = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: Boolean(isDefault)
    };

    let addresses = req.user!.addresses || [];
    if (newAddress.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);

    const updated = db.users.update(req.user!._id, { addresses });
    return res.json({ success: true, addresses: updated?.addresses, message: 'Address saved!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add address.' });
  }
});

router.delete('/addresses/:id', authenticate, (req: AuthRequest, res) => {
  try {
    const addresses = (req.user!.addresses || []).filter(a => a.id !== req.params.id);
    const updated = db.users.update(req.user!._id, { addresses });
    return res.json({ success: true, addresses: updated?.addresses, message: 'Address removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove address.' });
  }
});

// Wishlist Management
router.get('/wishlist', authenticate, (req: AuthRequest, res) => {
  try {
    const wishlistIds = req.user!.wishlist || [];
    const products = db.products.find(p => wishlistIds.includes(p._id));
    return res.json({ success: true, wishlist: products, ids: wishlistIds });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

router.post('/wishlist/:productId', authenticate, (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;
    let wishlist = req.user!.wishlist || [];
    const exists = wishlist.includes(productId);

    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }

    const updated = db.users.update(req.user!._id, { wishlist });
    const products = db.products.find(p => (updated?.wishlist || []).includes(p._id));

    return res.json({
      success: true,
      action: exists ? 'removed' : 'added',
      message: exists ? 'Removed from wishlist' : 'Added to wishlist',
      ids: updated?.wishlist || [],
      wishlist: products
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
});

export default router;
