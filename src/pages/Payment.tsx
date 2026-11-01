import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, QrCode, Banknote, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import type { IOrder } from '../types/index.ts';

export const Payment: React.FC = () => {
  const { items, total } = useCart();
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as any)?.order as IOrder | undefined;
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!order) {
      navigate('/checkout');
    }
  }, [order, navigate]);

  if (!order) return null;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/orders/${order._id || order.orderNumber}/pay`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentMethod: order.paymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment submitted. Awaiting admin verification.', 'success');
        navigate(`/order-pending/${order.orderNumber || order._id}`, { state: { order: data.order || order } });
      } else {
        showToast(data.message || 'Payment failed.', 'error');
      }
    } catch {
      showToast('Error processing payment.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-display font-black text-2xl uppercase mb-6">Payment</h1>
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-4">
          <div className="flex justify-between text-sm">
            <span>Order</span>
            <span className="font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total</span>
            <span className="font-mono text-amber-400">₹{order.total}</span>
          </div>
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-display font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
          >
            {isProcessing ? 'PROCESSING...' : 'CONFIRM PAYMENT'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Payment;