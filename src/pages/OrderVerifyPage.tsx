import React, { useEffect, useState } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useOrders } from '../context/OrderContext';
import { ShieldCheck, Package, Clock, Truck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const OrderVerifyPage: React.FC = () => {
  const { path } = useRouter();
  const { getOrderById } = useOrders();

  // Extract order identifier from path /order/verify/:id or query ?orderNumber=
  const orderIdentifier = path.startsWith('/order/verify/')
    ? decodeURIComponent(path.replace('/order/verify/', '').split('?')[0])
    : new URLSearchParams(window.location.search).get('orderNumber') || '';

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<{
    order_number: string;
    order_status: string;
    payment_method: string;
    payment_status: string;
    total: number;
    destination_district: string;
    item_count: number;
    created_at: string;
    courier_name?: string;
    tracking_number?: string;
  } | null>(null);

  useEffect(() => {
    async function verify() {
      if (!orderIdentifier) {
        setLoading(false);
        return;
      }

      // Check context cache first
      const cached = getOrderById(orderIdentifier);
      if (cached) {
        setOrderData({
          order_number: cached.order_number || cached.id,
          order_status: cached.order_status,
          payment_method: cached.payment_method,
          payment_status: cached.payment_status || 'cod_pending',
          total: cached.total,
          destination_district: cached.delivery_address?.district || 'Nepal',
          item_count: cached.items.reduce((s, it) => s + it.quantity, 0),
          created_at: cached.created_at,
          courier_name: cached.courier_info?.provider_name,
          tracking_number: cached.courier_info?.tracking_number,
        });
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('verify_order_manifest', {
            p_identifier: orderIdentifier,
          });

          if (!rpcErr && rpcData && rpcData.success) {
            setOrderData({
              order_number: rpcData.order_number,
              order_status: rpcData.order_status,
              payment_method: rpcData.payment_method,
              payment_status: rpcData.payment_status,
              total: Number(rpcData.total),
              destination_district: rpcData.destination_district || 'Nepal',
              item_count: Number(rpcData.item_count) || 1,
              created_at: rpcData.created_at,
              courier_name: rpcData.courier_name,
              tracking_number: rpcData.tracking_number,
            });
            setLoading(false);
            return;
          }

          // Fallback query with strict column selection (NO customer name, phone, street, or email)
          const { data: orderRow } = await supabase
            .from('orders')
            .select(`
              id,
              order_number,
              order_status,
              payment_method,
              payment_status,
              total,
              created_at,
              courier_info
            `)
            .or(`order_number.eq.${orderIdentifier},id.eq.${orderIdentifier}`)
            .maybeSingle();

          if (orderRow) {
            setOrderData({
              order_number: orderRow.order_number,
              order_status: orderRow.order_status,
              payment_method: orderRow.payment_method,
              payment_status: orderRow.payment_status,
              total: Number(orderRow.total),
              destination_district: 'Nepal',
              item_count: 1,
              created_at: orderRow.created_at,
              courier_name: (orderRow.courier_info as any)?.provider_name,
              tracking_number: (orderRow.courier_info as any)?.tracking_number,
            });
          }
        } catch (err) {
          console.warn('Order verification lookup notice:', err);
        }
      }

      setLoading(false);
    }

    verify();
  }, [orderIdentifier, getOrderById]);

  return (
    <div className="min-h-[80vh] bg-slate-50 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <h1 className="text-xl font-black font-brand text-slate-900">
            Dispatch Manifest Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official 2D QR Verification for Warehouse Personnel & Delivery Courier
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-8 text-center space-y-3">
            <Clock className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Verifying order dispatch manifest...</p>
          </div>
        ) : orderData ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  Verified Genuine Order
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">
                  {orderData.order_number}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Order Status:</span>
                <span className="font-bold text-slate-900 uppercase text-[11px] px-2 py-0.5 rounded-full bg-slate-100">
                  {orderData.order_status}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Destination Hub:</span>
                <span className="font-bold text-slate-900">
                  {orderData.destination_district} District
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Parcel Contents:</span>
                <span className="font-bold text-slate-900">{orderData.item_count} Items</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Payment Collection:</span>
                <span className="font-bold text-slate-900">
                  {orderData.payment_method} ({orderData.payment_status})
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-baseline">
                <span className="text-slate-500 font-semibold">Total Collectible:</span>
                <span className="text-lg font-black text-slate-950 font-brand">
                  Rs. {orderData.total.toLocaleString('en-NP')}
                </span>
              </div>
              {orderData.courier_name && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Carrier Dispatch:</span>
                  <span className="font-bold text-slate-900">{orderData.courier_name}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Verified by CARTPLUS Central Routing Gateway.
              Customer personal contact information is protected under privacy standards.
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-rose-200 shadow-md p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Invalid or Expired QR Manifest
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                The scanned QR code reference could not be matched with any active dispatch record in the CARTPLUS database.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
