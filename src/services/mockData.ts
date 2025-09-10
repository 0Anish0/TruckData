import { Truck, Driver, Trip, DieselPurchase } from '../types';

// Mock data for development
export const mockTrucks: Truck[] = [
  {
    id: '1',
    name: 'Mahindra Bolero',
    truck_number: 'MH-12-AB-1234',
    model: 'Bolero Pickup',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_id: 'user-1',
  },
  {
    id: '2',
    name: 'Tata Ace',
    truck_number: 'DL-01-CD-5678',
    model: 'Ace Gold',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    user_id: 'user-1',
  },
  {
    id: '3',
    name: 'Ashok Leyland Dost',
    truck_number: 'KA-05-EF-9012',
    model: 'Dost Plus',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    user_id: 'user-1',
  },
];

export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    age: 35,
    phone: '+91-9876543210',
    license_number: 'DL-1234567890',
    license_image_url: '',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_id: 'user-1',
  },
  {
    id: '2',
    name: 'Suresh Singh',
    age: 42,
    phone: '+91-9876543211',
    license_number: 'DL-1234567891',
    license_image_url: '',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    user_id: 'user-1',
  },
  {
    id: '3',
    name: 'Amit Sharma',
    age: 28,
    phone: '+91-9876543212',
    license_number: 'DL-1234567892',
    license_image_url: '',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    user_id: 'user-1',
  },
];

export const mockDieselPurchases: DieselPurchase[] = [
  {
    id: '1',
    trip_id: '1',
    state: 'Maharashtra',
    city: 'Mumbai',
    diesel_quantity: 50,
    diesel_price_per_liter: 95.50,
    purchase_date: '2024-01-15T08:00:00Z',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    trip_id: '1',
    state: 'Gujarat',
    city: 'Ahmedabad',
    diesel_quantity: 30,
    diesel_price_per_liter: 94.20,
    purchase_date: '2024-01-15T14:00:00Z',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
  },
  {
    id: '3',
    trip_id: '2',
    state: 'Delhi',
    city: 'New Delhi',
    diesel_quantity: 40,
    diesel_price_per_liter: 96.80,
    purchase_date: '2024-01-20T09:00:00Z',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z',
  },
];

