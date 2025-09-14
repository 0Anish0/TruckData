import { supabase } from '../config/supabase';
import { Driver } from '../types';
import { SupabaseService, convertImageToBase64 } from './supabaseService';

export class DriverService extends SupabaseService {
  async getDrivers(): Promise<Driver[]> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', this.getUserId())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return this.handleError(error, 'Get drivers');
    }
  }

  async getDriver(id: string): Promise<Driver | null> {
    try {
      const { data, error } = await supabase
        .from('drivers')
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
      return this.handleError(error, 'Get driver');
    }
  }

  async createDriver(driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>): Promise<Driver> {
    try {
      let licenseImageBase64: string | null = null;
      
      // Convert license image to base64 if provided
      if (driverData.license_image_url) {
        try {
          licenseImageBase64 = await convertImageToBase64(driverData.license_image_url);
        } catch (error) {
          console.warn('Failed to convert license image to base64:', error);
        }
      }

      const { data, error } = await supabase
        .from('drivers')
        .insert({
          ...driverData,
          license_image_url: licenseImageBase64,
          user_id: this.getUserId(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return this.handleError(error, 'Create driver');
    }
  }

  async updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver> {
    try {
      let updateData = { ...driverData };

      // Convert license image to base64 if provided
      if (driverData.license_image_url) {
        try {
          const base64Image = await convertImageToBase64(driverData.license_image_url);
          updateData.license_image_url = base64Image;
        } catch (error) {
          console.warn('Failed to convert license image to base64:', error);
        }
      }

      const { data, error } = await supabase
        .from('drivers')
        .update({
          ...updateData,
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
      return this.handleError(error, 'Update driver');
    }
  }

  async deleteDriver(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)
        .eq('user_id', this.getUserId());

      if (error) {
        throw error;
      }
    } catch (error) {
      return this.handleError(error, 'Delete driver');
    }
  }

  async getDriverStats(driverId: string) {
    try {
      // Get trip count and total cost for this driver
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('total_cost')
        .eq('driver_id', driverId)
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
      return this.handleError(error, 'Get driver stats');
    }
  }
}

export const driverService = new DriverService();
