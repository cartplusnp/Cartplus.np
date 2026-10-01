import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ProductContextType {
  products: Product[];
  activeProducts: Product[];
  isLoading: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categorySlug: string) => Product[];
  getProductsBySeller: (sellerId: string) => Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;
  approveProduct: (id: string) => Promise<void>;
  rejectProduct: (id: string, reason: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const mapDbProductToProduct = (item: any): Product => {
    let images: string[] = [];
    if (Array.isArray(item.product_images) && item.product_images.length > 0) {
      images = item.product_images
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img: any) => img.public_url);
    } else if (item.thumbnail) {
      images = [item.thumbnail];
    } else {
      images = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];
    }

    return {
      id: item.id,
      seller_id: item.seller_id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      category: item.category,
      categorySlug: item.category_slug,
      subcategory: item.subcategory || undefined,
      price: Number(item.price),
      original_price: Number(item.original_price),
      discount: Number(item.discount) || 0,
      stock: Number(item.stock) || 0,
      sku: item.sku,
      brand: item.brand || undefined,
      specifications: item.specifications || {},
      thumbnail: item.thumbnail || images[0],
      images,
      rating: Number(item.rating) || 0,
      review_count: Number(item.review_count) || 0,
      is_active: item.is_active,
      is_featured: item.is_featured,
      is_new: item.is_new,
      is_flash_deal: item.is_flash_deal,
      status: item.status,
      rejection_reason: item.rejection_reason || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  };

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      let rawProducts: any[] | null = null;
      let rawImages: Record<string, any[]> = {};

      // 1. Attempt joined query first
      const { data: joinedData, error: joinedError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            storage_path,
            public_url,
            sort_order,
            is_thumbnail
          )
        `)
        .order('created_at', { ascending: false });

      if (joinedError) {
        // If schema cache relationship is missing, gracefully fallback to flat query
        console.warn('Notice: Joined product_images query unavailable, using resilient fallback:', joinedError.message);

        const { data: flatData, error: flatError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (flatError) {
          console.warn('Error fetching products from database:', flatError.message);
          setProducts([]);
          return;
        }

        rawProducts = flatData;

        // Try querying product_images independently if products exist
        if (rawProducts && rawProducts.length > 0) {
          try {
            const pIds = rawProducts.map((p: any) => p.id).filter(Boolean);
            if (pIds.length > 0) {
              const { data: imgData, error: imgError } = await supabase
                .from('product_images')
                .select('id, product_id, storage_path, public_url, sort_order, is_thumbnail')
                .in('product_id', pIds);

              if (!imgError && imgData) {
                imgData.forEach((img: any) => {
                  if (!rawImages[img.product_id]) rawImages[img.product_id] = [];
                  rawImages[img.product_id].push(img);
                });
              }
            }
          } catch {
            // Silently fallback to product's thumbnail
          }
        }
      } else {
        rawProducts = joinedData;
      }

      if (rawProducts && rawProducts.length > 0) {
        setProducts(
          rawProducts.map((item: any) => {
            const itemImages = item.product_images || rawImages[item.id] || [];
            return mapDbProductToProduct({
              ...item,
              product_images: itemImages,
            });
          })
        );
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('Products load exception:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, user]);

  const activeProducts = products.filter(
    (p) => p.is_active && (p.status === 'active' || !p.status)
  );

  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find((p) => p.slug === slug);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const getProductsByCategory = (categorySlug: string): Product[] => {
    if (categorySlug === 'all') return activeProducts;
    return activeProducts.filter((p) => p.categorySlug === categorySlug);
  };

  const getProductsBySeller = (sellerId: string): Product[] => {
    return products.filter((p) => p.seller_id === sellerId);
  };

  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product | null> => {
    if (!isSupabaseConfigured) {
      const msg = 'Product catalog service is temporarily unavailable. Please try again later.';
      toastError(msg);
      return null;
    }

    try {
      const initialStatus = user?.role === 'admin' ? 'active' : 'pending_review';
      const initialActive = user?.role === 'admin';

      const { data, error } = await supabase
        .from('products')
        .insert({
          seller_id: productData.seller_id,
          name: productData.name.trim(),
          slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: productData.description,
          category: productData.category,
          category_slug: productData.categorySlug,
          subcategory: productData.subcategory || null,
          price: productData.price,
          original_price: productData.original_price,
          discount: productData.discount,
          stock: productData.stock,
          sku: productData.sku,
          brand: productData.brand || null,
          specifications: productData.specifications || {},
          thumbnail: productData.thumbnail || productData.images[0] || null,
          is_active: initialActive,
          is_featured: productData.is_featured,
          is_new: productData.is_new,
          is_flash_deal: productData.is_flash_deal,
          status: initialStatus,
        })
        .select()
        .single();

      if (error) {
        toastError(error.message);
        return null;
      }

      // If images were uploaded, insert product_images records
      if (productData.images && productData.images.length > 0) {
        const imageInserts = productData.images.map((url, idx) => ({
          product_id: data.id,
          storage_path: url,
          public_url: url,
          sort_order: idx,
          is_thumbnail: idx === 0,
        }));
        await supabase.from('product_images').insert(imageInserts);
      }

      const created = mapDbProductToProduct({ ...data, product_images: [] });
      setProducts((prev) => [created, ...prev]);

      if (initialStatus === 'active') {
        success(`Product "${created.name}" is now live in store.`);
      } else {
        info(`Product "${created.name}" submitted for admin quality approval.`);
      }
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      toastError(msg);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!isSupabaseConfigured) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
      );
      success('Product updated.');
      return;
    }

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.original_price !== undefined) dbUpdates.original_price = updates.original_price;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.categorySlug !== undefined) dbUpdates.category_slug = updates.categorySlug;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
      if (updates.thumbnail !== undefined) dbUpdates.thumbnail = updates.thumbnail;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        toastError(error.message);
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      success('Product updated in database.');
    } catch (err) {
      console.error('Update product error:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isSupabaseConfigured) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      success('Product removed.');
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toastError(error.message);
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      success('Product deleted from database.');
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const toggleProductStatus = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const newActive = !prod.is_active;
    await updateProduct(id, { is_active: newActive });
  };

  const approveProduct = async (id: string) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized.');
      return;
    }

    if (!isSupabaseConfigured) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'active', is_active: true } : p))
      );
      success('Product approved.');
      return;
    }

    try {
      const { error } = await supabase.rpc('approve_product', { p_product_id: id });
      if (error) {
        await supabase
          .from('products')
          .update({ status: 'active', is_active: true, updated_at: new Date().toISOString() })
          .eq('id', id);
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'active', is_active: true } : p))
      );
      success('Product approved and published to store.');
    } catch (err) {
      console.error('Approve product error:', err);
    }
  };

  const rejectProduct = async (id: string, reason: string) => {
    if (!user || user.role !== 'admin') {
      toastError('Unauthorized.');
      return;
    }

    if (!isSupabaseConfigured) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'rejected', is_active: false, rejection_reason: reason } : p))
      );
      info('Product rejected.');
      return;
    }

    try {
      const { error } = await supabase.rpc('reject_product', { p_product_id: id, p_reason: reason });
      if (error) {
        await supabase
          .from('products')
          .update({ status: 'rejected', is_active: false, rejection_reason: reason, updated_at: new Date().toISOString() })
          .eq('id', id);
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'rejected', is_active: false, rejection_reason: reason } : p))
      );
      info('Product rejected.');
    } catch (err) {
      console.error('Reject product error:', err);
    }
  };

  const resetToDefault = async () => {
    await fetchProducts();
    info('Product catalog refreshed from database.');
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        activeProducts,
        isLoading,
        getProductBySlug,
        getProductById,
        getProductsByCategory,
        getProductsBySeller,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        approveProduct,
        rejectProduct,
        resetToDefault,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