export const mockTrips: Trip[] = [
  {
    id: '1',
    truck_id: '1',
    source: 'Mumbai',
    destination: 'Delhi',
    driver_id: '1',
    fast_tag_cost: 1200,
    mcd_cost: 800,
    green_tax_cost: 500,
    commission_cost: 0,
    rto_cost: 300,
    dto_cost: 200,
    municipalities_cost: 150,
    border_cost: 100,
    repair_cost: 0,
    total_cost: 3150,
    trip_date: '2024-01-15T08:00:00Z',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    user_id: 'user-1',
    trucks: {
      id: '1',
      name: 'Mahindra Bolero',
      truck_number: 'MH-12-AB-1234',
      model: 'Bolero Pickup',
    },
    drivers: {
      id: '1',
      name: 'Rajesh Kumar',
    },
    diesel_purchases: mockDieselPurchases.filter(p => p.trip_id === '1'),
    fast_tag_events: [
      {
        id: '1',
        trip_id: '1',
        amount: 1200,
        event_time: '2024-01-15T10:00:00Z',
        notes: 'Highway toll',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ],
    mcd_events: [
      {
        id: '1',
        trip_id: '1',
        amount: 800,
        event_time: '2024-01-15T12:00:00Z',
        notes: 'Municipal charges',
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
      },
    ],
    green_tax_events: [
      {
        id: '1',
        trip_id: '1',
        amount: 500,
        event_time: '2024-01-15T14:00:00Z',
        notes: 'Environmental tax',
        created_at: '2024-01-15T14:00:00Z',
        updated_at: '2024-01-15T14:00:00Z',
      },
    ],
    rto_events: [
      {
        id: '1',
        trip_id: '1',
        state: 'Maharashtra',
        checkpoint: 'Mumbai RTO',
        amount: 300,
        event_time: '2024-01-15T09:00:00Z',
        notes: 'Vehicle registration check',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:00:00Z',
      },
    ],
    dto_events: [
      {
        id: '1',
        trip_id: '1',
        state: 'Gujarat',
        checkpoint: 'Ahmedabad DTO',
        amount: 200,
        event_time: '2024-01-15T15:00:00Z',
        notes: 'Transport permit',
        created_at: '2024-01-15T15:00:00Z',
        updated_at: '2024-01-15T15:00:00Z',
      },
    ],
    municipalities_events: [
      {
        id: '1',
        trip_id: '1',
        state: 'Delhi',
        checkpoint: 'Delhi Municipal',
        amount: 150,
        event_time: '2024-01-15T16:00:00Z',
        notes: 'City entry fee',
        created_at: '2024-01-15T16:00:00Z',
        updated_at: '2024-01-15T16:00:00Z',
      },
    ],
    border_events: [
      {
        id: '1',
        trip_id: '1',
        state: 'Haryana',
        checkpoint: 'Gurgaon Border',
        amount: 100,
        event_time: '2024-01-15T17:00:00Z',
        notes: 'State border crossing',
        created_at: '2024-01-15T17:00:00Z',
        updated_at: '2024-01-15T17:00:00Z',
      },
    ],
  },
  {
    id: '2',
    truck_id: '2',
    source: 'Delhi',
    destination: 'Bangalore',
    driver_id: '2',
    fast_tag_cost: 1800,
    mcd_cost: 600,
    green_tax_cost: 400,
    commission_cost: 0,
    rto_cost: 250,
    dto_cost: 180,
    municipalities_cost: 120,
    border_cost: 80,
    repair_cost: 500,
    total_cost: 3930,
    trip_date: '2024-01-20T09:00:00Z',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z',
    user_id: 'user-1',
    trucks: {
      id: '2',
      name: 'Tata Ace',
      truck_number: 'DL-01-CD-5678',
      model: 'Ace Gold',
    },
    drivers: {
      id: '2',
      name: 'Suresh Singh',
    },
    diesel_purchases: mockDieselPurchases.filter(p => p.trip_id === '2'),
    fast_tag_events: [
      {
        id: '2',
        trip_id: '2',
        amount: 1800,
        event_time: '2024-01-20T10:00:00Z',
        notes: 'Long distance toll',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
      },
    ],
    mcd_events: [
      {
        id: '2',
        trip_id: '2',
        amount: 600,
        event_time: '2024-01-20T12:00:00Z',
        notes: 'Municipal charges',
        created_at: '2024-01-20T12:00:00Z',
        updated_at: '2024-01-20T12:00:00Z',
      },
    ],
    green_tax_events: [
      {
        id: '2',
        trip_id: '2',
        amount: 400,
        event_time: '2024-01-20T14:00:00Z',
        notes: 'Environmental tax',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-01-20T14:00:00Z',
      },
    ],
    rto_events: [
      {
        id: '2',
        trip_id: '2',
        state: 'Delhi',
        checkpoint: 'Delhi RTO',
        amount: 250,
        event_time: '2024-01-20T09:30:00Z',
        notes: 'Vehicle check',
        created_at: '2024-01-20T09:30:00Z',
        updated_at: '2024-01-20T09:30:00Z',
      },
    ],
    dto_events: [
      {
        id: '2',
        trip_id: '2',
        state: 'Karnataka',
        checkpoint: 'Bangalore DTO',
        amount: 180,
        event_time: '2024-01-20T15:00:00Z',
        notes: 'Transport permit',
        created_at: '2024-01-20T15:00:00Z',
        updated_at: '2024-01-20T15:00:00Z',
      },
    ],
    municipalities_events: [
      {
        id: '2',
        trip_id: '2',
        state: 'Karnataka',
        checkpoint: 'Bangalore Municipal',
        amount: 120,
        event_time: '2024-01-20T16:00:00Z',
        notes: 'City entry fee',
        created_at: '2024-01-20T16:00:00Z',
        updated_at: '2024-01-20T16:00:00Z',
      },
    ],
    border_events: [
      {
        id: '2',
        trip_id: '2',
        state: 'Maharashtra',
        checkpoint: 'Pune Border',
        amount: 80,
        event_time: '2024-01-20T17:00:00Z',
        notes: 'State border crossing',
        created_at: '2024-01-20T17:00:00Z',
        updated_at: '2024-01-20T17:00:00Z',
      },
    ],
  },
  {
    id: '3',
    truck_id: '3',
    source: 'Bangalore',
    destination: 'Chennai',
    driver_id: '3',
    fast_tag_cost: 900,
    mcd_cost: 400,
    green_tax_cost: 300,
    commission_cost: 0,
    rto_cost: 200,
    dto_cost: 150,
    municipalities_cost: 100,
    border_cost: 60,
    repair_cost: 0,
    total_cost: 2110,
    trip_date: '2024-02-01T07:00:00Z',
    created_at: '2024-02-01T07:00:00Z',
    updated_at: '2024-02-01T07:00:00Z',
    user_id: 'user-1',
    trucks: {
      id: '3',
      name: 'Ashok Leyland Dost',
      truck_number: 'KA-05-EF-9012',
      model: 'Dost Plus',
    },
    drivers: {
      id: '3',
      name: 'Amit Sharma',
    },
    diesel_purchases: [],
    fast_tag_events: [
      {
        id: '3',
        trip_id: '3',
        amount: 900,
        event_time: '2024-02-01T08:00:00Z',
        notes: 'Highway toll',
        created_at: '2024-02-01T08:00:00Z',
        updated_at: '2024-02-01T08:00:00Z',
      },
    ],
    mcd_events: [
      {
        id: '3',
        trip_id: '3',
        amount: 400,
        event_time: '2024-02-01T10:00:00Z',
        notes: 'Municipal charges',
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z',
      },
    ],
    green_tax_events: [
      {
        id: '3',
        trip_id: '3',
        amount: 300,
        event_time: '2024-02-01T12:00:00Z',
        notes: 'Environmental tax',
        created_at: '2024-02-01T12:00:00Z',
        updated_at: '2024-02-01T12:00:00Z',
      },
    ],
    rto_events: [
      {
        id: '3',
        trip_id: '3',
        state: 'Karnataka',
        checkpoint: 'Bangalore RTO',
        amount: 200,
        event_time: '2024-02-01T07:30:00Z',
        notes: 'Vehicle check',
        created_at: '2024-02-01T07:30:00Z',
        updated_at: '2024-02-01T07:30:00Z',
      },
    ],
    dto_events: [
      {
        id: '3',
        trip_id: '3',
        state: 'Tamil Nadu',
        checkpoint: 'Chennai DTO',
        amount: 150,
        event_time: '2024-02-01T13:00:00Z',
        notes: 'Transport permit',
        created_at: '2024-02-01T13:00:00Z',
        updated_at: '2024-02-01T13:00:00Z',
      },
    ],
    municipalities_events: [
      {
        id: '3',
        trip_id: '3',
        state: 'Tamil Nadu',
        checkpoint: 'Chennai Municipal',
        amount: 100,
        event_time: '2024-02-01T14:00:00Z',
        notes: 'City entry fee',
        created_at: '2024-02-01T14:00:00Z',
        updated_at: '2024-02-01T14:00:00Z',
      },
    ],
    border_events: [
      {
        id: '3',
        trip_id: '3',
        state: 'Tamil Nadu',
        checkpoint: 'Krishnagiri Border',
        amount: 60,
        event_time: '2024-02-01T15:00:00Z',
        notes: 'State border crossing',
        created_at: '2024-02-01T15:00:00Z',
        updated_at: '2024-02-01T15:00:00Z',
      },
    ],
  },
];

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'demo@truckfleet.com',
  name: 'Demo User',
  user_metadata: {
    full_name: 'Demo User',
  },
};

