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
  role: 'customer' | 'admin';
  profileImage?: string;
  phone?: string;
  addresses: IAddress[];
  wishlist: string[];
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
  discount?: number;
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
  reviews?: IReview[];
  createdAt: string;
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

export interface IOrderItem {
  product: string;
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
  user: string;
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
  user: string;
  userName: string;
  product: string;
  productName?: string;
  productImage?: string;
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

export interface IAdminStats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface IChartData {
  salesOverTime: { date: string; sales: number; orders: number }[];
  categoryPerformance: { category: string; sold: number; revenue: number }[];
  bestSelling: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    unitsSold: number;
  }[];
}
