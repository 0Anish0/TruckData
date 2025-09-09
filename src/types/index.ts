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
  commission_cost?: number; // deprecated aggregate
  rto_cost?: number;
  dto_cost?: number;
  municipalities_cost?: number;
  border_cost?: number;
  repair_cost?: number;
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
  commission_items?: CommissionItemFormData[];
  repair_items?: RepairItemFormData[];
  fast_tag_costs: number[]; 
  mcd_costs: number[]; 
  green_tax_costs: number[]; 
  rto_cost?: number;
  dto_cost?: number;
  municipalities_cost?: number;
  border_cost?: number;
  repair_cost?: number;
}

export interface TripFormErrors {
  truck_id?: string;
  driver_id?: string;
  source?: string;
  destination?: string;
  diesel_purchases?: string;
  fast_tag_costs?: string;
  mcd_costs?: string;
  green_tax_costs?: string;
  rto_cost?: string;
  dto_cost?: string;
  municipalities_cost?: string;
  border_cost?: string;
  repair_cost?: string;
}

export type AuthorityType = 'RTO' | 'DTO' | 'State Border' | 'Municipalities' | 'Other';

export interface CommissionItemFormData {
  state: string;
  authority_type: AuthorityType;
  amount: number;
  checkpoint?: string;
  notes?: string;
  event_time?: string; // ISO
}

export interface RepairItemFormData {
  part_or_defect: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface FastTagEventFormData {
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface McdEventFormData {
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface GreenTaxEventFormData {
  amount: number;
  notes?: string;
  event_time?: string; // ISO
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
