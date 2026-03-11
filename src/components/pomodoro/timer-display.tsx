import { ProgressRing } from './progress-ring'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { usePomodoro } from '@/hooks/use-pomodoro'
import { Badge } from '@/components/ui/badge'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useSessionStore, useTimerStore } from '@/store/app-store'

interface TimerDisplayProps {
  subjectName?: string
}

export function TimerDisplay({ subjectName }: TimerDisplayProps) {
  const { addSession } = useSessionStore()
  const { currentSubjectId } = useTimerStore()

  const {
    isRunning,
    mode,
    timeRemaining,
    progress,
    toggleTimer,
    resetTimer,
    skipToNext,
    setMode,
    completedSessions,
    focusDuration,
  } = usePomodoro({
    onComplete: () => {
      addSession({
        duration: Math.round(focusDuration / 60),
        subject_id: currentSubjectId,
      })
    },
  })

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  useKeyboardShortcuts([
    { key: ' ', action: toggleTimer },
    { key: 'r', action: resetTimer },
    { key: 'n', action: skipToNext },
    { key: 'f', action: () => setMode('focus') },
    { key: 'b', action: () => setMode('break') },
    { key: 'l', action: () => setMode('long-break') },
  ])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 mb-2">
        <Badge
          variant={mode === 'focus' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setMode('focus')}
        >
          Focus
        </Badge>
        <Badge
          variant={mode === 'break' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setMode('break')}
        >
          Break
        </Badge>
        <Badge
          variant={mode === 'long-break' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setMode('long-break')}
        >
          Long Break
        </Badge>
      </div>

      <ProgressRing progress={progress} size={220}>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums">{formattedTime}</span>
          <span className="text-sm text-muted-foreground mt-1">
            {mode === 'focus' ? 'Focus Time' : mode === 'break' ? 'Break Time' : 'Long Break'}
          </span>
          {subjectName && (
            <span className="text-xs text-muted-foreground mt-2 max-w-[150px] truncate">
              {subjectName}
            </span>
          )}
        </div>
      </ProgressRing>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          title="Reset timer"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          onClick={toggleTimer}
          className="w-24"
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={skipToNext}
          title="Skip to next"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Sessions completed: <span className="font-medium text-foreground">{completedSessions}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Shortcuts: Space start/pause, R reset, N skip, F focus, B break, L long break
        </p>
      </div>
    </div>
  )
}
