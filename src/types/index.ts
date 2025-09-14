import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, DashboardStackParamList, TripsStackParamList } from './navigation';

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

// Event interfaces for database records
export interface FastTagEvent {
  id: string;
  trip_id: string;
  amount: number;
  event_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface McdEvent {
  id: string;
  trip_id: string;
  amount: number;
  event_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GreenTaxEvent {
  id: string;
  trip_id: string;
  amount: number;
  event_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RtoEvent {
  id: string;
  trip_id: string;
  state: string;
  checkpoint?: string;
  amount: number;
  event_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DtoEvent {
  id: string;
  trip_id: string;
  state: string;
  checkpoint?: string;
  amount: number;
  event_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MunicipalitiesEvent {
  id: string;
  trip_id: string;
  state: string;
  checkpoint?: string;
  amount: number;
  event_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BorderEvent {
  id: string;
  trip_id: string;
  state: string;
  checkpoint?: string;
  amount: number;
  event_time: string;
  notes?: string;
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
  fast_tag_events?: FastTagEvent[];
  mcd_events?: McdEvent[];
  green_tax_events?: GreenTaxEvent[];
  rto_events?: RtoEvent[];
  dto_events?: DtoEvent[];
  municipalities_events?: MunicipalitiesEvent[];
  border_events?: BorderEvent[];
}

// Type for trips with database relations (used by tripService)
export interface TripWithRelations {
  id: string;
  truck_id: string;
  source: string;
  destination: string;
  driver_id: string | null;
  fast_tag_cost: number;
  mcd_cost: number;
  green_tax_cost: number;
  rto_cost: number;
  dto_cost: number;
  municipalities_cost: number;
  border_cost: number;
  repair_cost: number;
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
  diesel_purchases?: {
    state: string;
    city: string | null;
    diesel_quantity: number;
    diesel_price_per_liter: number;
    purchase_date: string;
  }[];
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
  repair_items?: RepairItemFormData[];
  fast_tag_costs: FastTagEventFormData[]; 
  mcd_costs: McdEventFormData[]; 
  green_tax_costs: GreenTaxEventFormData[]; 
  rto_costs: RtoEventFormData[];
  dto_costs: DtoEventFormData[];
  municipalities_costs: MunicipalitiesEventFormData[];
  border_costs: BorderEventFormData[];
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
  rto_costs?: string;
  dto_costs?: string;
  municipalities_costs?: string;
  border_costs?: string;
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
  state: string;
  checkpoint?: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface McdEventFormData {
  state: string;
  checkpoint?: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface GreenTaxEventFormData {
  state: string;
  checkpoint?: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface RtoEventFormData {
  state: string;
  checkpoint?: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface DtoEventFormData {
  state: string;
  checkpoint?: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface MunicipalitiesEventFormData {
  state: string;
  checkpoint?: string;
  amount: number;
  notes?: string;
  event_time?: string; // ISO
}

export interface BorderEventFormData {
  state: string;
  checkpoint?: string;
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

// Component Style Interfaces
export interface ContainerStyle extends ViewStyle {
  paddingHorizontal?: number;
  paddingVertical?: number;
  minHeight?: number;
}

export interface LabelStyle extends TextStyle {
  marginBottom?: number;
}

// Component Prop Interfaces
export interface EnhancedCustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export interface EnhancedTripCardProps {
  trip: Trip | TripWithRelations;
  truckName: string;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export interface EnhancedTruckCardProps {
  truck: Truck;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
  tripCount?: number;
  totalCost?: number;
}

export interface EnhancedCustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Screen Prop Interfaces
export interface EnhancedTruckTripsScreenProps {
  route: {
    params: {
      truck: Truck;
    };
  };
  navigation: NavigationProp<RootStackParamList>;
}

export interface EnhancedEditTruckScreenProps {
  route: {
    params: {
      truck: Truck;
    };
  };
  navigation: NavigationProp<RootStackParamList>;
}

export interface EnhancedEditTripScreenProps {
  route: {
    params: {
      trip: Trip;
    };
  };
  navigation: NavigationProp<RootStackParamList>;
}

// Dashboard Types
export interface DashboardStats {
  totalTrips: number;
  totalCost: number;
  totalDiesel: number;
  avgCost: number;
}

// Auth Context Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Navigation Types
export type DashboardScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList, 'DashboardMain'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type TripsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<TripsStackParamList, 'TripsMain'>,
  BottomTabNavigationProp<RootStackParamList>
>;

// Re-export navigation types
export * from './navigation';

// Re-export global types
export * from './global';
