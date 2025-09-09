import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Truck = Database['public']['Tables']['trucks']['Row'];
type TruckInsert = Database['public']['Tables']['trucks']['Insert'];
type TruckUpdate = Database['public']['Tables']['trucks']['Update'];

// Helper function to handle auth errors
const handleAuthError = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as { message: string }).message;
    if (errorMessage.includes('JWT expired') || errorMessage.includes('Invalid JWT')) {
      throw new Error('Session expired. Please sign in again.');
    }
  }
  throw error;
};

export const truckService = {
  // Get all trucks for the current user
  async getTrucks(): Promise<Truck[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching trucks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get a single truck by ID
  async getTruck(id: string): Promise<Truck | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching truck: ${error.message}`);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Create a new truck
  async createTruck(truck: Omit<TruckInsert, 'user_id'>): Promise<Truck> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trucks')
        .insert([{ 
          ...truck, 
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error creating truck: ${error.message}`);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Update an existing truck
  async updateTruck(id: string, updates: TruckUpdate): Promise<Truck> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('trucks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error updating truck: ${error.message}`);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Delete a truck
  async deleteTruck(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error deleting truck: ${error.message}`);
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Check if truck number already exists for the current user
  async isTruckNumberExists(truckNumber: string, excludeId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('trucks')
        .select('id')
        .eq('truck_number', truckNumber)
        .eq('user_id', user.id);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        handleAuthError(error);
        throw new Error(`Error checking truck number: ${error.message}`);
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
};
