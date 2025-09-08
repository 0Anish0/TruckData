import { supabase } from '../lib/supabase';

export interface DriverForm {
  name: string;
  age?: number;
  phone?: string;
  license_number?: string;
  license_image_base64?: string; // store as base64 string
}

export const driverService = {
  async getDrivers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createDriver(payload: DriverForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('drivers')
      .insert([{ 
        name: payload.name,
        age: payload.age ?? null,
        phone: payload.phone ?? null,
        license_number: payload.license_number ?? null,
        license_image_url: payload.license_image_base64 ?? null,
        user_id: user.id,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDriver(id: string, payload: DriverForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('drivers')
      .update({
        name: payload.name,
        age: payload.age ?? null,
        phone: payload.phone ?? null,
        license_number: payload.license_number ?? null,
        license_image_url: payload.license_image_base64 ?? null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDriver(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  },
};


