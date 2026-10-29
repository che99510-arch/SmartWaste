import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Alert, Database } from '@/integrations/supabase/types'

type AlertWithBin = Alert & { waste_bins: { bin_id: string; location_name: string } | null }

export function useAlerts(resolvedFilter?: boolean) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['alerts', resolvedFilter],
    queryFn: async () => {
      let q = supabase.from('alerts').select('*, waste_bins(bin_id, location_name)').order('created_at', { ascending: false })
      if (resolvedFilter !== undefined) q = q.eq('is_resolved', resolvedFilter)
      const { data, error } = await q
      if (error) throw error
      return data as AlertWithBin[]
    },
  })

  useEffect(() => {
    const channel = supabase.channel('alerts_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  return query
}

export function useResolveAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('alerts')
        .update({ is_resolved: true, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
        .eq('id', alertId).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (alert: Database['public']['Tables']['alerts']['Insert']) => {
      const { data, error } = await supabase.from('alerts').insert(alert).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
