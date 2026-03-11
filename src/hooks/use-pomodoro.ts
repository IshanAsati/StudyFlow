import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/store/app-store'

interface UsePomodoroProps {
  onComplete?: () => void
  onTick?: (timeRemaining: number) => void
}

export function usePomodoro({ onComplete, onTick }: UsePomodoroProps = {}) {
  const {
    isRunning,
    isPaused,
    mode,
    timeRemaining,
    focusDuration,
    breakDuration,
    longBreakDuration,
    completedSessions,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    tick,
    skipToNext,
    setMode,
    setFocusDuration,
    setBreakDuration,
    setLongBreakDuration,
    setSessionsUntilLongBreak,
  } = useTimerStore()

  const audioRef = useRef<{ play: () => void } | null>(null)
  const prevCompletedSessionsRef = useRef(completedSessions)

  // Initialize audio
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = {
      play: () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      },
    }

    return () => {
      audioRef.current = null
    }
  }, [])

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        tick()
        onTick?.(timeRemaining - 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, timeRemaining, tick, onTick])

  useEffect(() => {
    if (completedSessions > prevCompletedSessionsRef.current) {
      audioRef.current?.play()
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('StudyFlow timer complete', {
            body: 'Focus session finished. Time for a break.',
          })
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification('StudyFlow timer complete', {
                body: 'Focus session finished. Time for a break.',
              })
            }
          })
        }
      }
      onComplete?.()
    }
    prevCompletedSessionsRef.current = completedSessions
  }, [completedSessions, onComplete])

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }, [isRunning, pauseTimer, startTimer])

  const progress = mode === 'focus'
    ? ((focusDuration - timeRemaining) / focusDuration) * 100
    : mode === 'break'
      ? ((breakDuration - timeRemaining) / breakDuration) * 100
      : ((longBreakDuration - timeRemaining) / longBreakDuration) * 100

  return {
    isRunning,
    isPaused,
    mode,
    timeRemaining,
    focusDuration,
    breakDuration,
    longBreakDuration,
    completedSessions,
    progress,
    toggleTimer,
    stopTimer,
    resetTimer,
    skipToNext,
    setMode,
    setFocusDuration,
    setBreakDuration,
    setLongBreakDuration,
    setSessionsUntilLongBreak,
  }
}
