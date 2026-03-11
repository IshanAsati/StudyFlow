import { TimerSettings } from './timer-settings'
import { TimerDisplay } from './timer-display'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTaskStore, useTimerStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

interface PomodoroTimerProps {
  subjectName?: string
}

export function PomodoroTimer({ subjectName }: PomodoroTimerProps) {
  const { subjects } = useTaskStore()
  const { currentSubjectId, setCurrentSubjectId } = useTimerStore()
  const currentSubject = subjects.find((subject) => subject.id === currentSubjectId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pomodoro Timer</CardTitle>
        <TimerSettings />
      </CardHeader>
      <CardContent className="space-y-6 py-8">
        <div className="space-y-2">
          <p className="text-sm font-medium">Current Subject</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCurrentSubjectId(null)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border transition-colors',
                currentSubjectId === null
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              General
            </button>
            {subjects.map((subject) => (
              <button
                type="button"
                key={subject.id}
                onClick={() => setCurrentSubjectId(subject.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm border transition-colors',
                  currentSubjectId === subject.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
                style={{
                  backgroundColor: currentSubjectId === subject.id ? undefined : `${subject.color}15`,
                  borderColor: subject.color,
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <TimerDisplay subjectName={subjectName || currentSubject?.name || 'General'} />
        </div>
      </CardContent>
    </Card>
  )
}
