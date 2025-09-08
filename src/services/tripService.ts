import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { DieselPurchase, DieselPurchaseFormData } from '../types';

type Trip = Database['public']['Tables']['trips']['Row'];
type TripInsert = Database['public']['Tables']['trips']['Insert'];
type TripUpdate = Database['public']['Tables']['trips']['Update'];
type DieselPurchaseInsert = Database['public']['Tables']['diesel_purchases']['Insert'];
type DieselPurchaseUpdate = Database['public']['Tables']['diesel_purchases']['Update'];

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
    diesel_purchases: DieselPurchaseFormData[];
    fast_tag_cost: number;
    mcd_cost: number;
    green_tax_cost: number;
    commission_cost?: number;
    rto_cost?: number;
    dto_cost?: number;
    municipalities_cost?: number;
    border_cost?: number;
    repair_cost?: number;
  }): number {
    const dieselCost = trip.diesel_purchases.reduce((total, purchase) => {
      return total + (purchase.diesel_quantity * purchase.diesel_price_per_liter);
    }, 0);
    const splitCommissionSum = (trip.rto_cost || 0) + (trip.dto_cost || 0) + (trip.municipalities_cost || 0) + (trip.border_cost || 0);
    const totalCost = dieselCost + trip.fast_tag_cost + trip.mcd_cost + trip.green_tax_cost + (trip.commission_cost || 0) + splitCommissionSum + (trip.repair_cost || 0);
    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  },

  // Calculate diesel cost for a single purchase
  calculateDieselCost(purchase: DieselPurchaseFormData): number {
    return Math.round((purchase.diesel_quantity * purchase.diesel_price_per_liter) * 100) / 100;
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
          ),
          drivers (
            id,
            name
          ),
          diesel_purchases (
            id,
            state,
            city,
            diesel_quantity,
            diesel_price_per_liter,
            purchase_date,
            created_at,
            updated_at
          ),
          commission_events (
            id,
            state,
            authority_type,
            checkpoint,
            amount,
            event_time,
            notes,
            created_at,
            updated_at
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
          ),
          drivers (
            id,
            name
          ),
          diesel_purchases (
            id,
            state,
            city,
            diesel_quantity,
            diesel_price_per_liter,
            purchase_date,
            created_at,
            updated_at
          ),
          commission_events (
            id,
            state,
            authority_type,
            checkpoint,
            amount,
            event_time,
            notes,
            created_at,
            updated_at
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
          ),
          drivers (
            id,
            name
          ),
          diesel_purchases (
            id,
            state,
            city,
            diesel_quantity,
            diesel_price_per_liter,
            purchase_date,
            created_at,
            updated_at
          ),
          commission_events (
            id,
            state,
            authority_type,
            checkpoint,
            amount,
            event_time,
            notes,
            created_at,
            updated_at
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
  async createTrip(trip: Omit<TripInsert, 'user_id' | 'total_cost'> & { diesel_purchases: DieselPurchaseFormData[] }): Promise<Trip> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate total cost in JavaScript
      const totalCost = this.calculateTotalCost({
        diesel_purchases: trip.diesel_purchases,
        fast_tag_cost: trip.fast_tag_cost || 0,
        mcd_cost: trip.mcd_cost || 0,
        green_tax_cost: trip.green_tax_cost || 0,
        commission_cost: (trip as any).commission_cost || 0,
        rto_cost: (trip as any).rto_cost || 0,
        dto_cost: (trip as any).dto_cost || 0,
        municipalities_cost: (trip as any).municipalities_cost || 0,
        border_cost: (trip as any).border_cost || 0,
        repair_cost: (trip as any).repair_cost || 0,
      });

      // Create the trip first
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert([{ 
          truck_id: trip.truck_id,
          source: trip.source,
          destination: trip.destination,
          driver_id: (trip as any).driver_id ?? null,
          fast_tag_cost: trip.fast_tag_cost || 0,
          mcd_cost: trip.mcd_cost || 0,
          green_tax_cost: trip.green_tax_cost || 0,
          commission_cost: (trip as any).commission_cost || 0,
          rto_cost: (trip as any).rto_cost || 0,
          dto_cost: (trip as any).dto_cost || 0,
          municipalities_cost: (trip as any).municipalities_cost || 0,
          border_cost: (trip as any).border_cost || 0,
          repair_cost: (trip as any).repair_cost || 0,
          total_cost: totalCost,
          trip_date: trip.trip_date,
          user_id: user.id
        }])
        .select()
        .single();

      if (tripError) {
        handleAuthError(tripError);
        throw new Error(`Error creating trip: ${tripError.message}`);
      }

      // Create diesel purchases
      if (trip.diesel_purchases && trip.diesel_purchases.length > 0) {
        const dieselPurchases = trip.diesel_purchases.map(purchase => ({
          trip_id: tripData.id,
          state: purchase.state,
          city: purchase.city,
          diesel_quantity: purchase.diesel_quantity,
          diesel_price_per_liter: purchase.diesel_price_per_liter,
          purchase_date: purchase.purchase_date,
        }));

        const { error: dieselError } = await supabase
          .from('diesel_purchases')
          .insert(dieselPurchases);

        if (dieselError) {
          // If diesel purchases fail, delete the trip
          await supabase.from('trips').delete().eq('id', tripData.id);
          handleAuthError(dieselError);
          throw new Error(`Error creating diesel purchases: ${dieselError.message}`);
        }
      }

      // Fetch the complete trip with diesel purchases
      const created = await this.getTrip(tripData.id);
      // getTrip can return null in types; ensure non-null
      if (!created) {
        throw new Error('Trip creation succeeded but fetch failed');
      }
      return created as any;
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

      // If cost-related fields on trip are being updated, recalculate total cost
      if (updates.fast_tag_cost || updates.mcd_cost || updates.green_tax_cost || (updates as any).commission_cost || (updates as any).rto_cost || (updates as any).dto_cost || (updates as any).municipalities_cost || (updates as any).border_cost || (updates as any).repair_cost) {
        
        // Get current trip data
        const currentTrip = await this.getTrip(id);
        if (!currentTrip) {
          throw new Error('Trip not found');
        }

        // Merge current data with updates
        // Calculate new total cost using existing diesel purchases
        const dieselPurchases = (currentTrip as any).diesel_purchases || [];
        updates.total_cost = this.calculateTotalCost({
          diesel_purchases: dieselPurchases.map((p: any) => ({
            state: p.state,
            city: p.city || '',
            diesel_quantity: Number(p.diesel_quantity) || 0,
            diesel_price_per_liter: Number(p.diesel_price_per_liter) || 0,
            purchase_date: p.purchase_date,
          })),
          fast_tag_cost: updates.fast_tag_cost ?? currentTrip.fast_tag_cost,
          mcd_cost: updates.mcd_cost ?? currentTrip.mcd_cost,
          green_tax_cost: updates.green_tax_cost ?? currentTrip.green_tax_cost,
          commission_cost: (updates as any).commission_cost ?? (currentTrip as any).commission_cost ?? 0,
          rto_cost: (updates as any).rto_cost ?? (currentTrip as any).rto_cost ?? 0,
          dto_cost: (updates as any).dto_cost ?? (currentTrip as any).dto_cost ?? 0,
          municipalities_cost: (updates as any).municipalities_cost ?? (currentTrip as any).municipalities_cost ?? 0,
          border_cost: (updates as any).border_cost ?? (currentTrip as any).border_cost ?? 0,
          repair_cost: (updates as any).repair_cost ?? (currentTrip as any).repair_cost ?? 0,
        });
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
        .select(`
          total_cost,
          fast_tag_cost,
          mcd_cost,
          green_tax_cost,
          diesel_purchases (
            diesel_quantity,
            diesel_price_per_liter
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching trip stats: ${error.message}`);
      }

      const trips = data || [];
      const totalTrips = trips.length;
      const totalCost = trips.reduce((sum, trip) => sum + Number(trip.total_cost), 0);
      const totalDiesel = trips.reduce((sum, trip: any) => {
        const qty = (trip.diesel_purchases || []).reduce(
          (s: number, p: any) => s + Number(p.diesel_quantity || 0),
          0
        );
        return sum + qty;
      }, 0);
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
        .select(`
          total_cost,
          diesel_purchases (
            diesel_quantity,
            diesel_price_per_liter
          )
        `)
        .eq('truck_id', truckId)
        .eq('user_id', user.id);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error fetching truck trip stats: ${error.message}`);
      }

      const trips = data || [];
      const totalTrips = trips.length;
      const totalCost = trips.reduce((sum, trip) => sum + Number(trip.total_cost), 0);
      
      // Calculate total diesel from all purchases
      const totalDiesel = trips.reduce((sum, trip) => {
        const dieselFromPurchases = trip.diesel_purchases?.reduce((dieselSum, purchase) => {
          return dieselSum + Number(purchase.diesel_quantity);
        }, 0) || 0;
        return sum + dieselFromPurchases;
      }, 0);
      
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

  // Add a diesel purchase to an existing trip
  async addDieselPurchase(tripId: string, purchase: Omit<DieselPurchaseInsert, 'trip_id'>): Promise<DieselPurchase> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify the trip belongs to the user
      const trip = await this.getTrip(tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const { data, error } = await supabase
        .from('diesel_purchases')
        .insert([{ 
          ...purchase, 
          trip_id: tripId
        }])
        .select()
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error adding diesel purchase: ${error.message}`);
      }

      // Recalculate and update trip total cost
      const updatedTrip = await this.getTrip(tripId);
      if (updatedTrip && updatedTrip.diesel_purchases) {
        const newTotalCost = this.calculateTotalCost({
          diesel_purchases: updatedTrip.diesel_purchases.map(p => ({
            state: p.state,
            city: p.city || '',
            diesel_quantity: p.diesel_quantity,
            diesel_price_per_liter: p.diesel_price_per_liter,
            purchase_date: p.purchase_date,
          })),
          fast_tag_cost: updatedTrip.fast_tag_cost,
          mcd_cost: updatedTrip.mcd_cost,
          green_tax_cost: updatedTrip.green_tax_cost,
        });

        await supabase
          .from('trips')
          .update({ total_cost: newTotalCost })
          .eq('id', tripId);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Commission events CRUD
  async addCommissionEvent(tripId: string, event: { state: string; authority_type: string; checkpoint?: string; amount: number; notes?: string; event_time?: string; }): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure trip belongs to user
      const trip = await this.getTrip(tripId);
      if (!trip) throw new Error('Trip not found');

      const { data, error } = await supabase
        .from('commission_events')
        .insert([{ ...event, trip_id: tripId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  async updateCommissionEvent(eventId: string, updates: Partial<{ state: string; authority_type: string; checkpoint?: string; amount: number; notes?: string; event_time?: string; }>): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('commission_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  async deleteCommissionEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('commission_events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  async getCommissionEvents(tripId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('commission_events')
        .select('*')
        .eq('trip_id', tripId)
        .order('event_time', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Update a diesel purchase
  async updateDieselPurchase(purchaseId: string, updates: DieselPurchaseUpdate): Promise<DieselPurchase> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the purchase to find the trip_id
      const { data: purchase, error: purchaseError } = await supabase
        .from('diesel_purchases')
        .select('trip_id')
        .eq('id', purchaseId)
        .single();

      if (purchaseError || !purchase) {
        throw new Error('Diesel purchase not found');
      }

      // Verify the trip belongs to the user
      const trip = await this.getTrip(purchase.trip_id);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const { data, error } = await supabase
        .from('diesel_purchases')
        .update(updates)
        .eq('id', purchaseId)
        .select()
        .single();

      if (error) {
        handleAuthError(error);
        throw new Error(`Error updating diesel purchase: ${error.message}`);
      }

      // Recalculate and update trip total cost
      const updatedTrip = await this.getTrip(purchase.trip_id);
      if (updatedTrip && updatedTrip.diesel_purchases) {
        const newTotalCost = this.calculateTotalCost({
          diesel_purchases: updatedTrip.diesel_purchases.map(p => ({
            state: p.state,
            city: p.city || '',
            diesel_quantity: p.diesel_quantity,
            diesel_price_per_liter: p.diesel_price_per_liter,
            purchase_date: p.purchase_date,
          })),
          fast_tag_cost: updatedTrip.fast_tag_cost,
          mcd_cost: updatedTrip.mcd_cost,
          green_tax_cost: updatedTrip.green_tax_cost,
        });

        await supabase
          .from('trips')
          .update({ total_cost: newTotalCost })
          .eq('id', purchase.trip_id);
      }

      return data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Delete a diesel purchase
  async deleteDieselPurchase(purchaseId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the purchase to find the trip_id
      const { data: purchase, error: purchaseError } = await supabase
        .from('diesel_purchases')
        .select('trip_id')
        .eq('id', purchaseId)
        .single();

      if (purchaseError || !purchase) {
        throw new Error('Diesel purchase not found');
      }

      // Verify the trip belongs to the user
      const trip = await this.getTrip(purchase.trip_id);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const { error } = await supabase
        .from('diesel_purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) {
        handleAuthError(error);
        throw new Error(`Error deleting diesel purchase: ${error.message}`);
      }

      // Recalculate and update trip total cost
      const updatedTrip = await this.getTrip(purchase.trip_id);
      if (updatedTrip && updatedTrip.diesel_purchases) {
        const newTotalCost = this.calculateTotalCost({
          diesel_purchases: updatedTrip.diesel_purchases.map(p => ({
            state: p.state,
            city: p.city || '',
            diesel_quantity: p.diesel_quantity,
            diesel_price_per_liter: p.diesel_price_per_liter,
            purchase_date: p.purchase_date,
          })),
          fast_tag_cost: updatedTrip.fast_tag_cost,
          mcd_cost: updatedTrip.mcd_cost,
          green_tax_cost: updatedTrip.green_tax_cost,
        });

        await supabase
          .from('trips')
          .update({ total_cost: newTotalCost })
          .eq('id', purchase.trip_id);
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
};
