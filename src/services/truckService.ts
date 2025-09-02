import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Truck = Database['public']['Tables']['trucks']['Row'];
type TruckInsert = Database['public']['Tables']['trucks']['Insert'];
type TruckUpdate = Database['public']['Tables']['trucks']['Update'];

export const truckService = {
  // Get all trucks for the current user
  async getTrucks(): Promise<Truck[]> {
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching trucks: ${error.message}`);
    }

    return data || [];
  },

  // Get a single truck by ID
  async getTruck(id: string): Promise<Truck | null> {
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching truck: ${error.message}`);
    }

    return data;
  },

  // Create a new truck
  async createTruck(truck: Omit<TruckInsert, 'user_id'>): Promise<Truck> {
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
      throw new Error(`Error creating truck: ${error.message}`);
    }

    return data;
  },

  // Update an existing truck
  async updateTruck(id: string, updates: TruckUpdate): Promise<Truck> {
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('trucks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating truck: ${error.message}`);
    }

    return data;
  },

  // Delete a truck
  async deleteTruck(id: string): Promise<void> {
    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting truck: ${error.message}`);
    }
  },

  // Check if truck number already exists for the current user
  async isTruckNumberExists(truckNumber: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('trucks')
      .select('id')
      .eq('truck_number', truckNumber);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error checking truck number: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  },
};
