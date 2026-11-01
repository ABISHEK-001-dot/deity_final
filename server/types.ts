export interface IAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: 'customer' | 'admin';
  profileImage?: string;
  phone?: string;
  addresses: IAddress[];
  wishlist: string[]; // Product IDs
  createdAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  salePrice?: number;
  discount?: number; // percentage
  colors: { name: string; hex: string }[];
  variants: { size: string; stock: number; sku: string }[];
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  material: string;
  features: string[];
  closureType: string;
  customizable?: boolean;
  createdAt: string;
}

export interface IOrderItem {
  product: string; // Product ID
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  color?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string; // User ID or guest email
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: IOrderItem[];
  shippingAddress: IAddress;
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  user: string; // User ID
  userName: string;
  product: string; // Product ID
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
  description: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount?: number;
}

export interface ICartItem {
  id: string;
  productId: string;
  product: IProduct;
  quantity: number;
  selectedColor?: string;
  selectedVariant?: string;
}
