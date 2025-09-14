import { supabase } from '../config/supabase';
import { Truck } from '../types';
import { SupabaseService } from './supabaseService';

export class TruckService extends SupabaseService {
  async getTrucks(): Promise<Truck[]> {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('user_id', this.getUserId())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return this.handleError(error, 'Get trucks');
    }
  }

  async getTruck(id: string): Promise<Truck | null> {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .eq('user_id', this.getUserId())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw error;
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Get truck');
    }
  }

  async createTruck(truckData: Omit<Truck, 'id' | 'created_at' | 'updated_at'>): Promise<Truck> {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .insert({
          ...truckData,
          user_id: this.getUserId(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Create truck');
    }
  }

  async updateTruck(id: string, truckData: Partial<Truck>): Promise<Truck> {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .update({
          ...truckData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', this.getUserId())
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Update truck');
    }
  }

  async deleteTruck(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id)
        .eq('user_id', this.getUserId());

      if (error) {
        throw error;
      }
    } catch (error) {
      return this.handleError(error, 'Delete truck');
    }
  }

  async getTruckStats(truckId: string) {
    try {
      // Get trip count and total cost for this truck
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('total_cost')
        .eq('truck_id', truckId)
        .eq('user_id', this.getUserId());

      if (tripsError) {
        throw tripsError;
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
      return this.handleError(error, 'Get truck stats');
    }
  }
}

export const truckService = new TruckService();
