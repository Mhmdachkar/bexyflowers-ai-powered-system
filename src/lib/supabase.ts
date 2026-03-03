import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will be generated from Supabase schema)
export type Database = {
  public: {
    Tables: {
      signature_collections: {
        Row: {
          id: string;
          product_id: string;
          display_order: number;
          is_active: boolean;
          custom_title: string | null;
          custom_description: string | null;
          custom_price: number | null;
          discount_percentage: number | null;
          is_out_of_stock: boolean;
          is_best_selling: boolean;
          tags: string[];
          custom_image_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          display_order: number;
          is_active?: boolean;
          custom_title?: string | null;
          custom_description?: string | null;
          custom_price?: number | null;
          discount_percentage?: number | null;
          is_out_of_stock?: boolean;
          is_best_selling?: boolean;
          tags?: string[];
          custom_image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          display_order?: number;
          is_active?: boolean;
          custom_title?: string | null;
          custom_description?: string | null;
          custom_price?: number | null;
          discount_percentage?: number | null;
          is_out_of_stock?: boolean;
          is_best_selling?: boolean;
          tags?: string[];
          custom_image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          category: string | null;
          display_category: string | null;
          featured: boolean;
          tags: string[];
          image_urls: string[];
          is_active: boolean;
          is_out_of_stock: boolean;
          discount_percentage: number | null;
          flower_type: 'eternal' | 'real' | 'mixed';
          collection_year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          category?: string | null;
          display_category?: string | null;
          featured?: boolean;
          tags?: string[];
          image_urls?: string[];
          is_active?: boolean;
          is_out_of_stock?: boolean;
          discount_percentage?: number | null;
          flower_type?: 'eternal' | 'real' | 'mixed';
          collection_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          category?: string | null;
          display_category?: string | null;
          featured?: boolean;
          tags?: string[];
          image_urls?: string[];
          is_active?: boolean;
          is_out_of_stock?: boolean;
          discount_percentage?: number | null;
          flower_type?: 'eternal' | 'real' | 'mixed';
          collection_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      luxury_boxes: {
        Row: {
          id: string;
          name: string;
          type: 'box' | 'wrap';
          price: number;
          description: string | null;
          quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'box' | 'wrap';
          price: number;
          description?: string | null;
          quantity: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'box' | 'wrap';
          price?: number;
          description?: string | null;
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      box_colors: {
        Row: {
          id: string;
          box_id: string;
          name: string;
          color_hex: string;
          gradient_css: string | null;
          quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          box_id: string;
          name: string;
          color_hex: string;
          gradient_css?: string | null;
          quantity: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          box_id?: string;
          name?: string;
          color_hex?: string;
          gradient_css?: string | null;
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      box_sizes: {
        Row: {
          id: string;
          box_id: string;
          name: string;
          capacity: number;
          price: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          box_id: string;
          name: string;
          capacity: number;
          price: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          box_id?: string;
          name?: string;
          capacity?: number;
          price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      flower_types: {
        Row: {
          id: string;
          name: string;
          title: string | null;
          price_per_stem: number;
          image_url: string | null;
          quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          title?: string | null;
          price_per_stem: number;
          image_url?: string | null;
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          title?: string | null;
          price_per_stem?: number;
          image_url?: string | null;
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      flower_colors: {
        Row: {
          id: string;
          flower_id: string;
          name: string;
          color_value: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flower_id: string;
          name: string;
          color_value: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          flower_id?: string;
          name?: string;
          color_value?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      accessories: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string | null;
          image_url: string | null;
          quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          description?: string | null;
          image_url?: string | null;
          quantity: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          description?: string | null;
          image_url?: string | null;
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wedding_creations: {
        Row: {
          id: string;
          image_url: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

