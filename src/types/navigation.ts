import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Truck, TripWithRelations } from './index';

// Root tab navigator parameter types
export type RootStackParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Trucks: undefined;
  Drivers: undefined;
};

// Dashboard stack navigator parameter types
export type DashboardStackParamList = {
  DashboardMain: undefined;
  AddTrip: { trip?: TripWithRelations };
  AddTruck: { truck?: Truck };
  TruckTrips: { truck: Truck };
  EditTrip: { trip: TripWithRelations };
  EditTruck: { truck: Truck };
};

// Trips stack navigator parameter types
export type TripsStackParamList = {
  TripsMain: undefined;
  AddTrip: { trip?: TripWithRelations };
  EditTrip: { trip: TripWithRelations };
};

// Trucks stack navigator parameter types
export type TrucksStackParamList = {
  TrucksMain: undefined;
  AddTruck: { truck?: Truck };
  EditTrip: { trip: TripWithRelations };
  EditTruck: { truck: Truck };
};

// Drivers stack navigator parameter types
export type DriversStackParamList = {
  DriversMain: undefined;
  AddDriver: { driver?: Driver };
};

// Auth stack navigator parameter types
export type AuthStackParamList = {
  Auth: undefined;
};

// Global navigation parameter list (for useNavigation hook)
export type GlobalParamList = RootStackParamList & 
  DashboardStackParamList & 
  TripsStackParamList & 
  TrucksStackParamList & 
  DriversStackParamList & 
  AuthStackParamList;

// Navigation prop types for each screen
export type DashboardScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList, 'DashboardMain'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type TripsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<TripsStackParamList, 'TripsMain'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type TrucksScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<TrucksStackParamList, 'TrucksMain'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type DriversScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DriversStackParamList, 'DriversMain'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type AddTripScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList | TripsStackParamList, 'AddTrip'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type AddTruckScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList | TrucksStackParamList, 'AddTruck'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type EditTripScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList | TripsStackParamList | TrucksStackParamList, 'EditTrip'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type EditTruckScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList | TrucksStackParamList, 'EditTruck'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type TruckTripsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList, 'TruckTrips'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type AddDriverScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DriversStackParamList, 'AddDriver'>,
  BottomTabNavigationProp<RootStackParamList>
>;

export type AuthScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Auth'>;
