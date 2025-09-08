import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL and/or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
    storageKey: 'triptracker-auth-token',
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
          driver_id: string | null;
          fast_tag_cost: number;
          mcd_cost: number;
          green_tax_cost: number;
          commission_cost: number;
          rto_cost: number;
          dto_cost: number;
          municipalities_cost: number;
          border_cost: number;
          repair_cost: number;
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
          driver_id?: string | null;
          fast_tag_cost: number;
          mcd_cost: number;
          green_tax_cost: number;
          commission_cost: number;
          rto_cost?: number;
          dto_cost?: number;
          municipalities_cost?: number;
          border_cost?: number;
          repair_cost: number;
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
          driver_id?: string | null;
          fast_tag_cost?: number;
          mcd_cost?: number;
          green_tax_cost?: number;
          commission_cost?: number;
          rto_cost?: number;
          dto_cost?: number;
          municipalities_cost?: number;
          border_cost?: number;
          repair_cost?: number;
          total_cost?: number;
          trip_date?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      diesel_purchases: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          city: string | null;
          diesel_quantity: number;
          diesel_price_per_liter: number;
          purchase_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          city?: string | null;
          diesel_quantity: number;
          diesel_price_per_liter: number;
          purchase_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          city?: string | null;
          diesel_quantity?: number;
          diesel_price_per_liter?: number;
          purchase_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      commission_events: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          authority_type: string;
          checkpoint: string | null;
          amount: number;
          currency: string | null;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          authority_type: string;
          checkpoint?: string | null;
          amount: number;
          currency?: string | null;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          authority_type?: string;
          checkpoint?: string | null;
          amount?: number;
          currency?: string | null;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      repair_events: {
        Row: {
          id: string;
          trip_id: string;
          part_or_defect: string;
          amount: number;
          currency: string | null;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          part_or_defect: string;
          amount: number;
          currency?: string | null;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          part_or_defect?: string;
          amount?: number;
          currency?: string | null;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          age: number | null;
          phone: string | null;
          license_number: string | null;
          license_image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age?: number | null;
          phone?: string | null;
          license_number?: string | null;
          license_image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number | null;
          phone?: string | null;
          license_number?: string | null;
          license_image_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
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
