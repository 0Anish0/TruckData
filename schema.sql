-- Enable Row Level Security

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trucks table
CREATE TABLE IF NOT EXISTS public.trucks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    truck_number TEXT NOT NULL,
    model TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    truck_id UUID REFERENCES public.trucks(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    fast_tag_cost DECIMAL(10,2) DEFAULT 0,
    mcd_cost DECIMAL(10,2) DEFAULT 0,
    green_tax_cost DECIMAL(10,2) DEFAULT 0,
    commission_cost DECIMAL(10,2) DEFAULT 0,
    rto_cost DECIMAL(10,2) DEFAULT 0,
    dto_cost DECIMAL(10,2) DEFAULT 0,
    municipalities_cost DECIMAL(10,2) DEFAULT 0,
    border_cost DECIMAL(10,2) DEFAULT 0,
    repair_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    trip_date DATE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    license_number TEXT,
    license_image_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diesel_purchases table for multiple diesel purchases per trip
CREATE TABLE IF NOT EXISTS public.diesel_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    city TEXT,
    diesel_quantity DECIMAL(10,2) NOT NULL,
    diesel_price_per_liter DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RTO events per trip
CREATE TABLE IF NOT EXISTS public.rto_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DTO events per trip
CREATE TABLE IF NOT EXISTS public.dto_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Municipalities events per trip
CREATE TABLE IF NOT EXISTS public.municipalities_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Border events per trip
CREATE TABLE IF NOT EXISTS public.border_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    state TEXT NOT NULL,
    checkpoint TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repair/defect events per trip
CREATE TABLE IF NOT EXISTS public.repair_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    part_or_defect TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fast tag events per trip
CREATE TABLE IF NOT EXISTS public.fast_tag_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MCD events per trip
CREATE TABLE IF NOT EXISTS public.mcd_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Green tax events per trip
CREATE TABLE IF NOT EXISTS public.green_tax_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_user_id ON public.trucks(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck_id ON public.trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_trip_date ON public.trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_diesel_purchases_trip_id ON public.diesel_purchases(trip_id);
CREATE INDEX IF NOT EXISTS idx_diesel_purchases_state ON public.diesel_purchases(state);
CREATE INDEX IF NOT EXISTS idx_diesel_purchases_purchase_date ON public.diesel_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_rto_events_trip_id ON public.rto_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_rto_events_state ON public.rto_events(state);
CREATE INDEX IF NOT EXISTS idx_dto_events_trip_id ON public.dto_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_dto_events_state ON public.dto_events(state);
CREATE INDEX IF NOT EXISTS idx_municipalities_events_trip_id ON public.municipalities_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_events_state ON public.municipalities_events(state);
CREATE INDEX IF NOT EXISTS idx_border_events_trip_id ON public.border_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_border_events_state ON public.border_events(state);
CREATE INDEX IF NOT EXISTS idx_repair_events_trip_id ON public.repair_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_fast_tag_events_trip_id ON public.fast_tag_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_mcd_events_trip_id ON public.mcd_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_green_tax_events_trip_id ON public.green_tax_events(trip_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
