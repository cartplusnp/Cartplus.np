import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProductReview } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ReviewContextType {
  reviews: ProductReview[];
  isLoading: boolean;
  getProductReviews: (productId: string) => ProductReview[];
  getUserProductReview: (productId: string, userId?: string) => ProductReview | undefined;
  getPendingReviews: () => ProductReview[];
  addReview: (review: { productId: string; rating: number; title: string; comment: string; orderId?: string }) => Promise<boolean>;
  updateReview: (id: string, updates: Partial<Pick<ProductReview, 'rating' | 'title' | 'comment'>>) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  rejectReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  checkHasPurchased: (productId: string) => Promise<boolean>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError, info } = useToast();

  const fetchReviews = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table permissions or RLS restrict access, log friendly warning without throwing error
        console.warn('Product reviews access notice:', error.message);
        return;
      }

      if (data) {
        setReviews(
          data.map((r: any) => ({
            id: r.id,
            product_id: r.product_id,
            user_id: r.user_id,
            user_name: (user && r.user_id === user.id ? user.name : undefined) || 'Verified Customer',
            rating: r.rating,
            title: r.title,
            comment: r.review_text,
            is_approved: r.is_approved,
            approved: r.is_approved,
            created_at: r.created_at,
          }))
        );
      }
    } catch (err) {
      console.warn('Reviews load exception:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, user]);

  const getProductReviews = (productId: string): ProductReview[] => {
    return reviews.filter(
      (r) =>
        r.product_id === productId &&
        (r.is_approved || r.approved || (user && r.user_id === user.id) || user?.role === 'admin')
    );
  };

  const getUserProductReview = (productId: string, userId?: string): ProductReview | undefined => {
    const target = userId || user?.id;
    if (!target) return undefined;
    return reviews.find((r) => r.product_id === productId && r.user_id === target);
  };

  const getPendingReviews = (): ProductReview[] => {
    return reviews.filter((r) => !r.is_approved && !r.approved);
  };

  // Check if customer actually purchased the item
  const checkHasPurchased = async (productId: string): Promise<boolean> => {
    if (!user?.id || !isSupabaseConfigured) return false;

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('id, orders!inner(user_id, order_status)')
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)
        .limit(1);

      if (error) {
        console.warn('Purchase check notice:', error.message);
        return false;
      }

      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      return false;
    }
  };

  const addReview = async (reviewData: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    orderId?: string;
  }): Promise<boolean> => {
    if (!user?.id) {
      toastError('Please sign in to submit a product review.');
      return false;
    }

    if (!isSupabaseConfigured) {
      const localRev: ProductReview = {
        id: `rev-${Date.now()}`,
        product_id: reviewData.productId,
        user_id: user.id,
        user_name: user.name,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        is_approved: false,
        approved: false,
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [localRev, ...prev]);
      info('Thank you! Your review has been submitted for compliance verification.');
      return true;
    }

    try {
      // Reviews always submit with is_approved = false
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: reviewData.productId,
          user_id: user.id,
          order_id: reviewData.orderId || null,
          rating: reviewData.rating,
          title: reviewData.title.trim(),
          review_text: reviewData.comment.trim(),
          is_approved: false,
        })
        .select()
        .single();

      if (error) {
        toastError(error.message);
        return false;
      }

      const created: ProductReview = {
        id: data.id,
        product_id: data.product_id,
        user_id: data.user_id,
        user_name: user.name,
        rating: data.rating,
        title: data.title,
        comment: data.review_text,
        is_approved: false,
        approved: false,
        created_at: data.created_at,
      };

      setReviews((prev) => [created, ...prev]);
      info('Review submitted successfully. It will appear publicly once verified by our team.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      toastError(msg);
      return false;
    }
  };

  const updateReview = async (
    id: string,
    updates: Partial<Pick<ProductReview, 'rating' | 'title' | 'comment'>>
  ) => {
    if (!isSupabaseConfigured) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, is_approved: false } : r)));
      info('Review updated and resubmitted for review.');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          rating: updates.rating,
          title: updates.title,
          review_text: updates.comment,
          is_approved: false, // Reset approval on edit
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        toastError(error.message);
        return;
      }

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates, is_approved: false, approved: false } : r))
      );
      info('Review updated and queued for re-verification.');
    } catch (err) {
      console.error('Update review error:', err);
    }
  };

  const approveReview = async (id: string) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized.');
      return;
    }

    if (!isSupabaseConfigured) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true, approved: true } : r))
      );
      success('Review approved and published.');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        toastError(error.message);
        return;
      }

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true, approved: true } : r))
      );
      success('Review approved.');
    } catch (err) {
      console.error('Approve review error:', err);
    }
  };

  const rejectReview = async (id: string) => {
    await deleteReview(id);
  };

  const deleteReview = async (id: string) => {
    if (!isSupabaseConfigured) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      info('Review removed.');
      return;
    }

    try {
      const { error } = await supabase.from('product_reviews').delete().eq('id', id);
      if (error) {
        toastError(error.message);
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
      info('Review deleted from database.');
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        isLoading,
        getProductReviews,
        getUserProductReview,
        getPendingReviews,
        addReview,
        updateReview,
        approveReview,
        rejectReview,
        deleteReview,
        checkHasPurchased,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};
