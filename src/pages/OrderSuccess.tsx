import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  ArrowRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import type { IOrder } from '../types/index.ts';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IOrder | null>(
    (location.state as any)?.order || null
  );
  const [isLoading, setIsLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      // Try to fetch order from API
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order) {
            setOrder(data.order);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [orderId, order]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 sm:p-10 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-2xl text-center space-y-6"
        >
          {/* Animated checkmark icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-1 block">
              PAYMENT VERIFIED & ORDER CONFIRMED
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              THANK YOU FOR YOUR ORDER!
            </h1>
            <p className="text-neutral-400 text-sm mt-2 max-w-md mx-auto">
              Your DEITY CAPS are now being prepped and custom-packed at our facility in Madurai, Tamil Nadu.
            </p>
          </div>

          {/* Key Order Identification Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-850 text-left text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Order Number</span>
              <strong className="text-white font-mono text-xs sm:text-sm">
                {order?.orderNumber || orderId || 'DC-2026-CONFIRMED'}
              </strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Tracking ID</span>
              <strong className="text-amber-400 font-mono text-xs sm:text-sm">
                {order?.trackingNumber || 'DELHIVERY-9840213'}
              </strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Estimated Delivery</span>
              <strong className="text-white text-xs sm:text-sm">
                {order?.estimatedDelivery || '3-5 Business Days'}
              </strong>
            </div>
          </div>

          {/* Delivery & Items Summary */}
          {order && (
            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-850 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Delivery Destination
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Total Paid: <strong className="text-white">₹{order.total}</strong>
                </span>
              </div>

              <div className="text-xs text-neutral-300">
                <p className="font-bold text-white">{order.shippingAddress?.fullName || order.customerName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                <p className="text-neutral-500 mt-1">Phone: {order.shippingAddress?.phone || order.customerPhone}</p>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-900 border border-neutral-800"
                        />
                      )}
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-neutral-500 text-[11px]">
                          Qty: {item.quantity} • {item.color} • {item.variant}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-neutral-300">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              CONTINUE SHOPPING
            </Link>

            <Link
              to="/account?tab=orders"
              className="px-8 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              VIEW MY ORDERS
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
