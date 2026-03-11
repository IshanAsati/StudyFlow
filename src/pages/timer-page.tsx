import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer'
import { DistractionsWidget } from '@/components/analytics/distractions-widget'
import { useDistractionTracker } from '@/hooks/use-distraction-tracker'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

export function TimerPage() {
  useDistractionTracker({
    onDistraction: (type) => {
      toast.error(type === 'tab-switch' ? 'Tab switch detected!' : 'Idle timeout')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timer</h1>
        <p className="text-muted-foreground">Focus with the Pomodoro technique</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PomodoroTimer />
        </div>
        <div>
          <DistractionsWidget />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-2">How to use Pomodoro</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Choose a task to work on</li>
            <li>Set the timer for 25 minutes</li>
            <li>Work until the timer rings</li>
            <li>Take a 5-minute break</li>
            <li>Repeat 4 times, then take a longer break</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
