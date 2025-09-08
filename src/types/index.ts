export interface Truck {
  id: string;
  name: string;
  truck_number: string;
  model: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Driver {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  license_number?: string;
  license_image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface DieselPurchase {
  id: string;
  trip_id: string;
  state: string;
  city?: string;
  diesel_quantity: number;
  diesel_price_per_liter: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  truck_id: string;
  source: string;
  destination: string;
  driver_id?: string | null;
  fast_tag_cost: number;
  mcd_cost: number;
  green_tax_cost: number;
  total_cost: number;
  trip_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  trucks?: {
    id: string;
    name: string;
    truck_number: string;
    model: string;
  };
  drivers?: {
    id: string;
    name: string;
  };
  diesel_purchases?: DieselPurchase[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface DieselPurchaseFormData {
  state: string;
  city: string;
  diesel_quantity: number;
  diesel_price_per_liter: number;
  purchase_date: string;
}

export interface DieselPurchaseFormErrors {
  state?: string;
  city?: string;
  diesel_quantity?: string;
  diesel_price_per_liter?: string;
  purchase_date?: string;
}

export interface TripFormData {
  truck_id: string;
  driver_id?: string;
  source: string;
  destination: string;
  diesel_purchases: DieselPurchaseFormData[];
  fast_tag_cost: number;
  mcd_cost: number;
  green_tax_cost: number;
}

export interface TripFormErrors {
  truck_id?: string;
  driver_id?: string;
  source?: string;
  destination?: string;
  diesel_purchases?: string;
  fast_tag_cost?: string;
  mcd_cost?: string;
  green_tax_cost?: string;
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Lakshadweep',
  'Andaman and Nicobar Islands'
];
