import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function getFillColor(level: number) {
  if (level >= 90) return 'text-red-600'
  if (level >= 75) return 'text-orange-500'
  if (level >= 50) return 'text-yellow-500'
  return 'text-green-500'
}

export function getFillBg(level: number) {
  if (level >= 90) return 'bg-red-500'
  if (level >= 75) return 'bg-orange-500'
  if (level >= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}
