import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Notification } from '@/integrations/supabase/types'

export function useNotifications() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      if (error) throw error
      return data as Notification[]
    },
  })

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      channel = supabase.channel(`notif_${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })
        .subscribe()
    })
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [queryClient])

  return query
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
