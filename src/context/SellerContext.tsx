import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SellerProfile, SellerOrder, SellerLedgerEntry, SellerDocument, SellerPayout } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface RegisterSellerParams {
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  pan_vat_number: string;
  province: string;
  district: string;
  city: string;
  address: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  password?: string;
}

interface SellerContextType {
  seller: SellerProfile | null;
  isAuthenticatedSeller: boolean;
  sellers: SellerProfile[];
  isLoading: boolean;
  sellerOrders: SellerOrder[];
  allSellerOrders: SellerOrder[];
  sellerLedger: SellerLedgerEntry[];
  sellerDocuments: SellerDocument[];
  sellerPayouts: SellerPayout[];
  registerSeller: (data: RegisterSellerParams) => Promise<{ success: boolean; error?: string; seller?: SellerProfile }>;
  loginSeller: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string; seller?: SellerProfile }>;
  logoutSeller: () => void;
  updateSellerProfile: (updates: Partial<SellerProfile>) => Promise<void>;
  updateSellerStatus: (sellerId: string, status: 'pending' | 'active' | 'verified' | 'suspended') => Promise<void>;
  deleteSeller: (sellerId: string) => Promise<void>;
  refreshSellerData: () => Promise<void>;
  updateSellerOrderStatus: (
    sellerOrderId: string,
    status: SellerOrder['status'],
    trackingNumber?: string,
    courierCode?: string
  ) => Promise<boolean>;
  uploadSellerDocument: (
    documentType: SellerDocument['document_type'],
    documentName: string,
    file: File | null
  ) => Promise<boolean>;
  requestPayout: (
    amount: number,
    payoutMethod: string,
    notes?: string
  ) => Promise<boolean>;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const SellerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [allSellerOrders, setAllSellerOrders] = useState<SellerOrder[]>([]);
  const [sellerLedger, setSellerLedger] = useState<SellerLedgerEntry[]>([]);
  const [sellerDocuments, setSellerDocuments] = useState<SellerDocument[]>([]);
  const [sellerPayouts, setSellerPayouts] = useState<SellerPayout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError, info } = useToast();

  const fetchSellerOrders = async (sellerId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('seller_orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching seller orders:', error.message);
        return;
      }

      if (data) {
        setSellerOrders(
          data.map((row: any) => ({
            id: row.id,
            order_id: row.order_id,
            seller_id: row.seller_id,
            seller_order_number: row.seller_order_number,
            status: row.status,
            subtotal: Number(row.subtotal) || 0,
            delivery_fee: Number(row.delivery_fee) || 0,
            discount_amount: Number(row.discount_amount) || 0,
            commission_rate: Number(row.commission_rate) || 5.0,
            commission_amount: Number(row.commission_amount) || 0,
            payout_amount: Number(row.payout_amount) || 0,
            settlement_status: row.settlement_status || 'pending_hold',
            settlement_eligible_at: row.settlement_eligible_at || undefined,
            tracking_number: row.tracking_number || undefined,
            courier_code: row.courier_code || undefined,
            seller_notes: row.seller_notes || undefined,
            cancelled_reason: row.cancelled_reason || undefined,
            items: (row.order_items || []).map((it: any) => ({
              id: it.id,
              seller_order_id: it.seller_order_id || row.id,
              order_id: it.order_id,
              product_id: it.product_id,
              seller_id: it.seller_id,
              product_name: it.product_name,
              sku: it.sku,
              quantity: it.quantity,
              unit_price: Number(it.price) || 0,
              discount_amount: 0,
              total_price: Number(it.subtotal) || 0,
              commission_rate: Number(row.commission_rate) || 5.0,
              commission_amount: Number(it.subtotal) * ((Number(row.commission_rate) || 5.0) / 100),
              created_at: it.created_at,
            })),
            created_at: row.created_at,
            updated_at: row.updated_at,
          }))
        );
      }
    } catch (err) {
      console.error('Fetch seller orders exception:', err);
    }
  };

  const fetchAllSellerOrders = async () => {
    if (!isSupabaseConfigured || user?.role !== 'admin') return;
    try {
      const { data, error } = await supabase
        .from('seller_orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching all seller orders:', error.message);
        return;
      }

      if (data) {
        setAllSellerOrders(
          data.map((row: any) => ({
            id: row.id,
            order_id: row.order_id,
            seller_id: row.seller_id,
            seller_order_number: row.seller_order_number,
            status: row.status,
            subtotal: Number(row.subtotal) || 0,
            delivery_fee: Number(row.delivery_fee) || 0,
            discount_amount: Number(row.discount_amount) || 0,
            commission_rate: Number(row.commission_rate) || 5.0,
            commission_amount: Number(row.commission_amount) || 0,
            payout_amount: Number(row.payout_amount) || 0,
            settlement_status: row.settlement_status || 'pending_hold',
            settlement_eligible_at: row.settlement_eligible_at || undefined,
            tracking_number: row.tracking_number || undefined,
            courier_code: row.courier_code || undefined,
            seller_notes: row.seller_notes || undefined,
            cancelled_reason: row.cancelled_reason || undefined,
            items: (row.order_items || []).map((it: any) => ({
              id: it.id,
              seller_order_id: it.seller_order_id || row.id,
              order_id: it.order_id,
              product_id: it.product_id,
              seller_id: it.seller_id,
              product_name: it.product_name,
              sku: it.sku,
              quantity: it.quantity,
              unit_price: Number(it.price) || 0,
              discount_amount: 0,
              total_price: Number(it.subtotal) || 0,
              commission_rate: Number(row.commission_rate) || 5.0,
              commission_amount: Number(it.subtotal) * ((Number(row.commission_rate) || 5.0) / 100),
              created_at: it.created_at,
            })),
            created_at: row.created_at,
            updated_at: row.updated_at,
          }))
        );
      }
    } catch (err) {
      console.error('Fetch all seller orders exception:', err);
    }
  };

  const fetchSellerDocuments = async (sellerId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('seller_documents')
        .select('*')
        .eq('seller_id', sellerId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.warn('Error fetching seller documents:', error.message);
        return;
      }

      if (data) {
        setSellerDocuments(
          data.map((doc: any) => ({
            id: doc.id,
            seller_id: doc.seller_id,
            document_type: doc.document_type,
            document_name: doc.document_name,
            storage_path: doc.storage_path,
            file_size: Number(doc.file_size) || undefined,
            mime_type: doc.mime_type || undefined,
            verification_status: doc.verification_status || 'under_review',
            rejection_reason: doc.rejection_reason || undefined,
            reviewed_at: doc.reviewed_at || undefined,
            uploaded_at: doc.uploaded_at || doc.created_at || new Date().toISOString(),
          }))
        );
      }
    } catch (err) {
      console.error('Fetch seller documents exception:', err);
    }
  };

  const fetchSellerLedger = async (sellerId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('seller_ledger')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching seller ledger:', error.message);
        return;
      }

      if (data) {
        setSellerLedger(
          data.map((entry: any) => ({
            id: entry.id,
            seller_id: entry.seller_id,
            transaction_type: entry.transaction_type,
            entry_type: entry.entry_type,
            amount: Number(entry.amount) || 0,
            seller_order_id: entry.seller_order_id || undefined,
            reference_id: entry.reference_id || undefined,
            description: entry.description,
            balance_after: Number(entry.balance_after) || 0,
            created_at: entry.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('Fetch seller ledger exception:', err);
    }
  };

  const fetchSellerPayouts = async (sellerId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('seller_payouts')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching seller payouts:', error.message);
        return;
      }

      if (data) {
        setSellerPayouts(
          data.map((p: any) => ({
            id: p.id,
            seller_id: p.seller_id,
            amount: Number(p.amount || p.net_amount) || 0,
            payout_method: p.payout_method || 'Bank Transfer',
            transfer_reference: p.transfer_reference || undefined,
            status: p.status || 'pending',
            created_at: p.created_at,
            paid_at: p.paid_at || undefined,
          }))
        );
      }
    } catch (err) {
      console.error('Fetch seller payouts exception:', err);
    }
  };

  // Load current user's seller profile
  const fetchCurrentSeller = async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setSeller(null);
      setSellerOrders([]);
      setSellerDocuments([]);
      setSellerLedger([]);
      setSellerPayouts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select(`
          *,
          seller_bank_accounts (
            bank_name,
            account_holder,
            account_number
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching seller profile:', error.message);
        return;
      }

      if (data) {
        const bankData = data.seller_bank_accounts;
        const bank = Array.isArray(bankData) ? bankData[0] : bankData;
        setSeller({
          id: data.id,
          user_id: data.user_id,
          store_name: data.store_name,
          owner_name: data.owner_name,
          email: data.email,
          phone: data.phone,
          pan_vat_number: data.pan_vat_number,
          province: data.province,
          district: data.district,
          city: data.city,
          address: data.address,
          status: data.status,
          commission_rate: Number(data.commission_rate) || 5.0,
          rating: Number(data.rating) || 5.0,
          total_sales: Number(data.total_sales) || 0,
          bank_name: bank?.bank_name || '',
          account_number: bank?.account_number || '',
          account_holder: bank?.account_holder || '',
          rejection_reason: data.rejection_reason || undefined,
          verification_notes: data.verification_notes || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });

        // Load all persistent sub-collections for this seller
        await fetchSellerOrders(data.id);
        await fetchSellerDocuments(data.id);
        await fetchSellerLedger(data.id);
        await fetchSellerPayouts(data.id);
      } else {
        setSeller(null);
        setSellerOrders([]);
        setSellerDocuments([]);
        setSellerLedger([]);
        setSellerPayouts([]);
      }
    } catch (err) {
      console.error('Failed to load seller profile:', err);
    }
  };

  // Load all sellers for admin view
  const fetchAllSellers = async () => {
    if (!user || user.role !== 'admin' || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select(`
          *,
          seller_bank_accounts (
            bank_name,
            account_holder,
            account_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all sellers:', error.message);
        return;
      }

      if (data) {
        setSellers(
          data.map((item) => {
            const bankData = item.seller_bank_accounts;
            const bank = Array.isArray(bankData) ? bankData[0] : bankData;
            return {
              id: item.id,
              user_id: item.user_id,
              store_name: item.store_name,
              owner_name: item.owner_name,
              email: item.email,
              phone: item.phone,
              pan_vat_number: item.pan_vat_number,
              province: item.province,
              district: item.district,
              city: item.city,
              address: item.address,
              status: item.status,
              commission_rate: Number(item.commission_rate) || 5.0,
              rating: Number(item.rating) || 5.0,
              total_sales: Number(item.total_sales) || 0,
              bank_name: bank?.bank_name || '',
              account_number: bank?.account_number || '',
              account_holder: bank?.account_holder || '',
              rejection_reason: item.rejection_reason || undefined,
              verification_notes: item.verification_notes || undefined,
              created_at: item.created_at,
              updated_at: item.updated_at,
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to load all sellers:', err);
    }
  };

  useEffect(() => {
    fetchCurrentSeller();
    if (user?.role === 'admin') {
      fetchAllSellers();
      fetchAllSellerOrders();
    }
  }, [user]);

  const registerSeller = async (
    data: RegisterSellerParams
  ): Promise<{ success: boolean; error?: string; seller?: SellerProfile }> => {
    setIsLoading(true);
    try {
      let targetUserId = user?.id;

      // If user is not logged in, create Supabase auth account first
      if (!targetUserId) {
        if (!data.password || data.password.length < 6) {
          setIsLoading(false);
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          options: {
            data: {
              full_name: data.owner_name.trim(),
              phone: data.phone.trim(),
            },
          },
        });

        if (authErr) {
          setIsLoading(false);
          toastError(authErr.message);
          return { success: false, error: authErr.message };
        }

        if (!authData.user) {
          setIsLoading(false);
          return { success: false, error: 'Could not create merchant user account.' };
        }

        targetUserId = authData.user.id;
      }

      // Check duplicate
      const { data: existing } = await supabase
        .from('seller_profiles')
        .select('id')
        .or(`email.eq.${data.email.trim().toLowerCase()},pan_vat_number.eq.${data.pan_vat_number.trim()}`)
        .maybeSingle();

      if (existing) {
        setIsLoading(false);
        const msg = 'A store with this business email or PAN/VAT number is already registered.';
        toastError(msg);
        return { success: false, error: msg };
      }

      // Create seller profile in 'pending' status
      const { data: sellerRow, error: sellerErr } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: targetUserId,
          store_name: data.store_name.trim(),
          owner_name: data.owner_name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          pan_vat_number: data.pan_vat_number.trim(),
          province: data.province,
          district: data.district,
          city: data.city,
          address: data.address.trim(),
          status: 'pending',
          commission_rate: 5.0,
          rating: 5.0,
          total_sales: 0,
        })
        .select()
        .single();

      if (sellerErr) {
        setIsLoading(false);
        toastError(sellerErr.message);
        return { success: false, error: sellerErr.message };
      }

      // Save bank account securely in seller_bank_accounts
      await supabase.from('seller_bank_accounts').insert({
        seller_id: sellerRow.id,
        bank_name: data.bank_name,
        account_holder: data.account_holder.trim(),
        account_number: data.account_number.trim(),
      });

      const newSeller: SellerProfile = {
        id: sellerRow.id,
        user_id: sellerRow.user_id,
        store_name: sellerRow.store_name,
        owner_name: sellerRow.owner_name,
        email: sellerRow.email,
        phone: sellerRow.phone,
        pan_vat_number: sellerRow.pan_vat_number,
        province: sellerRow.province,
        district: sellerRow.district,
        city: sellerRow.city,
        address: sellerRow.address,
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_holder: data.account_holder,
        status: 'pending',
        commission_rate: 5.0,
        rating: 5.0,
        total_sales: 0,
        created_at: sellerRow.created_at,
      };

      setSeller(newSeller);
      info('Your seller application has been submitted and is pending CARTPLUS admin review.');
      setIsLoading(false);
      return { success: true, seller: newSeller };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toastError(msg);
      return { success: false, error: msg };
    }
  };

  const loginSeller = async (
    emailOrPhone: string,
    password?: string
  ): Promise<{ success: boolean; error?: string; seller?: SellerProfile }> => {
    if (!password) {
      return { success: false, error: 'Password is required to sign in.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone.trim().toLowerCase(),
        password,
      });

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Fetch seller profile
        const { data: sData, error: sErr } = await supabase
          .from('seller_profiles')
          .select(`
            *,
            seller_bank_accounts (
              bank_name,
              account_holder,
              account_number
            )
          `)
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (sErr || !sData) {
          return { success: false, error: 'No merchant account associated with this login.' };
        }

        const bankData = sData.seller_bank_accounts;
        const bank = Array.isArray(bankData) ? bankData[0] : bankData;
        const activeSeller: SellerProfile = {
          id: sData.id,
          user_id: sData.user_id,
          store_name: sData.store_name,
          owner_name: sData.owner_name,
          email: sData.email,
          phone: sData.phone,
          pan_vat_number: sData.pan_vat_number,
          province: sData.province,
          district: sData.district,
          city: sData.city,
          address: sData.address,
          status: sData.status,
          commission_rate: Number(sData.commission_rate) || 5.0,
          rating: Number(sData.rating) || 5.0,
          total_sales: Number(sData.total_sales) || 0,
          bank_name: bank?.bank_name || '',
          account_number: bank?.account_number || '',
          account_holder: bank?.account_holder || '',
          rejection_reason: sData.rejection_reason || undefined,
          verification_notes: sData.verification_notes || undefined,
          created_at: sData.created_at,
          updated_at: sData.updated_at,
        };

        setSeller(activeSeller);
        success(`Welcome to ${activeSeller.store_name} Merchant Portal!`);
        return { success: true, seller: activeSeller };
      }

      return { success: false, error: 'Sign in failed.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      return { success: false, error: msg };
    }
  };

  const logoutSeller = () => {
    setSeller(null);
    info('Logged out of Merchant Portal.');
  };

  const updateSellerProfile = async (updates: Partial<SellerProfile>) => {
    if (!seller) return;

    try {
      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: updates.store_name || seller.store_name,
          owner_name: updates.owner_name || seller.owner_name,
          phone: updates.phone || seller.phone,
          address: updates.address || seller.address,
          city: updates.city || seller.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', seller.id);

      if (error) {
        toastError(error.message);
        return;
      }

      setSeller((prev) => (prev ? { ...prev, ...updates } : null));
      success('Store profile updated successfully.');
    } catch (err) {
      console.error('Update seller error:', err);
    }
  };

  const updateSellerStatus = async (
    sellerId: string,
    status: 'pending' | 'active' | 'verified' | 'suspended'
  ) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized: Admin privileges required.');
      return;
    }

    try {
      if (status === 'verified' || status === 'active') {
        const { error } = await supabase.rpc('approve_seller', {
          p_seller_id: sellerId,
          p_commission_rate: 5.0,
        });

        if (error) {
          // Fallback direct update if RPC is not yet compiled
          await supabase
            .from('seller_profiles')
            .update({ status: 'verified', updated_at: new Date().toISOString() })
            .eq('id', sellerId);
        }
      } else {
        await supabase
          .from('seller_profiles')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', sellerId);
      }

      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status } : s))
      );
      if (seller?.id === sellerId) {
        setSeller((prev) => (prev ? { ...prev, status } : null));
      }
      success(`Seller status updated to: ${status}`);
    } catch (err) {
      console.error('Update seller status error:', err);
    }
  };

  const deleteSeller = async (sellerId: string) => {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('seller_bank_accounts').delete().eq('seller_id', sellerId);
        await supabase.from('seller_documents').delete().eq('seller_id', sellerId);
        await supabase.from('seller_payouts').delete().eq('seller_id', sellerId);
        await supabase.from('products').update({ seller_id: null }).eq('seller_id', sellerId);
        const { error } = await supabase
          .from('seller_profiles')
          .delete()
          .eq('id', sellerId);

        if (error) {
          toastError(error.message);
          return;
        }
      }

      setSellers((prev) => prev.filter((s) => s.id !== sellerId));
      if (seller?.id === sellerId) {
        setSeller(null);
      }
      success('Seller account permanently deleted from database.');
    } catch (err) {
      console.error('Delete seller error:', err);
    }
  };

  const updateSellerOrderStatus = async (
    sellerOrderId: string,
    status: SellerOrder['status'],
    trackingNumber?: string,
    courierCode?: string
  ): Promise<boolean> => {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('seller_orders')
          .update({
            status,
            tracking_number: trackingNumber || null,
            courier_code: courierCode || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sellerOrderId);
      }

      setSellerOrders((prev) =>
        prev.map((so) => {
          if (so.id === sellerOrderId) {
            return {
              ...so,
              status,
              tracking_number: trackingNumber || so.tracking_number,
              courier_code: courierCode || so.courier_code,
              updated_at: new Date().toISOString(),
            };
          }
          return so;
        })
      );

      success(`Seller order marked as ${status.toUpperCase()}`);
      return true;
    } catch (err) {
      console.error('Update seller order error:', err);
      toastError('Could not update seller order status.');
      return false;
    }
  };

  const uploadSellerDocument = async (
    documentType: SellerDocument['document_type'],
    documentName: string,
    file: File | null
  ): Promise<boolean> => {
    if (!seller?.id) {
      toastError('Merchant authentication required to submit documents.');
      return false;
    }

    try {
      const docUuid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14);

      let storagePath = `${seller.id}/${docUuid}`;

      if (file && isSupabaseConfigured) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uploadPath = `${seller.id}/${Date.now()}_${sanitizedFileName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('seller-documents')
          .upload(uploadPath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadErr) {
          console.warn('Supabase storage upload error for seller document:', uploadErr.message);
        } else if (uploadData?.path) {
          storagePath = uploadData.path;
        }
      }

      const newDoc: SellerDocument = {
        id: docUuid,
        seller_id: seller.id,
        document_type: documentType,
        document_name: documentName || file?.name || 'Verified Certificate',
        storage_path: storagePath,
        file_size: file ? file.size : 0,
        mime_type: file ? file.type : 'application/pdf',
        verification_status: 'under_review',
        uploaded_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        const { data: inserted, error: insertErr } = await supabase
          .from('seller_documents')
          .insert({
            id: docUuid,
            seller_id: seller.id,
            document_type: documentType,
            document_name: newDoc.document_name,
            storage_path: newDoc.storage_path,
            file_size: newDoc.file_size,
            mime_type: newDoc.mime_type,
            verification_status: 'under_review',
          })
          .select()
          .maybeSingle();

        if (insertErr) {
          console.warn('Error inserting seller document into database:', insertErr.message);
        } else if (inserted?.id) {
          newDoc.id = inserted.id;
        }
      }

      setSellerDocuments((prev) => [newDoc, ...prev]);
      success('Document submitted for CARTPLUS compliance verification.');
      return true;
    } catch (err) {
      console.error('Upload seller document error:', err);
      toastError('Failed to upload document.');
      return false;
    }
  };

  const requestPayout = async (
    amount: number,
    payoutMethod: string,
    notes?: string
  ): Promise<boolean> => {
    if (!seller?.id) {
      toastError('Merchant authentication required to request payout.');
      return false;
    }

    try {
      const payoutUuid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14);
      const ref = `IPS-${Date.now().toString().slice(-6)}`;
      const newPayout: SellerPayout = {
        id: payoutUuid,
        seller_id: seller.id,
        amount,
        payout_method: payoutMethod,
        transfer_reference: ref,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        await supabase.from('seller_payouts').insert({
          id: payoutUuid,
          seller_id: seller.id,
          amount,
          net_amount: amount,
          gross_amount: amount,
          payout_method: payoutMethod,
          transfer_reference: ref,
          status: 'pending',
        });
      }

      setSellerPayouts((prev) => [newPayout, ...prev]);
      success(`Withdrawal request of Rs. ${amount.toLocaleString('en-NP')} submitted for processing.`);
      return true;
    } catch (err) {
      console.error('Request payout error:', err);
      toastError('Failed to submit payout request.');
      return false;
    }
  };

  const refreshSellerData = async () => {
    await fetchCurrentSeller();
    if (user?.role === 'admin') {
      await fetchAllSellers();
      await fetchAllSellerOrders();
    }
  };

  const isAuthenticatedSeller =
    !!seller && (seller.status === 'verified' || seller.status === 'active');

  return (
    <SellerContext.Provider
      value={{
        seller,
        isAuthenticatedSeller,
        sellers,
        isLoading,
        sellerOrders,
        allSellerOrders,
        sellerLedger,
        sellerDocuments,
        sellerPayouts,
        registerSeller,
        loginSeller,
        logoutSeller,
        updateSellerProfile,
        updateSellerStatus,
        deleteSeller,
        refreshSellerData,
        updateSellerOrderStatus,
        uploadSellerDocument,
        requestPayout,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
