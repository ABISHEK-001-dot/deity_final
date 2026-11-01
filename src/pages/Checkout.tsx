import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  CheckCircle2,
  Lock,
  Tag,
  ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

export const Checkout: React.FC = () => {
  const { items, subtotal, discount, deliveryFee, total, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  // Address
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [street, setStreet] = useState(defaultAddr?.street || '24, Streetwear Avenue, Anna Nagar');
  const [city, setCity] = useState(defaultAddr?.city || 'Chennai');
  const [state, setState] = useState(defaultAddr?.state || 'Tamil Nadu');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '600040');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'instant_test' | 'upi' | 'card' | 'cod'>('instant_test');
  const [upiId, setUpiId] = useState('streetwear@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('742');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-36 pb-20 text-center px-4">
        <h2 className="font-display font-black text-3xl text-white mb-2">Your Cart is Empty</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Add at least one cap to your cart before checking out.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl inline-block"
        >
          Explore Caps
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode.trim());
    setCouponCode('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !street || !city || !pincode) {
      showToast('Please complete all required shipping fields.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          fullName: customerName,
          phone: customerPhone,
          street,
          city,
          state,
          pincode
        },
         products: items.map(item => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.images[0],
          price: item.product.salePrice || item.product.price,
          quantity: item.quantity,
          variant: item.selectedVariant || 'Adjustable',
          color: item.selectedColor || 'Standard'
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethod === 'instant_test' ? 'Card / Instant' : paymentMethod.toUpperCase(),
        paymentStatus: 'completed'
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        clearCart();
        showToast('Order created. Proceed to payment.', 'success');
        navigate('/payment', { state: { order: data.order } });
      } else {
        showToast(data.message || 'Checkout failed.', 'error');
      }
    } catch (err) {
      showToast('Error processing checkout. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 border-b border-neutral-850 mb-8 flex items-center justify-between">
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to shopping
            </Link>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-tight">
              Express Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact info */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-4">
              <h2 className="font-display font-bold text-base text-white uppercase flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs font-black">
                  1
                </span>
                Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+91 98400 00000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Email Address (For Order Tracking) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-4">
              <h2 className="font-display font-bold text-base text-white uppercase flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs font-black">
                  2
                </span>
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Street Address / Flat / Floor *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="House / Flat No, Street name"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      placeholder="600001"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-4">
              <h2 className="font-display font-bold text-base text-white uppercase flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs font-black">
                  3
                </span>
                Payment Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Instant 1-Click Mode */}
                <div
                  onClick={() => setPaymentMethod('instant_test')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'instant_test'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'instant_test'}
                    onChange={() => setPaymentMethod('instant_test')}
                    className="mt-0.5 accent-amber-400"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-white mb-0.5">
                      Instant Verified Mode (Recommended)
                    </strong>
                    <p className="text-[11px] text-neutral-400">
                      Simulate 1-click test checkout with instant automated invoice.
                    </p>
                  </div>
                </div>

                {/* UPI QR */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-0.5 accent-amber-400"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-white mb-0.5 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-amber-400" /> UPI / QR Payment
                    </strong>
                    <p className="text-[11px] text-neutral-400">
                      GPay, PhonePe, Paytm, or BHIM UPI ID.
                    </p>
                  </div>
                </div>

                {/* Debit/Credit Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'card'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-0.5 accent-amber-400"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-white mb-0.5 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Credit / Debit Card
                    </strong>
                    <p className="text-[11px] text-neutral-400">
                      Visa, Mastercard, RuPay & Amex.
                    </p>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 accent-amber-400"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-white mb-0.5 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash on Delivery
                    </strong>
                    <p className="text-[11px] text-neutral-400">
                      Pay cash at doorstep upon cap delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-5 sticky top-28">
              <h3 className="font-display font-bold text-base text-white uppercase tracking-wider pb-3 border-b border-neutral-800">
                Order Summary ({items.length} items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map(item => {
                  const pPrice = item.product.salePrice || item.product.price;
                  return (
                    <div key={item.id} className="flex gap-3 text-xs">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-[11px] text-neutral-400">
                          {item.selectedColor} • {item.selectedVariant}
                        </p>
                        <p className="text-[11px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold font-mono text-white shrink-0">
                        ₹{pPrice * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Promo Coupon Form */}
              <div className="pt-3 border-t border-neutral-800">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <span className="text-emerald-400 font-medium">
                      Code <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discountAmount})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-white underline text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="pt-3 border-t border-neutral-800 space-y-2 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-mono text-white">
                    {deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-xl font-mono text-amber-400">₹{total}</span>
                </div>
              </div>

              {/* Complete Order CTA */}
              <button
                type="submit"
                id="place-order-btn"
                disabled={isProcessing}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-display font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
              >
                {isProcessing ? 'CONFIRMING ORDER...' : 'CONFIRM & PLACE ORDER'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                By placing your order you agree to DEITY CAPS 7-day exchange and delivery policies.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
