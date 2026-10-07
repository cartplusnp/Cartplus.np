import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  users: UserProfile[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserRole: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError, info } = useToast();

  // Load and subscribe to Supabase Auth State
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session retrieval error:', error.message);
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch full profile from public.profiles table
  const fetchUserProfile = async (userId: string, fallbackEmail: string) => {
    try {
      // Check auth user metadata for real full name and phone
      let metaName = '';
      let metaPhone = '';
      try {
        const { data: authData } = await supabase.auth.getUser();
        metaName = authData?.user?.user_metadata?.full_name || authData?.user?.user_metadata?.name || '';
        metaPhone = authData?.user?.user_metadata?.phone || '';
      } catch {
        // ignore
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch note:', error.message);
        // Create initial customer profile record if not found
        const resolvedFallbackName = metaName || (fallbackEmail ? fallbackEmail.split('@')[0] : 'Customer');
        const newProfile: UserProfile = {
          id: userId,
          name: resolvedFallbackName,
          email: fallbackEmail,
          phone: metaPhone,
          role: 'customer',
          status: 'active',
          created_at: new Date().toISOString(),
        };
        setUser(newProfile);
        return;
      }

      if (data) {
        // If data.full_name is an email username/prefix while metaName has a real multi-word name, prefer real name
        const isEmailUsername = Boolean(
          data.full_name &&
          fallbackEmail &&
          data.full_name.toLowerCase().trim() === fallbackEmail.split('@')[0].toLowerCase().trim()
        );
        const resolvedName = (isEmailUsername && metaName) ? metaName : (data.full_name || metaName || fallbackEmail.split('@')[0]);

        setUser({
          id: data.id,
          name: resolvedName,
          email: data.email || fallbackEmail,
          phone: data.phone || metaPhone || '',
          role: data.role,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id, user.email);
    }
  };

  // Real Supabase Authentication
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    if (!isSupabaseConfigured) {
      const msg = 'Supabase credentials are not configured in .env. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.';
      toastError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id, data.user.email || cleanEmail);
        success(`Welcome back to CARTPLUS!`);
        return { success: true };
      }

      return { success: false, error: 'Login could not be verified.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toastError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail) return { success: false, error: 'Email is required.' };
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (!isSupabaseConfigured) {
      const msg = 'Supabase credentials are not configured in .env.';
      toastError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Upsert profile in public.profiles table
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: 'customer',
          status: 'active',
          updated_at: new Date().toISOString(),
        });

        if (profileErr) {
          console.warn('Profile sync note:', profileErr.message);
        }

        await fetchUserProfile(data.user.id, cleanEmail);

        if (data.session) {
          success(`Account created successfully! Welcome to CARTPLUS.`);
        } else {
          info(`Registration successful! Please check your email inbox to verify your account.`);
        }
        return { success: true };
      }

      return { success: false, error: 'Registration could not be completed.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toastError(msg);
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in.' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.name || user.name,
          phone: data.phone !== undefined ? data.phone : user.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      // Keep Supabase Auth user_metadata synchronized
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: data.name || user.name,
            phone: data.phone !== undefined ? data.phone : user.phone,
          },
        });
      } catch {
        // ignore metadata sync error
      }

      setUser((prev) => (prev ? { ...prev, ...data } : null));
      success('Profile updated successfully.');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: msg };
    }
  };

  const updateEmail = async (newEmail: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: 'Please enter a valid email address.' };
    if (!user) return { success: false, error: 'Not logged in.' };
    if (cleanEmail === user.email.toLowerCase()) {
      return { success: false, error: 'New email must be different from your current email.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: cleanEmail,
      });

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      const msg = 'Verification links have been sent to your email addresses. Please confirm the change to finalize your new email.';
      info(msg);
      return { success: true, message: msg };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update email.';
      return { success: false, error: msg };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toastError(error.message);
        return { success: false, error: error.message };
      }

      success('Account password updated successfully.');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      info('You have been signed out.');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
    }
  };

  // Admin user directory management
  const loadUsersList = async () => {
    if (!user || user.role !== 'admin' || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error.message);
        return;
      }

      if (data) {
        setUsers(
          data.map((p) => ({
            id: p.id,
            name: p.full_name,
            email: p.email,
            phone: p.phone || '',
            role: p.role,
            status: p.status,
            created_at: p.created_at,
            updated_at: p.updated_at,
          }))
        );
      }
    } catch (err) {
      console.error('Users load exception:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsersList();
    }
  }, [user]);

  const toggleUserRole = async (userId: string) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized: Only administrators can modify roles.');
      return;
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const newRole = target.role === 'admin' ? 'customer' : 'admin';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        toastError(error.message);
        return;
      }

      // Log in audit log
      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'user_role_changed',
        entity_type: 'profiles',
        entity_id: userId,
        metadata: { old_role: target.role, new_role: newRole },
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (user.id === userId) {
        setUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      success(`User role updated to ${newRole}.`);
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized.');
      return;
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const newStatus = target.status === 'suspended' ? 'active' : 'suspended';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        toastError(error.message);
        return;
      }

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'user_status_changed',
        entity_type: 'profiles',
        entity_id: userId,
        metadata: { old_status: target.status, new_status: newStatus },
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      success(`User status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized.');
      return;
    }

    try {
      // Soft-delete or suspend user
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        toastError(error.message);
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      info('User access has been suspended.');
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' && user?.status === 'active';
  const isSeller = (user?.role === 'seller' || user?.role === 'admin') && user?.status === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated,
        isAdmin,
        isSeller,
        isLoading,
        login,
        register,
        updateProfile,
        updateEmail,
        changePassword,
        toggleUserRole,
        toggleUserStatus,
        deleteUser,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
