import { useState, useCallback } from 'react'

type ToastType = 'default' | 'destructive' | 'success'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastType
}

let listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function dispatch(toast: Toast) {
  toasts = [...toasts, toast]
  listeners.forEach(l => l(toasts))
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== toast.id)
    listeners.forEach(l => l(toasts))
  }, 4000)
}

export function toast(props: Omit<Toast, 'id'>) {
  dispatch({ ...props, id: Math.random().toString(36).slice(2) })
}

export function useToast() {
  const [state, setState] = useState<Toast[]>(toasts)

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener)
    return () => { listeners = listeners.filter(l => l !== listener) }
  }, [])

  useState(() => {
    const unsub = subscribe(setState)
    return unsub
  })

  return { toasts: state, toast }
}
