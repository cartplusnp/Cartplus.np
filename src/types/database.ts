export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: 'customer' | 'seller' | 'admin';
          status: 'active' | 'suspended' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: 'customer' | 'seller' | 'admin';
          status?: 'active' | 'suspended' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: 'customer' | 'seller' | 'admin';
          status?: 'active' | 'suspended' | 'blocked';
          updated_at?: string;
        };
      };
      seller_profiles: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          owner_name: string;
          email: string;
          phone: string;
          pan_vat_number: string;
          province: string;
          district: string;
          city: string;
          address: string;
          status: 'pending' | 'under_review' | 'verified' | 'active' | 'rejected' | 'suspended';
          commission_rate: number;
          rating: number;
          total_sales: number;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          verification_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          owner_name: string;
          email: string;
          phone: string;
          pan_vat_number: string;
          province: string;
          district: string;
          city: string;
          address: string;
          status?: 'pending' | 'under_review' | 'verified' | 'active' | 'rejected' | 'suspended';
          commission_rate?: number;
          rating?: number;
          total_sales?: number;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          verification_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_name?: string;
          owner_name?: string;
          email?: string;
          phone?: string;
          pan_vat_number?: string;
          province?: string;
          district?: string;
          city?: string;
          address?: string;
          status?: 'pending' | 'under_review' | 'verified' | 'active' | 'rejected' | 'suspended';
          commission_rate?: number;
          rating?: number;
          total_sales?: number;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          verification_notes?: string | null;
          updated_at?: string;
        };
      };
      seller_bank_accounts: {
        Row: {
          id: string;
          seller_id: string;
          bank_name: string;
          account_holder: string;
          account_number: string;
          branch_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          bank_name: string;
          account_holder: string;
          account_number: string;
          branch_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          bank_name?: string;
          account_holder?: string;
          account_number?: string;
          branch_name?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          icon_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          icon_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          icon_name?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          slug: string;
          description: string;
          category_id: string | null;
          category: string;
          category_slug: string;
          subcategory: string | null;
          price: number;
          original_price: number;
          discount: number;
          stock: number;
          sku: string;
          brand: string | null;
          specifications: Record<string, string> | null;
          thumbnail: string | null;
          rating: number;
          review_count: number;
          is_active: boolean;
          is_featured: boolean;
          is_new: boolean;
          is_flash_deal: boolean;
          status: 'draft' | 'pending_review' | 'active' | 'rejected' | 'inactive';
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          slug: string;
          description: string;
          category_id?: string | null;
          category: string;
          category_slug: string;
          subcategory?: string | null;
          price: number;
          original_price: number;
          discount?: number;
          stock?: number;
          sku: string;
          brand?: string | null;
          specifications?: Record<string, string> | null;
          thumbnail?: string | null;
          rating?: number;
          review_count?: number;
          is_active?: boolean;
          is_featured?: boolean;
          is_new?: boolean;
          is_flash_deal?: boolean;
          status?: 'draft' | 'pending_review' | 'active' | 'rejected' | 'inactive';
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          name?: string;
          slug?: string;
          description?: string;
          category_id?: string | null;
          category?: string;
          category_slug?: string;
          subcategory?: string | null;
          price?: number;
          original_price?: number;
          discount?: number;
          stock?: number;
          sku?: string;
          brand?: string | null;
          specifications?: Record<string, string> | null;
          thumbnail?: string | null;
          rating?: number;
          review_count?: number;
          is_active?: boolean;
          is_featured?: boolean;
          is_new?: boolean;
          is_flash_deal?: boolean;
          status?: 'draft' | 'pending_review' | 'active' | 'rejected' | 'inactive';
          rejection_reason?: string | null;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          sort_order: number;
          is_thumbnail: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          sort_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          public_url?: string;
          sort_order?: number;
          is_thumbnail?: boolean;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          province: string;
          district: string;
          municipality: string;
          ward: string | null;
          street: string;
          landmark: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          province: string;
          district: string;
          municipality: string;
          ward?: string | null;
          street: string;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          province?: string;
          district?: string;
          municipality?: string;
          ward?: string | null;
          street?: string;
          landmark?: string | null;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          delivery_address: Json;
          subtotal: number;
          discount: number;
          delivery_fee: number;
          total: number;
          payment_method: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cod_pending';
          order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected';
          notes: string | null;
          courier_info: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          delivery_address: Json;
          subtotal: number;
          discount?: number;
          delivery_fee?: number;
          total: number;
          payment_method: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cod_pending';
          order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected';
          notes?: string | null;
          courier_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          delivery_address?: Json;
          subtotal?: number;
          discount?: number;
          delivery_fee?: number;
          total?: number;
          payment_method?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cod_pending';
          order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected';
          notes?: string | null;
          courier_info?: Json | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          seller_id: string | null;
          product_name: string;
          sku: string;
          price: number;
          original_price: number | null;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          seller_id?: string | null;
          product_name: string;
          sku: string;
          price: number;
          original_price?: number | null;
          quantity: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          seller_id?: string | null;
          product_name?: string;
          sku?: string;
          price?: number;
          original_price?: number | null;
          quantity?: number;
          subtotal?: number;
        };
      };
      order_tracking_events: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          title: string;
          description: string;
          location: string;
          tracking_number: string | null;
          courier_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          title: string;
          description: string;
          location: string;
          tracking_number?: string | null;
          courier_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          title?: string;
          description?: string;
          location?: string;
          tracking_number?: string | null;
          courier_name?: string | null;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_id: string | null;
          rating: number;
          title: string;
          review_text: string;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_id?: string | null;
          rating: number;
          title: string;
          review_text: string;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          order_id?: string | null;
          rating?: number;
          title?: string;
          review_text?: string;
          is_approved?: boolean;
          updated_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
        };
      };
      support_requests: {
        Row: {
          id: string;
          ticket_number: string;
          user_id: string | null;
          category: string;
          order_id: string | null;
          subject: string;
          message: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_number: string;
          user_id?: string | null;
          category: string;
          order_id?: string | null;
          subject: string;
          message: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          user_id?: string | null;
          category?: string;
          order_id?: string | null;
          subject?: string;
          message?: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          updated_at?: string;
        };
      };
      support_messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string | null;
          sender_role: 'customer' | 'support' | 'admin' | 'seller';
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          sender_id?: string | null;
          sender_role: 'customer' | 'support' | 'admin' | 'seller';
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          sender_id?: string | null;
          sender_role?: 'customer' | 'support' | 'admin' | 'seller';
          message?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          product_id: string | null;
          order_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          product_id?: string | null;
          order_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          product_id?: string | null;
          order_id?: string | null;
          is_read?: boolean;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
        };
      };
      marketplace_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
        };
      };
      seller_payouts: {
        Row: {
          id: string;
          seller_id: string;
          gross_amount: number;
          commission: number;
          net_amount: number;
          status: 'pending' | 'processing' | 'completed' | 'cancelled';
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          gross_amount?: number;
          commission?: number;
          net_amount?: number;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          seller_id?: string;
          gross_amount?: number;
          commission?: number;
          net_amount?: number;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled';
          paid_at?: string | null;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: { check_user_id?: string };
        Returns: boolean;
      };
      create_order: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_email: string;
          p_delivery_address: Json;
          p_payment_method: string;
          p_notes: string;
          p_items: Json;
        };
        Returns: Json;
      };
      restore_stock_on_cancel: {
        Args: { p_order_id: string };
        Returns: boolean;
      };
      admin_update_order_status: {
        Args: {
          p_order_id: string;
          p_status: string;
          p_notes?: string;
          p_location?: string;
          p_courier_name?: string;
          p_tracking_number?: string;
        };
        Returns: boolean;
      };
      approve_seller: {
        Args: {
          p_seller_id: string;
          p_commission_rate?: number;
          p_notes?: string;
        };
        Returns: boolean;
      };
      reject_seller: {
        Args: {
          p_seller_id: string;
          p_reason: string;
        };
        Returns: boolean;
      };
      approve_product: {
        Args: { p_product_id: string };
        Returns: boolean;
      };
      reject_product: {
        Args: {
          p_product_id: string;
          p_reason: string;
        };
        Returns: boolean;
      };
    };
  };
}
