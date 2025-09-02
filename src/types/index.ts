export interface Truck {
  id: string;
  name: string;
  truck_number: string;
  model: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Trip {
  id: string;
  truck_id: string;
  source: string;
  destination: string;
  diesel_quantity: number;
  diesel_price_per_liter: number;
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
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface TripFormData {
  truck_id: string;
  source: string;
  destination: string;
  diesel_quantity: number;
  diesel_price_per_liter: number;
  fast_tag_cost: number;
  mcd_cost: number;
  green_tax_cost: number;
}

export interface TripFormErrors {
  truck_id?: string;
  source?: string;
  destination?: string;
  diesel_quantity?: string;
  diesel_price_per_liter?: string;
  fast_tag_cost?: string;
  mcd_cost?: string;
  green_tax_cost?: string;
}
