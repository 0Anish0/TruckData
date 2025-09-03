import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
    storageKey: 'truckfleet-auth-token',
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      trucks: {
        Row: {
          id: string;
          name: string;
          truck_number: string;
          model: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          truck_number: string;
          model: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          truck_number?: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          truck_id: string;
          source: string;
          destination: string;
          diesel_quantity: number;
          diesel_price_per_liter: number;
          fast_tag_cost: number;
          mcd_cost: number;
          green_tax_cost: number;
          total_cost: number;
          trip_date: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          truck_id: string;
          source: string;
          destination: string;
          diesel_quantity: number;
          diesel_price_per_liter: number;
          fast_tag_cost: number;
          mcd_cost: number;
          green_tax_cost: number;
          total_cost: number;
          trip_date: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          truck_id?: string;
          source?: string;
          destination?: string;
          diesel_quantity?: number;
          diesel_price_per_liter?: number;
          fast_tag_cost?: number;
          mcd_cost?: number;
          green_tax_cost?: number;
          total_cost?: number;
          trip_date?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
