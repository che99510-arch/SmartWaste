import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { SensorReading } from '@/integrations/supabase/types'

export function useSensorData(binId: string, hours = 24) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['sensor_readings', binId, hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 3600000).toISOString()
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('bin_id', binId)
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: true })
      if (error) throw error
      return data as SensorReading[]
    },
    enabled: !!binId,
  })

  useEffect(() => {
    if (!binId) return
    const channel = supabase.channel(`sensor_${binId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'sensor_readings',
        filter: `bin_id=eq.${binId}`,
      }, () => queryClient.invalidateQueries({ queryKey: ['sensor_readings', binId] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [binId, queryClient])

  return query
}

export function useAllSensorData(hours = 24) {
  return useQuery({
    queryKey: ['sensor_readings_all', hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 3600000).toISOString()
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*, waste_bins(bin_id, location_name, zone)')
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
