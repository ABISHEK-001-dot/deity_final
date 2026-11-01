import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Mail,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { IProduct, IOrder, ICoupon } from '../../types/index.ts';

export const AdminDashboard: React.FC = () => {
  const { user, token, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'inquiries'>('products');

  // Data states
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search
  const [productSearch, setProductSearch] = useState('');

  // Add Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newCapName, setNewCapName] = useState('');
  const [newCapCategory, setNewCapCategory] = useState('Snapback');
  const [newCapPrice, setNewCapPrice] = useState(1499);
  const [newCapSalePrice, setNewCapSalePrice] = useState(1299);
  const [newCapStock, setNewCapStock] = useState(40);
  const [newCapMaterial, setNewCapMaterial] = useState('380 GSM Japanese Heavy Cotton Twill');
  const [newCapImage, setNewCapImage] = useState('https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80');
  const [newCapDescription, setNewCapDescription] = useState('Streetwear drop engineered with heavy-density twill and 3D puff embroidery.');

  // Create Coupon Modal
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(20);
  const [couponMinOrder, setCouponMinOrder] = useState(1499);

  // Database Status
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    fetchAdminData();
    fetch('/api/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg.database) setDbStatus(cfg.database);
      })
      .catch(() => {});
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch products
      const pRes = await fetch('/api/products?limit=100');
      const pData = await pRes.json();
      if (pData.success) setProducts(pData.products || []);

      // Fetch orders
       const oRes = await fetch('/api/admin/orders', { headers });
      const oData = await oRes.json();
      if (oData.success) setOrders(oData.orders || []);

      // Fetch coupons
      const cRes = await fetch('/api/coupons', { headers });
      const cData = await cRes.json();
      if (cData.success) setCoupons(cData.coupons || []);

      // Fetch inquiries
      const iRes = await fetch('/api/contact', { headers });
      const iData = await iRes.json();
      if (iData.success) setInquiries(iData.inquiries || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCapName,
        category: newCapCategory,
        price: Number(newCapPrice),
        salePrice: newCapSalePrice ? Number(newCapSalePrice) : undefined,
        stock: Number(newCapStock),
        material: newCapMaterial,
        images: [newCapImage],
        description: newCapDescription,
        closureType: 'Plastic Snapback / Metallic Buckle',
        featured: true,
        newArrival: true,
        colors: [{ name: 'Deep Black', hex: '#0a0a0a' }],
        variants: [{ size: 'One Size (Adjustable)', stock: Number(newCapStock) }]
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast('New cap drop published to catalog!', 'success');
        setIsAddProductOpen(false);
        fetchAdminData();
      } else {
        showToast(data.message || 'Failed to publish cap.', 'error');
      }
    } catch (err) {
      showToast('Error creating product.', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this cap from the active drop?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Cap removed from store.', 'info');
        setProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete cap.', 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: status, paymentStatus: status === 'Confirmed' ? 'completed' : undefined })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status updated to ${status}`, 'success');
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, orderStatus: status as any } : o))
        );
      }
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase().trim(),
          discountType: 'percentage',
          discountValue: Number(couponDiscount),
          minOrderValue: Number(couponMinOrder),
          isActive: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Coupon activated!', 'success');
        setIsAddCouponOpen(false);
        setCouponCode('');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to create coupon.', 'error');
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingFulfillment = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="py-6 border-b border-neutral-850 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                DEITY ADMIN COMMAND CENTER
              </span>
              {dbStatus && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wide uppercase border ${
                  dbStatus.mongoConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  {dbStatus.mongoConnected ? 'MongoDB Atlas Connected' : 'Local Data Storage'}
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Store & Factory Operations
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-2">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              Total Gross Revenue
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-black text-2xl text-white">₹{totalRevenue}</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                Live
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-2">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              Orders In Fulfillment
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-black text-2xl text-amber-400">
                {pendingFulfillment}
              </span>
              <span className="text-xs text-neutral-400 font-mono">Total {orders.length}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-2">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              Live Cap Catalog
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-black text-2xl text-white">{products.length}</span>
              <span className="text-xs text-neutral-400">Silhouettes</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-2">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              B2B Factory Leads
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-black text-2xl text-white">{inquiries.length}</span>
              <span className="text-xs text-amber-400">Inquiries</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-neutral-850 mb-8 overflow-x-auto">
          {[
            { id: 'products', label: `Cap Catalog (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'coupons', label: `Promo Codes (${coupons.length})`, icon: Tag },
            { id: 'inquiries', label: `B2B Inquiries (${inquiries.length})`, icon: Mail },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Filter caps by name or category..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add New Cap Drop
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-850 bg-neutral-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-850">
                  <tr>
                    <th className="p-4">Cap</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {products
                    .filter(
                      p =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(productSearch.toLowerCase())
                    )
                    .map(product => (
                      <tr key={product._id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-950 border border-neutral-800"
                            />
                            <div>
                              <strong className="text-white block truncate max-w-xs">
                                {product.name}
                              </strong>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-amber-400">{product.category}</td>
                        <td className="p-4 font-mono font-bold text-white">
                          ₹{product.salePrice || product.price}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-mono font-bold ${
                              product.stock < 10 ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Remove Cap"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-neutral-850 bg-neutral-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-850">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4">Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <strong className="text-white block">{order.customerName}</strong>
                        <span className="text-[11px] text-neutral-500">{order.customerEmail}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">
                        ₹{order.total}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[11px] uppercase bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                           <option value="Pending">Pending</option>
                           <option value="Confirmed">Confirmed</option>
                           <option value="Dispatched">Dispatched</option>
                           <option value="Shipped">Shipped</option>
                           <option value="Delivered">Delivered</option>
                           <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-[11px] text-neutral-400">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">
                Active discount codes for retail customers
              </span>
              <button
                onClick={() => setIsAddCouponOpen(true)}
                className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Promo Code
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div
                  key={coupon._id}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-white bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-xl">
                      {coupon.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        coupon.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    <strong className="text-amber-400">{coupon.discountValue}% OFF</strong> on orders above ₹{coupon.minOrderValue}
                  </p>

                  <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800">
                    Usage count: {coupon.usedCount || 0} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-850 text-neutral-400 text-xs">
                No factory or B2B inquiries received yet.
              </div>
            ) : (
              inquiries.map((inq, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-white block">{inq.name}</span>
                      <span className="text-xs text-neutral-400">
                        {inq.email} • {inq.phone || 'No phone'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
                      {inq.type === 'custom_bulk_order' ? `Bulk Order (${inq.quantity || 50}+ Units)` : 'General Support'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                    {inq.message}
                  </p>

                  <span className="text-[10px] text-neutral-500 block">
                    Received: {new Date(inq.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-black text-xl text-white uppercase">
              Add New Cap To Catalog
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Cap Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCapName}
                  onChange={e => setNewCapName(e.target.value)}
                  placeholder="e.g. DEITY CHALK PUFF SNAPBACK"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={newCapCategory}
                    onChange={e => setNewCapCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Snapback">Snapback</option>
                    <option value="Trucker Caps">Trucker Caps</option>
                    <option value="Dad Caps">Dad Caps</option>
                    <option value="Fitted Caps">Fitted Caps</option>
                    <option value="Beanies">Beanies</option>
                    <option value="Premium Collection">Premium Collection</option>
                    <option value="Limited Edition">Limited Edition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={newCapStock}
                    onChange={e => setNewCapStock(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newCapPrice}
                    onChange={e => setNewCapPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newCapSalePrice}
                    onChange={e => setNewCapSalePrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={newCapImage}
                  onChange={e => setNewCapImage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Fabric & Material Description
                </label>
                <input
                  type="text"
                  value={newCapMaterial}
                  onChange={e => setNewCapMaterial(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={newCapDescription}
                  onChange={e => setNewCapDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-3 bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold uppercase"
                >
                  Publish Drop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-black text-lg text-white uppercase">
              New Promo Code
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STREET25"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  required
                  value={couponDiscount}
                  onChange={e => setCouponDiscount(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Minimum Order (₹)
                </label>
                <input
                  type="number"
                  required
                  value={couponMinOrder}
                  onChange={e => setCouponMinOrder(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold uppercase"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
