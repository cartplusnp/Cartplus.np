import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminPayoutSettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const DEFAULT_ADMIN_PAYOUTS: AdminPayoutSettings = {
  admin_name: '',
  admin_email: '',
  admin_phone: '',
  store_legal_name: 'CARTPLUS Nepal Pvt. Ltd.',
  esewa_id: '',
  esewa_name: '',
  esewa_qr_url: '',
  khalti_id: '',
  khalti_name: '',
  khalti_qr_url: '',
  bank_name: '',
  bank_account_number: '',
  bank_account_name: '',
  bank_branch: '',
  bank_qr_url: '',
  updated_at: new Date().toISOString(),
};

interface AdminSettingsContextType {
  payoutSettings: AdminPayoutSettings;
  isLoading: boolean;
  updatePayoutSettings: (newSettings: Partial<AdminPayoutSettings>) => Promise<boolean>;
  resetAdminAccount: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'cartplus_admin_payout_settings';

export const AdminSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [payoutSettings, setPayoutSettings] = useState<AdminPayoutSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_ADMIN_PAYOUTS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not parse local admin payout settings:', e);
    }
    return DEFAULT_ADMIN_PAYOUTS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError, info } = useToast();

  const fetchSettings = async () => {
    // Only administrators are permitted to retrieve private payment settings
    if (!isSupabaseConfigured || !user || user.role !== 'admin') return;

    try {
      const { data, error } = await supabase
        .from('admin_payment_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Admin payment settings fetch note:', error.message);
        return;
      }

      if (data) {
        const val: AdminPayoutSettings = {
          admin_name: data.admin_name || '',
          admin_email: data.admin_email || '',
          admin_phone: data.admin_phone || '',
          store_legal_name: data.store_legal_name || 'CARTPLUS Nepal Pvt. Ltd.',
          esewa_id: data.esewa_id || '',
          esewa_name: data.esewa_name || '',
          esewa_qr_url: data.esewa_qr_url || '',
          khalti_id: data.khalti_id || '',
          khalti_name: data.khalti_name || '',
          khalti_qr_url: data.khalti_qr_url || '',
          bank_name: data.bank_name || '',
          bank_account_number: data.bank_account_number || '',
          bank_account_name: data.bank_account_name || '',
          bank_branch: data.bank_branch || '',
          bank_qr_url: data.bank_qr_url || '',
          updated_at: data.updated_at,
        };
        setPayoutSettings((prev) => ({ ...prev, ...val }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payoutSettings, ...val }));
      }
    } catch (err) {
      console.error('Fetch admin settings exception:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSettings();
    }
  }, [user]);

  const updatePayoutSettings = async (newSettings: Partial<AdminPayoutSettings>): Promise<boolean> => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized: Only administrators can update payment settings.');
      return false;
    }

    setIsLoading(true);
    const merged: AdminPayoutSettings = {
      ...payoutSettings,
      ...newSettings,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      setPayoutSettings(merged);

      if (isSupabaseConfigured) {
        // Check if an existing settings record exists
        const { data: existing } = await supabase
          .from('admin_payment_settings')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          await supabase
            .from('admin_payment_settings')
            .update({
              store_legal_name: merged.store_legal_name,
              admin_name: merged.admin_name,
              admin_email: merged.admin_email,
              admin_phone: merged.admin_phone,
              esewa_id: merged.esewa_id,
              esewa_name: merged.esewa_name,
              esewa_qr_url: merged.esewa_qr_url || null,
              khalti_id: merged.khalti_id,
              khalti_name: merged.khalti_name,
              khalti_qr_url: merged.khalti_qr_url || null,
              bank_name: merged.bank_name,
              bank_account_number: merged.bank_account_number,
              bank_account_name: merged.bank_account_name,
              bank_branch: merged.bank_branch,
              bank_qr_url: merged.bank_qr_url || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('admin_payment_settings')
            .insert({
              store_legal_name: merged.store_legal_name,
              admin_name: merged.admin_name,
              admin_email: merged.admin_email,
              admin_phone: merged.admin_phone,
              esewa_id: merged.esewa_id,
              esewa_name: merged.esewa_name,
              esewa_qr_url: merged.esewa_qr_url || null,
              khalti_id: merged.khalti_id,
              khalti_name: merged.khalti_name,
              khalti_qr_url: merged.khalti_qr_url || null,
              bank_name: merged.bank_name,
              bank_account_number: merged.bank_account_number,
              bank_account_name: merged.bank_account_name,
              bank_branch: merged.bank_branch,
              bank_qr_url: merged.bank_qr_url || null,
              updated_at: new Date().toISOString(),
            });
        }
      }

      success('Payment gateway receiver settings securely updated in database!');
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to update admin payout settings';
      toastError(msg);
      return false;
    }
  };

  const resetAdminAccount = async (): Promise<boolean> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPayoutSettings(DEFAULT_ADMIN_PAYOUTS);
      info('Admin payment gateway configuration reset to clean slate. You can now register or link your new admin account.');
      return true;
    } catch (e) {
      console.error('Error resetting admin:', e);
      return false;
    }
  };

  return (
    <AdminSettingsContext.Provider
      value={{
        payoutSettings,
        isLoading,
        updatePayoutSettings,
        resetAdminAccount,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = (): AdminSettingsContextType => {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
};
