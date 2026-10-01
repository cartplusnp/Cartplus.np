import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Order, OrderStatus, Address, OrderItem, PaymentMethod } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { formatTrackingTimeline } from '../utils/orderTracking';

interface CreateOrderParams {
  userId?: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: Address;
  items: { productId: string; quantity: number }[];
  notes?: string;
  paymentMethod?: PaymentMethod | string;
  paymentStatus?: 'pending' | 'paid' | 'cod_pending';
  transactionRef?: string;
  paidToAccount?: string;
}

interface OrderContextType {
  orders: Order[];
  addresses: Address[];
  isLoading: boolean;
  createOrder: (params: CreateOrderParams) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
  getOrderById: (id: string) => Order | undefined;
  getUserOrders: (userId?: string) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string, location?: string, courierName?: string, trackingNumber?: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refreshOrderTracking: (orderId: string) => Promise<void>;
  updateOrderNotes: (orderId: string, notes: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | undefined;
  deleteOrder: (orderId: string) => Promise<void>;
  deleteCancelledOrders: () => Promise<number>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError, info } = useToast();

  // Load customer addresses from Supabase
  const fetchAddresses = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setAddresses([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error.message);
        return;
      }

      if (data) {
        setAddresses(
          data.map((a) => ({
            id: a.id,
            user_id: a.user_id,
            full_name: a.full_name,
            phone: a.phone,
            province: a.province,
            district: a.district,
            municipality: a.municipality,
            ward: a.ward || undefined,
            street: a.street,
            landmark: a.landmark || undefined,
            is_default: a.is_default,
            created_at: a.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('Address load exception:', err);
    }
  }, [user]);

  // Load orders from Supabase
  const fetchOrders = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      let rawOrders: any[] | null = null;
      let rawItemsMap: Record<string, any[]> = {};
      let rawTrackingMap: Record<string, any[]> = {};

      // 1. Try joined query first
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            seller_id,
            product_name,
            sku,
            price,
            original_price,
            quantity,
            subtotal
          ),
          order_tracking_events (
            id,
            status,
            title,
            description,
            location,
            tracking_number,
            courier_name,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Notice: Joined orders query unavailable, using fallback:', error.message);

        let flatQuery = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (user.role !== 'admin') {
          flatQuery = flatQuery.eq('user_id', user.id);
        }

        const { data: flatData, error: flatError } = await flatQuery;

        if (flatError) {
          console.warn('Error fetching orders:', flatError.message);
          return;
        }

        rawOrders = flatData;

        if (rawOrders && rawOrders.length > 0) {
          const ordIds = rawOrders.map((o: any) => o.id).filter(Boolean);
          if (ordIds.length > 0) {
            try {
              const { data: itemsData } = await supabase
                .from('order_items')
                .select('id, order_id, product_id, seller_id, product_name, sku, price, original_price, quantity, subtotal')
                .in('order_id', ordIds);

              if (itemsData) {
                itemsData.forEach((it: any) => {
                  if (!rawItemsMap[it.order_id]) rawItemsMap[it.order_id] = [];
                  rawItemsMap[it.order_id].push(it);
                });
              }
            } catch {
              // Ignore secondary items query error
            }

            try {
              const { data: trackData } = await supabase
                .from('order_tracking_events')
                .select('id, order_id, status, title, description, location, tracking_number, courier_name, created_at')
                .in('order_id', ordIds);

              if (trackData) {
                trackData.forEach((tr: any) => {
                  if (!rawTrackingMap[tr.order_id]) rawTrackingMap[tr.order_id] = [];
                  rawTrackingMap[tr.order_id].push(tr);
                });
              }
            } catch {
              // Ignore secondary tracking query error
            }
          }
        }
      } else {
        rawOrders = data;
      }

      if (rawOrders) {
        const mappedOrders: Order[] = rawOrders.map((ord: any) => {
          const rawItems = ord.order_items || rawItemsMap[ord.id] || [];
          const items: OrderItem[] = rawItems.map((it: any) => ({
            product_id: it.product_id,
            product_name: it.product_name,
            product_slug: it.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            price: Number(it.price),
            original_price: it.original_price ? Number(it.original_price) : undefined,
            quantity: Number(it.quantity),
            seller_id: it.seller_id,
            sku: it.sku,
            subtotal: Number(it.subtotal),
          }));

          const rawEvents = ord.order_tracking_events || [];
          const tracking_events = rawEvents.map((evt: any) => ({
            id: evt.id,
            status: evt.status,
            title: evt.title,
            description: evt.description,
            location: evt.location,
            timestamp: evt.created_at,
            courier_name: evt.courier_name,
            tracking_number: evt.tracking_number,
          }));

          return {
            id: ord.id,
            order_number: ord.order_number,
            user_id: ord.user_id,
            customer_name: ord.customer_name,
            phone: ord.customer_phone,
            email: ord.customer_email,
            delivery_address: ord.delivery_address,
            items,
            subtotal: Number(ord.subtotal),
            discount: Number(ord.discount) || 0,
            delivery_fee: Number(ord.delivery_fee) || 120,
            total: Number(ord.total),
            payment_method: ord.payment_method,
            payment_status: ord.payment_status,
            order_status: ord.order_status,
            notes: ord.notes || undefined,
            courier_info: ord.courier_info || undefined,
            tracking_events: formatTrackingTimeline(tracking_events, ord.order_status),
            created_at: ord.created_at,
            updated_at: ord.updated_at,
          };
        });

        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Orders load exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
    fetchOrders();
  }, [fetchAddresses, fetchOrders]);

