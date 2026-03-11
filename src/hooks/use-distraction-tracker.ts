import { useEffect, useRef } from 'react'
import { useDistractionStore } from '@/store/app-store'

interface UseDistractionTrackerProps {
  enabled?: boolean
  onDistraction?: (type: 'tab-switch' | 'idle') => void
}

export function useDistractionTracker({ enabled = true, onDistraction }: UseDistractionTrackerProps = {}) {
  const { logDistraction, resetDistractions } = useDistractionStore()
  const visibilityRef = useRef<boolean>(true)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track tab visibility changes
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      const isHidden = document.hidden
      const wasVisible = visibilityRef.current

      if (wasVisible && isHidden) {
        // User switched away from tab
        logDistraction('tab-switch')
        onDistraction?.('tab-switch')
        visibilityRef.current = false
      } else if (!wasVisible && !isHidden) {
        // User came back to tab
        visibilityRef.current = true
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, logDistraction, onDistraction])

  // Track idle time
  useEffect(() => {
    if (!enabled) return

    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
      idleTimeoutRef.current = setTimeout(() => {
        if (visibilityRef.current) {
          logDistraction('idle')
          onDistraction?.('idle')
        }
      }, 60000) // 1 minute of inactivity
    }

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer, { passive: true })
    })

    // Start initial timer
    resetIdleTimer()

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [enabled, logDistraction, onDistraction])

  return {
    resetDistractions,
  }
}
