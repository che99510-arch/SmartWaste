import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { MaintenanceSchedule, Database } from '@/integrations/supabase/types'

type MaintenanceWithBin = MaintenanceSchedule & { waste_bins: { bin_id: string; location_name: string } }

export function useMaintenance(binId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['maintenance', binId],
    queryFn: async () => {
      let q = supabase.from('maintenance_schedules').select('*, waste_bins(bin_id, location_name)').order('scheduled_at', { ascending: true })
      if (binId) q = q.eq('bin_id', binId)
      const { data, error } = await q
      if (error) throw error
      return data as MaintenanceWithBin[]
    },
  })

  useEffect(() => {
    const channel = supabase.channel('maintenance_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_schedules' }, () => {
        queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  return query
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (schedule: Database['public']['Tables']['maintenance_schedules']['Insert']) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('maintenance_schedules').insert({ ...schedule, created_by: user?.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceSchedule> }) => {
      const { data, error } = await supabase.from('maintenance_schedules').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('maintenance_schedules').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}
