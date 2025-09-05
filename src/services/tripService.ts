import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Trip = Database['public']['Tables']['trips']['Row'];
type TripInsert = Database['public']['Tables']['trips']['Insert'];
type TripUpdate = Database['public']['Tables']['trips']['Update'];

// Helper function to handle auth errors
const handleAuthError = (error: any) => {
  if (error?.message?.includes('JWT expired') || error?.message?.includes('Invalid JWT')) {
    throw new Error('Session expired. Please sign in again.');
  }
  throw error;
};

export const tripService = {
  // Debug function to check database state
  async debugDatabaseState() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Debug - Current user ID:', user?.id);
      
      // Check all trips in database
      const { data: allTrips, error: allTripsError } = await supabase
        .from('trips')
        .select('id, user_id, total_cost, source, destination');
      
      console.log('Debug - All trips in database:', allTrips);
      console.log('Debug - All trips error:', allTripsError);
      
      // Check trips for current user
      if (user) {
        const { data: userTrips, error: userTripsError } = await supabase
          .from('trips')
          .select('id, user_id, total_cost, source, destination')
          .eq('user_id', user.id);
        
        console.log('Debug - User trips:', userTrips);
        console.log('Debug - User trips error:', userTripsError);
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
  },

  // Calculate total cost for a trip
  calculateTotalCost(trip: {
    diesel_quantity: number;
    diesel_price_per_liter: number;
    fast_tag_cost: number;
    mcd_cost: number;
    green_tax_cost: number;
  }): number {
    const dieselCost = trip.diesel_quantity * trip.diesel_price_per_liter;
    const totalCost = dieselCost + trip.fast_tag_cost + trip.mcd_cost + trip.green_tax_cost;
    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  },

  // Get all trips for the current user
  async getTrips(): Promise<Trip[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks (
            id,
            name,
            truck_number,
            model,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('trip_date', { ascending: false });

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching trips: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get trips for a specific truck
  async getTripsByTruck(truckId: string): Promise<Trip[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks (
            id,
            name,
            truck_number,
            model,
            user_id
          )
        `)
        .eq('truck_id', truckId)
        .eq('user_id', user.id)
        .order('trip_date', { ascending: false });

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching truck trips: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get a single trip by ID
  async getTrip(id: string): Promise<Trip | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks (
            id,
            name,
            truck_number,
            model,
            user_id
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching trip: ${error.message}`);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Create a new trip
  async createTrip(trip: Omit<TripInsert, 'user_id' | 'total_cost'>): Promise<Trip> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate total cost in JavaScript
      const totalCost = this.calculateTotalCost(trip);

      const { data, error } = await supabase
        .from('trips')
        .insert([{ 
          ...trip, 
          user_id: user.id,
          total_cost: totalCost
        }])
        .select()
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error creating trip: ${error.message}`);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Update an existing trip
  async updateTrip(id: string, updates: TripUpdate): Promise<Trip> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // If cost-related fields are being updated, recalculate total cost
      if (updates.diesel_quantity || updates.diesel_price_per_liter || 
          updates.fast_tag_cost || updates.mcd_cost || updates.green_tax_cost) {
        
        // Get current trip data
        const currentTrip = await this.getTrip(id);
        if (!currentTrip) {
          throw new Error('Trip not found');
        }

        // Merge current data with updates
        const updatedTrip = {
          diesel_quantity: updates.diesel_quantity ?? currentTrip.diesel_quantity,
          diesel_price_per_liter: updates.diesel_price_per_liter ?? currentTrip.diesel_price_per_liter,
          fast_tag_cost: updates.fast_tag_cost ?? currentTrip.fast_tag_cost,
          mcd_cost: updates.mcd_cost ?? currentTrip.mcd_cost,
          green_tax_cost: updates.green_tax_cost ?? currentTrip.green_tax_cost,
        };

        // Calculate new total cost
        updates.total_cost = this.calculateTotalCost(updatedTrip);
      }

      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error updating trip: ${error.message}`);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Delete a trip
  async deleteTrip(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error deleting trip: ${error.message}`);
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get trip statistics for the current user
  async getTripStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .select('total_cost, diesel_quantity, diesel_price_per_liter')
        .eq('user_id', user.id);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching trip stats: ${error.message}`);
      }

      const trips = data || [];
      const totalTrips = trips.length;
      const totalCost = trips.reduce((sum, trip) => sum + Number(trip.total_cost), 0);
      const totalDiesel = trips.reduce((sum, trip) => sum + Number(trip.diesel_quantity), 0);
      const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

      return {
        totalTrips,
        totalCost,
        totalDiesel,
        avgCost,
      };
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get trip statistics for a specific truck
  async getTruckTripStats(truckId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .select('total_cost, diesel_quantity, diesel_price_per_liter')
        .eq('truck_id', truckId)
        .eq('user_id', user.id);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching truck trip stats: ${error.message}`);
      }

      const trips = data || [];
      const totalTrips = trips.length;
      const totalCost = trips.reduce((sum, trip) => sum + Number(trip.total_cost), 0);
      const totalDiesel = trips.reduce((sum, trip) => sum + Number(trip.diesel_quantity), 0);
      const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

      return {
        totalTrips,
        totalCost,
        totalDiesel,
        avgCost,
      };
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
};
