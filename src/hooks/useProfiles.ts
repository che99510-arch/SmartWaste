import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Profile } from '@/integrations/supabase/types'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name')
      if (error) throw error
      return data as Profile[]
    },
  })
}

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['profiles', 'me'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error) throw error
      return data as Profile
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}
