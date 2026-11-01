import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Clock, Package, CheckCircle2 } from 'lucide-react';
import type { IOrder } from '../types/index.ts';

export const OrderPending: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<IOrder | null>((location.state as any)?.order || null);
  const [status, setStatus] = useState<string>('Pending');

  useEffect(() => {
    const id = orderId;
    if (!id) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          setStatus(data.order.orderStatus);
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const confirmed = status === 'Confirmed';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 mb-6">
          {confirmed ? <CheckCircle2 className="w-10 h-10 text-emerald-400" /> : <Clock className="w-10 h-10" />}
        </div>
        <h1 className="font-display font-black text-3xl uppercase mb-2">
          {confirmed ? 'Order Confirmed' : 'Order Confirmation Pending'}
        </h1>
        <p className="text-neutral-400 text-sm mb-6">
          {confirmed
            ? 'Your order has been verified by our team.'
            : 'Your payment is under review. We will notify you once confirmed.'}
        </p>
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-400">Order Number</span>
            <span className="font-mono text-white">{order?.orderNumber || orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Status</span>
            <span className={confirmed ? 'text-emerald-400' : 'text-amber-400'}>{status}</span>
          </div>
        </div>
        <Link to="/shop" className="inline-block mt-6 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
export default OrderPending;