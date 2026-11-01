import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  Trash2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import type { IOrder, IAddress } from '../../types/index.ts';

export const UserAccount: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const { user, token, isAuthenticated, logout, updateProfile, addAddress, removeAddress, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Orders
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Address modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Tamil Nadu');
  const [newPincode, setNewPincode] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login');
      return;
    }

    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user, isAuthenticated, token]);

  // Fetch orders
  useEffect(() => {
    if (activeTab === 'orders' && token) {
      setIsLoadingOrders(true);
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrders(data.orders || []);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingOrders(false));
    }
  }, [activeTab, token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({ name, phone });
    setIsSavingProfile(false);
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity || !newPincode) {
      showToast('Please fill out all address fields.', 'error');
      return;
    }

    const success = await addAddress({
      fullName: newFullName,
      phone: newPhone || phone,
      street: newStreet,
      city: newCity,
      state: newState,
      pincode: newPincode,
      isDefault: (user?.addresses?.length || 0) === 0
    });

    if (success) {
      setIsAddressModalOpen(false);
      setNewStreet('');
      setNewCity('');
      setNewPincode('');
    }
  };

  const statusSteps = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="py-8 border-b border-neutral-850 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover bg-neutral-900 border-2 border-neutral-800"
            />
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                DEITY MEMBER ACCOUNT
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {user?.name || 'Streetwear Fan'}
              </h1>
              <p className="text-neutral-400 text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-4 py-2.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold uppercase tracking-wider hover:bg-amber-400/30 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-850 mb-8 overflow-x-auto">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
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

        {/* TAB 1: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-neutral-900/60 border border-neutral-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Personal Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-neutral-950/50 border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98400 00000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {isLoadingOrders ? (
              <div className="p-12 text-center text-neutral-400">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-neutral-900/40 border border-neutral-850 max-w-lg mx-auto">
                <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h4 className="font-display font-bold text-lg text-white mb-1">No orders yet</h4>
                <p className="text-neutral-400 text-xs mb-6">
                  You haven't placed an order with DEITY CAPS yet.
                </p>
                <Link
                  to="/shop"
                  className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl inline-block"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              orders.map(order => {
                const currentStepIdx = getStatusIndex(order.orderStatus);
                return (
                  <div
                    key={order._id}
                    className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-850 space-y-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : order.orderStatus === 'Cancelled'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-neutral-400">Total Amount</span>
                        <p className="font-mono font-bold text-base text-white">₹{order.total}</p>
                      </div>
                    </div>

                    {/* Progress Bar / Stepper */}
                    {order.orderStatus !== 'Cancelled' && (
                      <div className="py-2">
                        <div className="grid grid-cols-6 text-center text-[10px] font-bold uppercase tracking-wider mb-2">
                          {statusSteps.map((step, idx) => (
                            <span
                              key={step}
                              className={idx <= currentStepIdx ? 'text-amber-400' : 'text-neutral-600'}
                            >
                              {step}
                            </span>
                          ))}
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${((currentStepIdx + 1) / statusSteps.length) * 100}%`
                            }}
                          />
                        </div>
                        {order.trackingNumber && (
                          <div className="mt-2 text-xs text-neutral-400 flex items-center justify-between">
                            <span>Courier Tracking: <strong className="text-white font-mono">{order.trackingNumber}</strong></span>
                            <span>Est: {order.estimatedDelivery || '3-5 Days'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ordered Items List */}
                    <div className="space-y-3 pt-2">
                      {order.products?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-neutral-950/60 border border-neutral-850">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-neutral-800"
                            />
                            <div>
                              <strong className="text-white block">{item.name}</strong>
                              <span className="text-neutral-500 text-[11px]">
                                {item.color} • {item.variant} • Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-white">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                Saved Delivery Addresses
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.addresses && user.addresses.length > 0 ? (
                user.addresses.map(addr => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex flex-col justify-between"
                  >
                    <div className="space-y-1 text-xs text-neutral-300">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-sm block">{addr.fullName}</strong>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-neutral-500 pt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-800 flex justify-end">
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-12 text-center rounded-2xl bg-neutral-900/30 border border-neutral-850 text-neutral-400 text-xs">
                  No delivery addresses saved yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-lg text-white uppercase">
              Add Delivery Address
            </h3>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={e => setNewStreet(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPincode}
                    onChange={e => setNewPincode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold uppercase"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
