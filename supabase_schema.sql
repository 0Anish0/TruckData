-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (References auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Profile indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);

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
-- . FUNCTIONS AND TRIGGERS FOR PROFILE MANAGEMENT
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();