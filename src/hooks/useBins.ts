import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { WasteBin, Database } from '@/integrations/supabase/types'

type BinInsert = Database['public']['Tables']['waste_bins']['Insert']

export function useBins() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['bins'],
    queryFn: async () => {
      const { data, error } = await supabase.from('waste_bins').select('*').order('bin_id')
      if (error) throw error
      return data as WasteBin[]
    },
  })

  useEffect(() => {
    const channel = supabase.channel('bins_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waste_bins' }, () => {
        queryClient.invalidateQueries({ queryKey: ['bins'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  return query
}

export function useBin(id: string) {
  return useQuery({
    queryKey: ['bins', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('waste_bins').select('*').eq('id', id).single()
      if (error) throw error
      return data as WasteBin
    },
    enabled: !!id,
  })
}

export function useCreateBin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bin: BinInsert) => {
      const { data, error } = await supabase.from('waste_bins').insert(bin).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bins'] }),
  })
}

export function useUpdateBin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WasteBin> }) => {
      const { data, error } = await supabase.from('waste_bins').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bins'] }),
  })
}

export function useDeleteBin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('waste_bins').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bins'] }),
  })
}
