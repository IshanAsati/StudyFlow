import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getStreak(sessions: { started_at: string }[]): number {
  let streak = 0
  const now = new Date()
  const dates = sessions
    .map(s => new Date(s.started_at).toDateString())
    .sort((a, b) => b.localeCompare(a))

  // Check if there's a session today
  const today = now.toDateString()
  if (!dates.includes(today)) {
    // Check if there's a session yesterday to continue streak
    const yesterday = new Date(now.getTime() - 86400000).toDateString()
    if (!dates.includes(yesterday)) {
      return 0
    }
  }

  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i])
    const expectedDate = new Date(now.getTime() - i * 86400000).toDateString()

    if (date.toDateString() === expectedDate) {
      streak++
    } else if (date < new Date(expectedDate)) {
      // Gap found, streak ends
      break
    }
  }

  return streak
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function getXpProgressInLevel(xp: number): { current: number; needed: number } {
  const current = xp % 100
  return { current, needed: 100 }
}
