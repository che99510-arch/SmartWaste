export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; role: 'admin' | 'operator' | 'viewer'; avatar_url: string | null; phone: string | null; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; role?: 'admin' | 'operator' | 'viewer'; avatar_url?: string | null; phone?: string | null }
        Update: { full_name?: string | null; role?: 'admin' | 'operator' | 'viewer'; avatar_url?: string | null; phone?: string | null }
      }
      waste_bins: {
        Row: { id: string; bin_id: string; location_name: string; latitude: number; longitude: number; zone: string; capacity_liters: number; fill_level: number; status: 'active' | 'maintenance' | 'offline' | 'full'; waste_type: 'general' | 'recyclable' | 'organic' | 'hazardous'; battery_level: number; temperature: number | null; last_collected: string | null; last_sensor_update: string; created_at: string; updated_at: string }
        Insert: { id?: string; bin_id: string; location_name: string; latitude: number; longitude: number; zone: string; capacity_liters?: number; fill_level?: number; status?: 'active' | 'maintenance' | 'offline' | 'full'; waste_type?: 'general' | 'recyclable' | 'organic' | 'hazardous'; battery_level?: number; temperature?: number | null; last_collected?: string | null }
        Update: { bin_id?: string; location_name?: string; latitude?: number; longitude?: number; zone?: string; capacity_liters?: number; fill_level?: number; status?: 'active' | 'maintenance' | 'offline' | 'full'; waste_type?: 'general' | 'recyclable' | 'organic' | 'hazardous'; battery_level?: number; temperature?: number | null; last_collected?: string | null }
      }
      sensor_readings: {
        Row: { id: string; bin_id: string; fill_level: number; temperature: number | null; battery_level: number | null; weight_kg: number | null; recorded_at: string }
        Insert: { id?: string; bin_id: string; fill_level: number; temperature?: number | null; battery_level?: number | null; weight_kg?: number | null; recorded_at?: string }
        Update: { fill_level?: number; temperature?: number | null; battery_level?: number | null; weight_kg?: number | null }
      }
      alerts: {
        Row: { id: string; bin_id: string | null; type: 'overflow' | 'maintenance' | 'battery' | 'offline' | 'collection' | 'system'; severity: 'low' | 'medium' | 'high' | 'critical'; title: string; message: string; is_resolved: boolean; resolved_by: string | null; resolved_at: string | null; created_at: string }
        Insert: { id?: string; bin_id?: string | null; type: 'overflow' | 'maintenance' | 'battery' | 'offline' | 'collection' | 'system'; severity?: 'low' | 'medium' | 'high' | 'critical'; title: string; message: string; is_resolved?: boolean; resolved_by?: string | null; resolved_at?: string | null }
        Update: { type?: 'overflow' | 'maintenance' | 'battery' | 'offline' | 'collection' | 'system'; severity?: 'low' | 'medium' | 'high' | 'critical'; title?: string; message?: string; is_resolved?: boolean; resolved_by?: string | null; resolved_at?: string | null }
      }
      collection_routes: {
        Row: { id: string; name: string; driver_name: string | null; vehicle: string | null; bin_ids: string[]; status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; estimated_duration_minutes: number | null; actual_duration_minutes: number | null; estimated_distance_km: number | null; scheduled_at: string | null; started_at: string | null; completed_at: string | null; notes: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; driver_name?: string | null; vehicle?: string | null; bin_ids?: string[]; status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'; estimated_duration_minutes?: number | null; estimated_distance_km?: number | null; scheduled_at?: string | null; notes?: string | null; created_by?: string | null }
        Update: { name?: string; driver_name?: string | null; vehicle?: string | null; bin_ids?: string[]; status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'; estimated_duration_minutes?: number | null; actual_duration_minutes?: number | null; estimated_distance_km?: number | null; scheduled_at?: string | null; started_at?: string | null; completed_at?: string | null; notes?: string | null }
      }
      maintenance_schedules: {
        Row: { id: string; bin_id: string; maintenance_type: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'battery'; title: string; description: string | null; assigned_to: string | null; status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'; priority: 'low' | 'medium' | 'high' | 'urgent'; scheduled_at: string; completed_at: string | null; notes: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; bin_id: string; maintenance_type: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'battery'; title: string; description?: string | null; assigned_to?: string | null; status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'; priority?: 'low' | 'medium' | 'high' | 'urgent'; scheduled_at: string; notes?: string | null; created_by?: string | null }
        Update: { maintenance_type?: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'battery'; title?: string; description?: string | null; assigned_to?: string | null; status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'; priority?: 'low' | 'medium' | 'high' | 'urgent'; scheduled_at?: string; completed_at?: string | null; notes?: string | null }
      }
      notifications: {
        Row: { id: string; user_id: string; title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; is_read: boolean; related_alert_id: string | null; created_at: string }
        Insert: { id?: string; user_id: string; title: string; message: string; type?: 'info' | 'warning' | 'error' | 'success'; is_read?: boolean; related_alert_id?: string | null }
        Update: { is_read?: boolean }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type WasteBin = Database['public']['Tables']['waste_bins']['Row']
export type SensorReading = Database['public']['Tables']['sensor_readings']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type CollectionRoute = Database['public']['Tables']['collection_routes']['Row']
export type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