  // Real atomic order creation via Supabase create_order RPC
  const createOrder = async (
    params: CreateOrderParams
  ): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> => {
    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'Your cart has no items.' };
    }

    if (!isSupabaseConfigured) {
      const msg = 'Online ordering is temporarily unavailable. Please try again later.';
      toastError(msg);
      return { success: false, error: msg };
    }

    try {
      const itemsPayload = params.items.map((it) => ({
        product_id: it.productId,
        quantity: it.quantity,
      }));

      const { data, error } = await supabase.rpc('create_order', {
        p_customer_name: params.customerName.trim(),
        p_customer_phone: params.phone.trim(),
        p_customer_email: params.email.trim(),
        p_delivery_address: params.deliveryAddress,
        p_payment_method: params.paymentMethod || 'Cash on Delivery',
        p_notes: params.notes || '',
        p_items: itemsPayload,
      });

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      if (data && data.success) {
        // If order had online payment authorization, update payment details
        if (params.paymentStatus || params.transactionRef || params.paidToAccount) {
          await supabase
            .from('orders')
            .update({
              payment_status: params.paymentStatus || 'cod_pending',
              transaction_ref: params.transactionRef || null,
              paid_to_account: params.paidToAccount || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.order_id);
        }

        await fetchOrders();
        success(`Order ${data.order_number} confirmed!`);
        return {
          success: true,
          orderId: data.order_id,
          orderNumber: data.order_number,
        };
      }

      return { success: false, error: 'Could not complete order transaction.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order creation failed';
      toastError(msg);
      return { success: false, error: msg };
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: 'cancelled' } : o))
      );
      success('Order cancelled.');
      return true;
    }

    try {
      const { error } = await supabase.rpc('restore_stock_on_cancel', {
        p_order_id: orderId,
      });

      if (error) {
        toastError(error.message);
        return false;
      }

      await fetchOrders();
      success('Order cancelled successfully and inventory returned.');
      return true;
    } catch (err) {
      console.error('Cancel order error:', err);
      return false;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    notes?: string,
    location = 'Kathmandu Logistics Hub',
    courierName?: string,
    trackingNumber?: string
  ) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized: Only administrators can update shipment status.');
      return;
    }

    if (!isSupabaseConfigured) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
      );
      success(`Order status updated to ${status}.`);
      return;
    }

    try {
      const { error } = await supabase.rpc('admin_update_order_status', {
        p_order_id: orderId,
        p_status: status,
        p_notes: notes || `Shipment marked as ${status}`,
        p_location: location,
        p_courier_name: courierName || null,
        p_tracking_number: trackingNumber || null,
      });

      if (error) {
        toastError(error.message);
        return;
      }

      await fetchOrders();
      success(`Order status successfully updated to ${status}.`);
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  const refreshOrderTracking = async (orderId: string) => {
    await fetchOrders();
  };

  const updateOrderNotes = async (orderId: string, notes: string) => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('orders').update({ notes, updated_at: new Date().toISOString() }).eq('id', orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, notes } : o)));
      success('Order notes updated.');
    } catch (err) {
      console.error('Update notes error:', err);
    }
  };

  // Address management
  const addAddress = async (addrData: Omit<Address, 'id'>): Promise<Address> => {
    if (!isSupabaseConfigured || !user?.id) {
      const localAddr: Address = { ...addrData, id: `addr-${Date.now()}` };
      setAddresses((prev) => [localAddr, ...prev]);
      return localAddr;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: addrData.full_name,
          phone: addrData.phone,
          province: addrData.province,
          district: addrData.district,
          municipality: addrData.municipality,
          ward: addrData.ward || null,
          street: addrData.street,
          landmark: addrData.landmark || null,
          is_default: addrData.is_default || addresses.length === 0,
        })
        .select()
        .single();

      if (error) {
        toastError(error.message);
        const fallback: Address = { ...addrData, id: `addr-${Date.now()}` };
        return fallback;
      }

      const created: Address = {
        id: data.id,
        user_id: data.user_id,
        full_name: data.full_name,
        phone: data.phone,
        province: data.province,
        district: data.district,
        municipality: data.municipality,
        ward: data.ward || undefined,
        street: data.street,
        landmark: data.landmark || undefined,
        is_default: data.is_default,
        created_at: data.created_at,
      };

      setAddresses((prev) => [created, ...prev]);
      success('Delivery address saved to account.');
      return created;
    } catch (err) {
      console.error('Add address error:', err);
      return { ...addrData, id: `addr-${Date.now()}` };
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!isSupabaseConfigured) {
      setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
      return;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          province: updates.province,
          district: updates.district,
          municipality: updates.municipality,
          ward: updates.ward,
          street: updates.street,
          landmark: updates.landmark,
          is_default: updates.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        toastError(error.message);
        return;
      }

      setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
      success('Address updated.');
    } catch (err) {
      console.error('Update address error:', err);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!isSupabaseConfigured) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) {
        toastError(error.message);
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      info('Address removed.');
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!isSupabaseConfigured) {
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
      return;
    }

    try {
      if (user?.id) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        await supabase.from('addresses').update({ is_default: true }).eq('id', id);
        setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
        success('Default address updated.');
      }
    } catch (err) {
      console.error('Set default address error:', err);
    }
  };

  const getDefaultAddress = () => {
    return addresses.find((a) => a.is_default) || addresses[0];
  };

  // Deletes an order permanently from database and state
  const deleteOrder = async (orderId: string) => {
    try {
      if (isSupabaseConfigured) {
        // Delete child items first to satisfy foreign keys
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('order_tracking_events').delete().eq('order_id', orderId);
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
          toastError(error.message);
          return;
        }
      }
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      success('Order permanently deleted from database.');
    } catch (err) {
      console.error('Delete order error:', err);
    }
  };

  const deleteCancelledOrders = async (): Promise<number> => {
    const cancelled = orders.filter((o) => o.order_status === 'cancelled');
    if (cancelled.length === 0) {
      info('No cancelled orders to remove.');
      return 0;
    }

    try {
      if (isSupabaseConfigured) {
        const ids = cancelled.map((c) => c.id);
        await supabase.from('order_items').delete().in('order_id', ids);
        await supabase.from('order_tracking_events').delete().in('order_id', ids);
        await supabase.from('orders').delete().in('id', ids);
      }

      setOrders((prev) => prev.filter((o) => o.order_status !== 'cancelled'));
      success(`Permanently deleted ${cancelled.length} cancelled orders.`);
      return cancelled.length;
    } catch (err) {
      console.error('Delete cancelled orders error:', err);
      return 0;
    }
  };

  const getOrderById = (id: string) => {
    return orders.find((o) => o.id === id || o.order_number === id);
  };

  const getUserOrders = (userId?: string) => {
    const target = userId || user?.id;
    if (!target) return [];
    return orders.filter((o) => o.user_id === target);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addresses,
        isLoading,
        createOrder,
        getOrderById,
        getUserOrders,
        updateOrderStatus,
        cancelOrder,
        refreshOrderTracking,
        updateOrderNotes,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress,
        deleteOrder,
        deleteCancelledOrders,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
