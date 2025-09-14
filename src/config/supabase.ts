import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Read from environment variables
const supabaseUrl = SUPABASE_URL || 'https://fskxxlzqqhczzwowduat.supabase.co';
const supabaseAnonKey = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZza3h4bHpxcWhjenp3b3dkdWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Your_Complete_Anon_Key_Here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trucks: {
        Row: {
          id: string;
          name: string;
          truck_number: string;
          model: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          truck_number: string;
          model: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          truck_number?: string;
          model?: string;
          user_id?: string;
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
      trips: {
        Row: {
          id: string;
          truck_id: string;
          driver_id: string | null;
          source: string;
          destination: string;
          fast_tag_cost: number;
          mcd_cost: number;
          green_tax_cost: number;
          rto_cost: number;
          dto_cost: number;
          municipalities_cost: number;
          border_cost: number;
          repair_cost: number;
          total_cost: number;
          trip_date: string;
          start_date: string;
          end_date: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          truck_id: string;
          driver_id?: string | null;
          source: string;
          destination: string;
          fast_tag_cost?: number;
          mcd_cost?: number;
          green_tax_cost?: number;
          rto_cost?: number;
          dto_cost?: number;
          municipalities_cost?: number;
          border_cost?: number;
          repair_cost?: number;
          total_cost?: number;
          trip_date?: string;
          start_date: string;
          end_date: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          truck_id?: string;
          driver_id?: string | null;
          source?: string;
          destination?: string;
          fast_tag_cost?: number;
          mcd_cost?: number;
          green_tax_cost?: number;
          rto_cost?: number;
          dto_cost?: number;
          municipalities_cost?: number;
          border_cost?: number;
          repair_cost?: number;
          total_cost?: number;
          trip_date?: string;
          start_date?: string;
          end_date?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
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
      fast_tag_events: {
        Row: {
          id: string;
          trip_id: string;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mcd_events: {
        Row: {
          id: string;
          trip_id: string;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      green_tax_events: {
        Row: {
          id: string;
          trip_id: string;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rto_events: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          checkpoint: string | null;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          checkpoint?: string | null;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          checkpoint?: string | null;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      dto_events: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          checkpoint: string | null;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          checkpoint?: string | null;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          checkpoint?: string | null;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      municipalities_events: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          checkpoint: string | null;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          checkpoint?: string | null;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          checkpoint?: string | null;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      border_events: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          checkpoint: string | null;
          amount: number;
          event_time: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          checkpoint?: string | null;
          amount: number;
          event_time: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          checkpoint?: string | null;
          amount?: number;
          event_time?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      repair_items: {
        Row: {
          id: string;
          trip_id: string;
          state: string;
          checkpoint: string | null;
          part_or_defect: string;
          amount: number;
          notes: string | null;
          event_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          state: string;
          checkpoint?: string | null;
          part_or_defect: string;
          amount: number;
          notes?: string | null;
          event_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          state?: string;
          checkpoint?: string | null;
          part_or_defect?: string;
          amount?: number;
          notes?: string | null;
          event_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
