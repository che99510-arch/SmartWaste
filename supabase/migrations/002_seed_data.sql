-- ============================================================
-- SEED DATA: Bamenda waste bins
-- ============================================================
INSERT INTO public.waste_bins (bin_id, location_name, latitude, longitude, zone, capacity_liters, fill_level, status, waste_type, battery_level, temperature, last_collected) VALUES
('BIN-001', 'Commercial Avenue',    5.9631, 10.1591, 'Zone A', 240, 78, 'active',      'general',    92,  28.5, NOW() - INTERVAL '2 days'),
('BIN-002', 'City Chemist Junction',5.9645, 10.1612, 'Zone A', 240, 45, 'active',      'recyclable', 87,  27.2, NOW() - INTERVAL '1 day'),
('BIN-003', 'Up Station',           5.9712, 10.1534, 'Zone B', 360, 92, 'full',        'general',    76,  29.8, NOW() - INTERVAL '3 days'),
('BIN-004', 'Market Road',          5.9588, 10.1678, 'Zone A', 240, 23, 'active',      'organic',    95,  26.1, NOW() - INTERVAL '1 day'),
('BIN-005', 'Ntarikon',             5.9534, 10.1489, 'Zone C', 240, 67, 'active',      'general',    43,  28.9, NOW() - INTERVAL '4 days'),
('BIN-006', 'Bamenda Hospital',     5.9672, 10.1723, 'Zone B', 360, 35, 'active',      'hazardous',  88,  25.4, NOW() - INTERVAL '2 days'),
('BIN-007', 'Food Market',          5.9556, 10.1601, 'Zone A', 240, 88, 'active',      'organic',    61,  30.2, NOW() - INTERVAL '3 days'),
('BIN-008', 'Cow Street',           5.9623, 10.1543, 'Zone C', 240, 12, 'maintenance', 'general',    15,  27.7, NOW() - INTERVAL '5 days'),
('BIN-009', 'Nkwen Junction',       5.9489, 10.1456, 'Zone D', 240, 54, 'active',      'recyclable', 79,  27.0, NOW() - INTERVAL '2 days'),
('BIN-010', 'Azire',                5.9421, 10.1389, 'Zone D', 240, 71, 'active',      'general',    84,  28.3, NOW() - INTERVAL '2 days'),
('BIN-011', 'Bafut Road',           5.9378, 10.1312, 'Zone D', 360, 96, 'full',        'general',    91,  29.5, NOW() - INTERVAL '4 days'),
('BIN-012', 'Bamenda Airport Road', 5.9801, 10.1234, 'Zone E', 240,  8, 'active',      'general',    97,  25.8, NOW() - INTERVAL '1 day');

-- ============================================================
-- SENSOR READINGS (last 7 days, every 4 hours per bin)
-- ============================================================
INSERT INTO public.sensor_readings (bin_id, fill_level, temperature, battery_level, recorded_at)
SELECT
  b.id,
  GREATEST(0, LEAST(100, b.fill_level - 20 + (series.n * 1))),
  25.0 + (random() * 6)::numeric(4,1),
  GREATEST(10, b.battery_level - (series.n / 6)),
  NOW() - ((series.n * 4) || ' hours')::INTERVAL
FROM public.waste_bins b
CROSS JOIN generate_series(0, 41) AS series(n)
WHERE b.status != 'maintenance';

-- ============================================================
-- ALERTS
-- ============================================================
INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, created_at)
SELECT id, 'overflow', 'critical', 'Critical Fill Level: BIN-003', 'Bin BIN-003 at Up Station has reached 92% capacity.', FALSE, NOW() - INTERVAL '1 hour'
FROM public.waste_bins WHERE bin_id = 'BIN-003';

INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, created_at)
SELECT id, 'overflow', 'critical', 'Critical Fill Level: BIN-011', 'Bin BIN-011 at Bafut Road has reached 96% capacity.', FALSE, NOW() - INTERVAL '30 minutes'
FROM public.waste_bins WHERE bin_id = 'BIN-011';

INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, created_at)
SELECT id, 'overflow', 'high', 'High Fill Level: BIN-007', 'Bin BIN-007 at Food Market has reached 88% capacity.', FALSE, NOW() - INTERVAL '2 hours'
FROM public.waste_bins WHERE bin_id = 'BIN-007';

INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, created_at)
SELECT id, 'battery', 'medium', 'Low Battery: BIN-008', 'Bin BIN-008 battery is at 15%.', FALSE, NOW() - INTERVAL '3 hours'
FROM public.waste_bins WHERE bin_id = 'BIN-008';

INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, created_at)
SELECT id, 'battery', 'medium', 'Low Battery: BIN-005', 'Bin BIN-005 battery is at 43%.', FALSE, NOW() - INTERVAL '4 hours'
FROM public.waste_bins WHERE bin_id = 'BIN-005';

INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, resolved_at, created_at)
SELECT id, 'overflow', 'high', 'Resolved: BIN-002 High Fill', 'Bin BIN-002 was collected and reset.', TRUE, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '10 hours'
FROM public.waste_bins WHERE bin_id = 'BIN-002';

INSERT INTO public.alerts (bin_id, type, severity, title, message, is_resolved, created_at)
SELECT id, 'maintenance', 'high', 'Maintenance Required: BIN-008', 'BIN-008 flagged for sensor and battery repair.', FALSE, NOW() - INTERVAL '6 hours'
FROM public.waste_bins WHERE bin_id = 'BIN-008';

-- ============================================================
-- COLLECTION ROUTES
-- ============================================================
INSERT INTO public.collection_routes (name, driver_name, vehicle, status, estimated_duration_minutes, estimated_distance_km, scheduled_at, notes)
VALUES
('Zone A Morning Route',    'Emmanuel Fru', 'Truck-01', 'pending',   120, 15.4, NOW() + INTERVAL '2 hours',  'Priority: BIN-003, BIN-007, BIN-011'),
('Zone B Afternoon Route',  'Peter Nde',    'Truck-02', 'pending',    90, 12.1, NOW() + INTERVAL '4 hours',  'BIN-006 hazardous — use protective gear'),
('Zone C & D Evening Route','Samuel Tah',   'Truck-01', 'completed', 110, 18.7, NOW() - INTERVAL '1 day',    NULL);

-- ============================================================
-- MAINTENANCE SCHEDULES
-- ============================================================
INSERT INTO public.maintenance_schedules (bin_id, maintenance_type, title, description, assigned_to, status, priority, scheduled_at)
SELECT id, 'repair', 'Sensor Repair — BIN-008', 'Battery and sensor unit replacement needed.', 'Tech Team A', 'scheduled', 'urgent', NOW() + INTERVAL '1 day'
FROM public.waste_bins WHERE bin_id = 'BIN-008';

INSERT INTO public.maintenance_schedules (bin_id, maintenance_type, title, description, assigned_to, status, priority, scheduled_at)
SELECT id, 'cleaning', 'Deep Clean — BIN-003', 'Bin requires cleaning after overflow.', 'Cleaning Crew B', 'scheduled', 'high', NOW() + INTERVAL '6 hours'
FROM public.waste_bins WHERE bin_id = 'BIN-003';

INSERT INTO public.maintenance_schedules (bin_id, maintenance_type, title, description, assigned_to, status, priority, scheduled_at)
SELECT id, 'inspection', 'Monthly Inspection — BIN-005', 'Routine monthly inspection and sensor calibration.', 'Tech Team B', 'scheduled', 'low', NOW() + INTERVAL '7 days'
FROM public.waste_bins WHERE bin_id = 'BIN-005';
