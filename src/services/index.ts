// Export all services
export { truckService } from './truckService';
export { driverService } from './driverService';
export { tripService } from './tripService';

// Export Supabase client for direct use if needed
export { supabase } from '../config/supabase';

// Re-export types
export type { Database } from '../config/supabase';
