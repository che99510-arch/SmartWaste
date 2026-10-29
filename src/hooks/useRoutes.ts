import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { CollectionRoute, Database } from '@/integrations/supabase/types'

export function useRoutes() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collection_routes').select('*').order('scheduled_at', { ascending: false })
      if (error) throw error
      return data as CollectionRoute[]
    },
  })

  useEffect(() => {
    const channel = supabase.channel('routes_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collection_routes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['routes'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  return query
}

export function useCreateRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (route: Database['public']['Tables']['collection_routes']['Insert']) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('collection_routes').insert({ ...route, created_by: user?.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })
}

export function useUpdateRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CollectionRoute> }) => {
      const { data, error } = await supabase.from('collection_routes').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })
}

export function useDeleteRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collection_routes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })
}
