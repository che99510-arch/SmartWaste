-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- WASTE BINS
-- ============================================================
CREATE TABLE public.waste_bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_id TEXT UNIQUE NOT NULL,
  location_name TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  zone TEXT NOT NULL,
  capacity_liters INTEGER NOT NULL DEFAULT 240,
  fill_level INTEGER NOT NULL DEFAULT 0 CHECK (fill_level BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline', 'full')),
  waste_type TEXT NOT NULL DEFAULT 'general' CHECK (waste_type IN ('general', 'recyclable', 'organic', 'hazardous')),
  battery_level INTEGER NOT NULL DEFAULT 100 CHECK (battery_level BETWEEN 0 AND 100),
  temperature FLOAT,
  last_collected TIMESTAMPTZ,
  last_sensor_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.waste_bins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bins_select" ON public.waste_bins FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "bins_all" ON public.waste_bins FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- ============================================================
-- SENSOR READINGS
-- ============================================================
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_id UUID NOT NULL REFERENCES public.waste_bins(id) ON DELETE CASCADE,
  fill_level INTEGER NOT NULL CHECK (fill_level BETWEEN 0 AND 100),
  temperature FLOAT,
  battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
  weight_kg FLOAT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sensor_bin_id ON public.sensor_readings(bin_id);
CREATE INDEX idx_sensor_recorded_at ON public.sensor_readings(recorded_at DESC);

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sensor_select" ON public.sensor_readings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "sensor_insert" ON public.sensor_readings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_id UUID REFERENCES public.waste_bins(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('overflow', 'maintenance', 'battery', 'offline', 'collection', 'system')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_resolved ON public.alerts(is_resolved);
CREATE INDEX idx_alerts_created ON public.alerts(created_at DESC);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select" ON public.alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "alerts_all" ON public.alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- ============================================================
-- COLLECTION ROUTES
-- ============================================================
CREATE TABLE public.collection_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  driver_name TEXT,
  vehicle TEXT,
  bin_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  estimated_distance_km FLOAT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.collection_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_select" ON public.collection_routes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "routes_all" ON public.collection_routes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- ============================================================
-- MAINTENANCE SCHEDULES
-- ============================================================
CREATE TABLE public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_id UUID NOT NULL REFERENCES public.waste_bins(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('inspection', 'cleaning', 'repair', 'replacement', 'battery')),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_select" ON public.maintenance_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "maintenance_all" ON public.maintenance_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_id ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bins_updated_at BEFORE UPDATE ON public.waste_bins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_routes_updated_at BEFORE UPDATE ON public.collection_routes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_maintenance_updated_at BEFORE UPDATE ON public.maintenance_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Auto-alert trigger on fill/battery change
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_bin_alerts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fill_level >= 85 AND OLD.fill_level < 85 THEN
    INSERT INTO public.alerts (bin_id, type, severity, title, message)
    VALUES (
      NEW.id, 'overflow',
      CASE WHEN NEW.fill_level >= 95 THEN 'critical' ELSE 'high' END,
      'High Fill Level: ' || NEW.bin_id,
      'Bin ' || NEW.bin_id || ' at ' || NEW.location_name || ' has reached ' || NEW.fill_level || '% capacity.'
    );
  END IF;
  IF NEW.battery_level <= 20 AND OLD.battery_level > 20 THEN
    INSERT INTO public.alerts (bin_id, type, severity, title, message)
    VALUES (NEW.id, 'battery', 'medium', 'Low Battery: ' || NEW.bin_id, 'Bin ' || NEW.bin_id || ' battery is at ' || NEW.battery_level || '%.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_bin_alerts
  AFTER UPDATE ON public.waste_bins
  FOR EACH ROW
  WHEN (OLD.fill_level IS DISTINCT FROM NEW.fill_level OR OLD.battery_level IS DISTINCT FROM NEW.battery_level)
  EXECUTE FUNCTION public.check_bin_alerts();

-- ============================================================
-- Enable Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_bins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_routes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_schedules;
