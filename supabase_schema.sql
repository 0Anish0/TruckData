-- =====================================================
-- SIMPLIFIED SUPABASE SCHEMA FOR TRUCK FLEET MANAGEMENT
-- Cost calculations handled in application code
-- =====================================================

-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TRUCKS TABLE
-- =====================================================
CREATE TABLE public.trucks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    truck_number TEXT UNIQUE NOT NULL,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. DRIVERS TABLE
-- =====================================================
CREATE TABLE public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    license_number TEXT UNIQUE,
    license_image_url TEXT, -- Base64 encoded image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TRIPS TABLE
-- =====================================================
CREATE TABLE public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    truck_id UUID REFERENCES public.trucks(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    trip_date DATE NOT NULL,
    -- Cost fields (calculated in application code)
    fast_tag_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    mcd_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    green_tax_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    rto_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    dto_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    municipalities_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    border_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    repair_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    total_cost DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

-- =====================================================
-- 5. DIESEL PURCHASES TABLE
-- =====================================================
CREATE TABLE public.diesel_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    city TEXT,
    diesel_quantity DECIMAL(10, 2) NOT NULL CHECK (diesel_quantity > 0),
    diesel_price_per_liter DECIMAL(10, 2) NOT NULL CHECK (diesel_price_per_liter > 0),
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. EVENT TABLES (Fast Tag, MCD, Green Tax, etc.)
-- =====================================================

-- Fast Tag Events
CREATE TABLE public.fast_tag_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MCD Events
CREATE TABLE public.mcd_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Green Tax Events
CREATE TABLE public.green_tax_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RTO Events
CREATE TABLE public.rto_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DTO Events
CREATE TABLE public.dto_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Municipalities Events
CREATE TABLE public.municipalities_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Border Events
CREATE TABLE public.border_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repair Items
CREATE TABLE public.repair_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    part_or_defect TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    notes TEXT,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);

-- Truck indexes
CREATE INDEX idx_trucks_user_id ON public.trucks(user_id);
CREATE INDEX idx_trucks_truck_number ON public.trucks(truck_number);

-- Driver indexes
CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX idx_drivers_license_number ON public.drivers(license_number);

-- Trip indexes
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_truck_id ON public.trips(truck_id);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_start_date ON public.trips(start_date);
CREATE INDEX idx_trips_end_date ON public.trips(end_date);
CREATE INDEX idx_trips_trip_date ON public.trips(trip_date);

-- Diesel purchase indexes
CREATE INDEX idx_diesel_purchases_trip_id ON public.diesel_purchases(trip_id);
CREATE INDEX idx_diesel_purchases_purchase_date ON public.diesel_purchases(purchase_date);

-- Event table indexes
CREATE INDEX idx_fast_tag_events_trip_id ON public.fast_tag_events(trip_id);
CREATE INDEX idx_mcd_events_trip_id ON public.mcd_events(trip_id);
CREATE INDEX idx_green_tax_events_trip_id ON public.green_tax_events(trip_id);
CREATE INDEX idx_rto_events_trip_id ON public.rto_events(trip_id);
CREATE INDEX idx_dto_events_trip_id ON public.dto_events(trip_id);
CREATE INDEX idx_municipalities_events_trip_id ON public.municipalities_events(trip_id);
CREATE INDEX idx_border_events_trip_id ON public.border_events(trip_id);
CREATE INDEX idx_repair_items_trip_id ON public.repair_items(trip_id);

-- =====================================================
-- 8. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for trip details with related data
CREATE VIEW trip_details AS
SELECT 
    t.id,
    t.source,
    t.destination,
    t.start_date,
    t.end_date,
    t.trip_date,
    t.fast_tag_cost,
    t.mcd_cost,
    t.green_tax_cost,
    t.rto_cost,
    t.dto_cost,
    t.municipalities_cost,
    t.border_cost,
    t.repair_cost,
    t.total_cost,
    t.created_at,
    t.updated_at,
    tr.name as truck_name,
    tr.truck_number,
    tr.model as truck_model,
    d.name as driver_name,
    d.license_number,
    u.name as user_name,
    u.email as user_email
FROM trips t
LEFT JOIN trucks tr ON t.truck_id = tr.id
LEFT JOIN drivers d ON t.driver_id = d.id
LEFT JOIN users u ON t.user_id = u.id;

-- View for trip statistics
CREATE VIEW trip_statistics AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    COUNT(t.id) as total_trips,
    COALESCE(SUM(t.total_cost), 0) as total_cost,
    COALESCE(AVG(t.total_cost), 0) as avg_cost_per_trip,
    COALESCE(SUM(dp.diesel_quantity), 0) as total_diesel_liters,
    COALESCE(SUM(dp.diesel_quantity * dp.diesel_price_per_liter), 0) as total_diesel_cost,
    COUNT(DISTINCT t.truck_id) as total_trucks,
    COUNT(DISTINCT t.driver_id) as total_drivers
FROM users u
LEFT JOIN trips t ON u.id = t.user_id
LEFT JOIN diesel_purchases dp ON t.id = dp.trip_id
GROUP BY u.id, u.name;

-- =====================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample user
INSERT INTO users (id, email, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@truckdata.com', 'Admin User');

-- Insert sample trucks
INSERT INTO trucks (id, name, truck_number, model, user_id) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Mahindra Bolero', 'MH-12-AB-1234', 'Bolero Pickup', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Tata Ace', 'DL-01-CD-5678', 'Ace Gold', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Ashok Leyland Dost', 'KA-05-EF-9012', 'Dost Plus', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample drivers
INSERT INTO drivers (id, name, age, phone, license_number, user_id) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'Rajesh Kumar', 35, '+91-9876543210', 'DL-1234567890', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440011', 'Suresh Singh', 42, '+91-9876543211', 'DL-1234567891', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440012', 'Amit Sharma', 28, '+91-9876543212', 'DL-1234567892', '550e8400-e29b-41d4-a716-446655440000');

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- This simplified schema provides:
-- 1. Complete user management
-- 2. Truck and driver management
-- 3. Comprehensive trip tracking
-- 4. Detailed cost breakdown across multiple categories
-- 5. Performance-optimized indexes
-- 6. Data integrity constraints
-- 7. Useful views for common queries
-- 8. Sample data for testing
-- 
-- Note: Cost calculations are handled in the application code
-- The database only stores the raw data and calculated totals
-- =====================================================
