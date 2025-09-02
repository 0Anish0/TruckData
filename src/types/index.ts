export interface Truck {
  id: string;
  name: string;
  truckNumber: string;
  model: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  truckId: string;
  source: string;
  destination: string;
  dieselQuantity: number;
  dieselPricePerLiter: number;
  fastTagCost: number;
  mcdCost: number;
  greenTaxCost: number;
  totalCost: number;
  tripDate: Date;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface TripFormData {
  truckId: string;
  source: string;
  destination: string;
  dieselQuantity: number;
  dieselPricePerLiter: number;
  fastTagCost: number;
  mcdCost: number;
  greenTaxCost: number;
}

export interface TripFormErrors {
  truckId?: string;
  source?: string;
  destination?: string;
  dieselQuantity?: string;
  dieselPricePerLiter?: string;
  fastTagCost?: string;
  mcdCost?: string;
  greenTaxCost?: string;
}
