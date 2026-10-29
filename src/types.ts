export interface WasteBin {
  id: string
  bin_id: string
  location_name: string
  latitude: number
  longitude: number
  zone: string
  capacity_liters: number
  fill_level: number
  status: 'active' | 'maintenance' | 'offline' | 'full'
  waste_type: 'general' | 'recyclable' | 'organic' | 'hazardous'
  battery_level: number
  temperature: number | null
  last_collected: string | null
  last_sensor_update: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  bin_id: string | null
  type: 'overflow' | 'maintenance' | 'battery' | 'offline' | 'collection' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  is_resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export interface CollectionRoute {
  id: string
  name: string
  driver_name: string | null
  vehicle: string | null
  bin_ids: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimated_duration_minutes: number | null
  actual_duration_minutes: number | null
  estimated_distance_km: number | null
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceSchedule {
  id: string
  bin_id: string
  maintenance_type: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'battery'
  title: string
  description: string | null
  assigned_to: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduled_at: string
  completed_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SensorReading {
  id: string
  bin_id: string
  fill_level: number
  temperature: number | null
  battery_level: number | null
  weight_kg: number | null
  recorded_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  role: 'admin' | 'operator' | 'viewer'
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}
