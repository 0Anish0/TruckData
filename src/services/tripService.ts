import { supabase } from '../config/supabase';
import { 
  Trip, 
  TripWithRelations, 
  TripFormData, 
  DashboardStats
} from '../types';
import { SupabaseService } from './supabaseService';

export class TripService extends SupabaseService {
  async getTrips(): Promise<Trip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks: truck_id (
            id,
            name,
            truck_number,
            model
          ),
          drivers: driver_id (
            id,
            name
          )
        `)
        .eq('user_id', await this.getUserId())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return this.handleError(error, 'Get trips');
    }
  }

  async getTrip(id: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks: truck_id (
            id,
            name,
            truck_number,
            model
          ),
          drivers: driver_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .eq('user_id', await this.getUserId())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Get trip');
    }
  }

  async getTripsByTruck(truckId: string): Promise<TripWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks: truck_id (
            id,
            name,
            truck_number,
            model
          ),
          drivers: driver_id (
            id,
            name
          )
        `)
        .eq('truck_id', truckId)
        .eq('user_id', await this.getUserId())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return this.handleError(error, 'Get trips by truck');
    }
  }

  async createTrip(tripData: TripFormData): Promise<Trip> {
    try {
      // Calculate costs locally
      const calculatedCosts = this.calculateTripCosts(tripData);

      // Create trip with calculated costs
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          truck_id: tripData.truck_id,
          driver_id: tripData.driver_id || null,
          source: tripData.source,
          destination: tripData.destination,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          trip_date: tripData.start_date, // Use start_date as trip_date
          ...calculatedCosts,
          user_id: await this.getUserId(),
        })
        .select()
        .single();

      if (tripError) {
        throw tripError;
      }

      // Insert diesel purchases
      if (tripData.diesel_purchases.length > 0) {
        const dieselData = tripData.diesel_purchases.map(purchase => ({
          trip_id: trip.id,
          state: purchase.state,
          city: purchase.city || null,
          diesel_quantity: purchase.diesel_quantity,
          diesel_price_per_liter: purchase.diesel_price_per_liter,
          purchase_date: purchase.purchase_date,
        }));

        const { error: dieselError } = await supabase
          .from('diesel_purchases')
          .insert(dieselData);

        if (dieselError) {
          console.error('Error inserting diesel purchases:', dieselError);
        }
      }

      // Insert all event types
      await this.insertEventData(trip.id, tripData);

      return trip;
    } catch (error) {
      return this.handleError(error, 'Create trip');
    }
  }

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          ...tripData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', await this.getUserId())
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Update trip');
    }
  }

  async deleteTrip(id: string): Promise<void> {
    try {
      // Delete all related data first (cascade should handle this, but being explicit)
      await this.deleteTripRelatedData(id);

      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)
        .eq('user_id', await this.getUserId());

      if (error) {
        throw error;
      }
    } catch (error) {
      return this.handleError(error, 'Delete trip');
    }
  }

  async getTripStats(): Promise<DashboardStats> {
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select('total_cost')
        .eq('user_id', await this.getUserId());

      if (error) {
        throw error;
      }

      const { data: dieselData, error: dieselError } = await supabase
        .from('diesel_purchases')
        .select('diesel_quantity')
        .eq('user_id', await this.getUserId());

      if (dieselError) {
        console.error('Error fetching diesel data:', dieselError);
      }

      const totalTrips = trips?.length || 0;
      const totalCost = trips?.reduce((sum, trip) => sum + trip.total_cost, 0) || 0;
      const totalDiesel = dieselData?.reduce((sum, purchase) => sum + purchase.diesel_quantity, 0) || 0;
      const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

      return {
        totalTrips,
        totalCost,
        totalDiesel,
        avgCost,
      };
    } catch (error) {
      return this.handleError(error, 'Get trip stats');
    }
  }

  async getTruckTripStats(truckId: string) {
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select('total_cost')
        .eq('truck_id', truckId)
        .eq('user_id', await this.getUserId());

      if (error) {
        throw error;
      }

      const totalTrips = trips?.length || 0;
      const totalCost = trips?.reduce((sum, trip) => sum + trip.total_cost, 0) || 0;
      const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

      return {
        totalTrips,
        totalCost,
        avgCost,
      };
    } catch (error) {
      return this.handleError(error, 'Get truck trip stats');
    }
  }

  private async insertEventData(tripId: string, tripData: TripFormData): Promise<void> {
    const eventPromises = [];

    // Insert Fast Tag events
    if (tripData.fast_tag_costs.length > 0) {
      const fastTagData = tripData.fast_tag_costs.map(cost => ({
        trip_id: tripId,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('fast_tag_events').insert(fastTagData)
      );
    }

    // Insert MCD events
    if (tripData.mcd_costs.length > 0) {
      const mcdData = tripData.mcd_costs.map(cost => ({
        trip_id: tripId,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('mcd_events').insert(mcdData)
      );
    }

    // Insert Green Tax events
    if (tripData.green_tax_costs.length > 0) {
      const greenTaxData = tripData.green_tax_costs.map(cost => ({
        trip_id: tripId,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('green_tax_events').insert(greenTaxData)
      );
    }

    // Insert RTO events
    if (tripData.rto_costs.length > 0) {
      const rtoData = tripData.rto_costs.map(cost => ({
        trip_id: tripId,
        state: cost.state,
        checkpoint: cost.checkpoint || null,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('rto_events').insert(rtoData)
      );
    }

    // Insert DTO events
    if (tripData.dto_costs.length > 0) {
      const dtoData = tripData.dto_costs.map(cost => ({
        trip_id: tripId,
        state: cost.state,
        checkpoint: cost.checkpoint || null,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('dto_events').insert(dtoData)
      );
    }

    // Insert Municipalities events
    if (tripData.municipalities_costs.length > 0) {
      const municipalitiesData = tripData.municipalities_costs.map(cost => ({
        trip_id: tripId,
        state: cost.state,
        checkpoint: cost.checkpoint || null,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('municipalities_events').insert(municipalitiesData)
      );
    }

    // Insert Border events
    if (tripData.border_costs.length > 0) {
      const borderData = tripData.border_costs.map(cost => ({
        trip_id: tripId,
        state: cost.state,
        checkpoint: cost.checkpoint || null,
        amount: cost.amount,
        event_time: cost.event_time || new Date().toISOString(),
        notes: cost.notes || null,
      }));

      eventPromises.push(
        supabase.from('border_events').insert(borderData)
      );
    }

    // Insert Repair items
    if (tripData.repair_items.length > 0) {
      const repairData = tripData.repair_items.map(item => ({
        trip_id: tripId,
        state: item.state,
        checkpoint: item.checkpoint || null,
        part_or_defect: item.part_or_defect,
        amount: item.amount,
        notes: item.notes || null,
        event_time: item.event_time || new Date().toISOString(),
      }));

      eventPromises.push(
        supabase.from('repair_items').insert(repairData)
      );
    }

    // Execute all inserts
    const results = await Promise.allSettled(eventPromises);
    
    // Log any errors but don't fail the entire operation
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error inserting event data ${index}:`, result.reason);
      }
    });
  }

  private calculateTripCosts(tripData: TripFormData) {
    // Calculate diesel total
    const dieselTotal = tripData.diesel_purchases.reduce(
      (sum, purchase) => sum + (purchase.diesel_quantity * purchase.diesel_price_per_liter),
      0
    );

    // Calculate individual cost totals
    const fastTagTotal = tripData.fast_tag_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const mcdTotal = tripData.mcd_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const greenTaxTotal = tripData.green_tax_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const rtoTotal = tripData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const dtoTotal = tripData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const municipalitiesTotal = tripData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const borderTotal = tripData.border_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const repairTotal = tripData.repair_items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate grand total
    const totalCost = dieselTotal + fastTagTotal + mcdTotal + greenTaxTotal + 
                     rtoTotal + dtoTotal + municipalitiesTotal + borderTotal + repairTotal;

    return {
      fast_tag_cost: Math.round(fastTagTotal * 100) / 100,
      mcd_cost: Math.round(mcdTotal * 100) / 100,
      green_tax_cost: Math.round(greenTaxTotal * 100) / 100,
      rto_cost: Math.round(rtoTotal * 100) / 100,
      dto_cost: Math.round(dtoTotal * 100) / 100,
      municipalities_cost: Math.round(municipalitiesTotal * 100) / 100,
      border_cost: Math.round(borderTotal * 100) / 100,
      repair_cost: Math.round(repairTotal * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
    };
  }

  private async deleteTripRelatedData(tripId: string): Promise<void> {
    const deletePromises = [
      supabase.from('diesel_purchases').delete().eq('trip_id', tripId),
      supabase.from('fast_tag_events').delete().eq('trip_id', tripId),
      supabase.from('mcd_events').delete().eq('trip_id', tripId),
      supabase.from('green_tax_events').delete().eq('trip_id', tripId),
      supabase.from('rto_events').delete().eq('trip_id', tripId),
      supabase.from('dto_events').delete().eq('trip_id', tripId),
      supabase.from('municipalities_events').delete().eq('trip_id', tripId),
      supabase.from('border_events').delete().eq('trip_id', tripId),
      supabase.from('repair_items').delete().eq('trip_id', tripId),
    ];

    await Promise.allSettled(deletePromises);
  }
}

export const tripService = new TripService();
