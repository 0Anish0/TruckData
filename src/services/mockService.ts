import { Truck, Driver, Trip, TripWithRelations, TripFormData } from '../types';
import { 
  mockTrucks, 
  mockDrivers, 
  mockTrips,  
  getMockTripStats, 
  getMockTruckTripStats 
} from './mockData';

// Mock Truck Service
export const mockTruckService = {
  async getTrucks(): Promise<Truck[]> {
    return mockTrucks;
  },

  async getTruck(id: string): Promise<Truck | null> {
    return mockTrucks.find(truck => truck.id === id) || null;
  },

  async createTruck(truckData: Omit<Truck, 'id' | 'created_at' | 'updated_at'>): Promise<Truck> {
    const newTruck: Truck = {
      ...truckData,
      id: `truck-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTrucks.push(newTruck);
    return newTruck;
  },

  async updateTruck(id: string, truckData: Partial<Truck>): Promise<Truck> {
    const index = mockTrucks.findIndex(truck => truck.id === id);
    if (index === -1) throw new Error('Truck not found');
    
    mockTrucks[index] = {
      ...mockTrucks[index],
      ...truckData,
      updated_at: new Date().toISOString(),
    };
    return mockTrucks[index];
  },

  async deleteTruck(id: string): Promise<void> {
    const index = mockTrucks.findIndex(truck => truck.id === id);
    if (index === -1) throw new Error('Truck not found');
    mockTrucks.splice(index, 1);
  },
};

// Mock Driver Service
export const mockDriverService = {
  async getDrivers(): Promise<Driver[]> {
    return mockDrivers;
  },

  async getDriver(id: string): Promise<Driver | null> {
    return mockDrivers.find(driver => driver.id === id) || null;
  },

  async createDriver(driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>): Promise<Driver> {
    const newDriver: Driver = {
      ...driverData,
      id: `driver-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDrivers.push(newDriver);
    return newDriver;
  },

  async updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver> {
    const index = mockDrivers.findIndex(driver => driver.id === id);
    if (index === -1) throw new Error('Driver not found');
    
    mockDrivers[index] = {
      ...mockDrivers[index],
      ...driverData,
      updated_at: new Date().toISOString(),
    };
    return mockDrivers[index];
  },

  async deleteDriver(id: string): Promise<void> {
    const index = mockDrivers.findIndex(driver => driver.id === id);
    if (index === -1) throw new Error('Driver not found');
    mockDrivers.splice(index, 1);
  },
};

// Mock Trip Service
export const mockTripService = {
  async getTrips(): Promise<Trip[]> {
    return mockTrips;
  },

  async getTrip(id: string): Promise<Trip | null> {
    return mockTrips.find(trip => trip.id === id) || null;
  },

  async getTripsByTruck(truckId: string): Promise<TripWithRelations[]> {
    return mockTrips
      .filter(trip => trip.truck_id === truckId)
      .map(trip => ({
        ...trip,
        driver_id: trip.driver_id ?? null,
        rto_cost: trip.rto_cost ?? 0,
        dto_cost: trip.dto_cost ?? 0,
        municipalities_cost: trip.municipalities_cost ?? 0,
        border_cost: trip.border_cost ?? 0,
        repair_cost: trip.repair_cost ?? 0,
        diesel_purchases: (trip.diesel_purchases || []).map(purchase => ({
          ...purchase,
          city: purchase.city ?? null,
        })),
      }));
  },

  async createTrip(tripData: TripFormData): Promise<Trip> {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      truck_id: tripData.truck_id,
      source: tripData.source,
      destination: tripData.destination,
      driver_id: tripData.driver_id || null,
      fast_tag_cost: tripData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0),
      mcd_cost: tripData.mcd_costs.reduce((sum, cost) => sum + cost, 0),
      green_tax_cost: tripData.green_tax_costs.reduce((sum, cost) => sum + cost, 0),
      rto_cost: tripData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0),
      dto_cost: tripData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0),
      municipalities_cost: tripData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0),
      border_cost: tripData.border_costs.reduce((sum, cost) => sum + cost.amount, 0),
      repair_cost: tripData.repair_cost ?? 0,
      total_cost: 0, 
      trip_date: new Date().toISOString(),
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
    };

    // Calculate total cost
    newTrip.total_cost = this.calculateTotalCost({
      diesel_purchases: tripData.diesel_purchases,
      fast_tag_cost: newTrip.fast_tag_cost,
      mcd_cost: newTrip.mcd_cost,
      green_tax_cost: newTrip.green_tax_cost,
      rto_cost: newTrip.rto_cost ?? 0,
      dto_cost: newTrip.dto_cost ?? 0,
      municipalities_cost: newTrip.municipalities_cost ?? 0,
      border_cost: newTrip.border_cost ?? 0,
      repair_cost: newTrip.repair_cost ?? 0,
    });

    mockTrips.push(newTrip);
    return newTrip;
  },

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    const index = mockTrips.findIndex(trip => trip.id === id);
    if (index === -1) throw new Error('Trip not found');
    
    mockTrips[index] = {
      ...mockTrips[index],
      ...tripData,
      updated_at: new Date().toISOString(),
    };
    return mockTrips[index];
  },

  async deleteTrip(id: string): Promise<void> {
    const index = mockTrips.findIndex(trip => trip.id === id);
    if (index === -1) throw new Error('Trip not found');
    mockTrips.splice(index, 1);
  },

  async getTripStats() {
    return getMockTripStats();
  },

  async getTruckTripStats(truckId: string) {
    return getMockTruckTripStats(truckId);
  },

  calculateTotalCost(tripData: {
    diesel_purchases: { diesel_quantity: number; diesel_price_per_liter: number }[];
    fast_tag_cost: number;
    mcd_cost: number;
    green_tax_cost: number;
    rto_cost: number;
    dto_cost: number;
    municipalities_cost: number;
    border_cost: number;
    repair_cost: number;
  }): number {
    const dieselCost = tripData.diesel_purchases.reduce(
      (total, purchase) => total + (purchase.diesel_quantity * purchase.diesel_price_per_liter),
      0
    );
    
    return Math.round(
      (dieselCost + 
       tripData.fast_tag_cost + 
       tripData.mcd_cost + 
       tripData.green_tax_cost + 
       tripData.rto_cost + 
       tripData.dto_cost + 
       tripData.municipalities_cost + 
       tripData.border_cost + 
       tripData.repair_cost) * 100
    ) / 100;
  },

  async debugDatabaseState(): Promise<void> {
    console.log('Mock Database State:');
    console.log('Trucks:', mockTrucks.length);
    console.log('Drivers:', mockDrivers.length);
    console.log('Trips:', mockTrips.length);
  },
};