// Utility functions for mock data
export const getMockTrucks = (): Promise<Truck[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTrucks), 500);
  });
};

export const getMockDrivers = (): Promise<Driver[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDrivers), 500);
  });
};

export const getMockTrips = (): Promise<Trip[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTrips), 500);
  });
};

export const getMockTripStats = () => {
  const totalTrips = mockTrips.length;
  const totalCost = mockTrips.reduce((sum, trip) => sum + trip.total_cost, 0);
  const totalDiesel = mockDieselPurchases.reduce((sum, purchase) => sum + purchase.diesel_quantity, 0);
  const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

  return {
    totalTrips,
    totalCost,
    totalDiesel,
    avgCost,
  };
};

export const getMockTruckTripStats = (truckId: string) => {
  const truckTrips = mockTrips.filter(trip => trip.truck_id === truckId);
  const totalTrips = truckTrips.length;
  const totalCost = truckTrips.reduce((sum, trip) => sum + trip.total_cost, 0);
  const totalDiesel = truckTrips.reduce((sum, trip) => {
    const purchases = mockDieselPurchases.filter(p => p.trip_id === trip.id);
    return sum + purchases.reduce((pSum, purchase) => pSum + purchase.diesel_quantity, 0);
  }, 0);
  const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

  return {
    totalTrips,
    totalCost,
    totalDiesel,
    avgCost,
  };
};
