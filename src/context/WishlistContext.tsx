import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { products } = useProducts();
  const { success, info } = useToast();
  const { addToCart } = useCart();

  // Local guest fallback state
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('cartplus-guest-wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Sync with Supabase for authenticated users
  const fetchDbWishlist = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading wishlist:', error.message);
        return;
      }

      if (data) {
        const productIds = new Set(data.map((d) => d.product_id));
        const matched = products.filter((p) => productIds.has(p.id));
        setWishlist(matched);
      }
    } catch (err) {
      console.error('Wishlist load exception:', err);
    }
  }, [user, products]);

  // When user logs in, merge guest wishlist into database
  useEffect(() => {
    if (user?.id && isSupabaseConfigured) {
      const guestItems = localStorage.getItem('cartplus-guest-wishlist');
      if (guestItems) {
        try {
          const parsed: Product[] = JSON.parse(guestItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const inserts = parsed.map((p) => ({
              user_id: user.id,
              product_id: p.id,
            }));
            supabase.from('wishlists').upsert(inserts, { onConflict: 'user_id,product_id' }).then(() => {
              localStorage.removeItem('cartplus-guest-wishlist');
              fetchDbWishlist();
            });
          }
        } catch {
          // ignore
        }
      } else {
        fetchDbWishlist();
      }
    }
  }, [user, fetchDbWishlist]);

  // Save guest wishlist locally
  useEffect(() => {
    if (!user?.id) {
      try {
        localStorage.setItem('cartplus-guest-wishlist', JSON.stringify(wishlist));
      } catch {
        // ignore
      }
    }
  }, [wishlist, user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const addToWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) return;

    setWishlist((prev) => [...prev, product]);
    success(`Added "${product.name}" to your wishlist.`);

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('wishlists').upsert(
          { user_id: user.id, product_id: product.id },
          { onConflict: 'user_id,product_id' }
        );
      } catch (err) {
        console.error('Error saving wishlist item:', err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const item = wishlist.find((p) => p.id === productId);
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
    if (item) {
      info(`Removed "${item.name}" from wishlist.`);
    }

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (err) {
        console.error('Error removing wishlist item:', err);
      }
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const moveToCart = async (product: Product) => {
    addToCart(product, 1);
    await removeFromWishlist(product.id);
  };

  const clearWishlist = async () => {
    setWishlist([]);
    if (user?.id && isSupabaseConfigured) {
      await supabase.from('wishlists').delete().eq('user_id', user.id);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
