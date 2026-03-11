import { useTimerStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'

export function TimerSettings() {
  const {
    focusDuration,
    breakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    setFocusDuration,
    setBreakDuration,
    setLongBreakDuration,
    setSessionsUntilLongBreak,
  } = useTimerStore()

  const focusMinutes = Math.floor(focusDuration / 60)
  const breakMinutes = Math.floor(breakDuration / 60)
  const longBreakMinutes = Math.floor(longBreakDuration / 60)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Focus Duration (minutes)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={focusMinutes}
              onChange={(e) => setFocusDuration(parseInt(e.target.value) * 60)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Break Duration (minutes)</label>
            <Input
              type="number"
              min={1}
              max={30}
              value={breakMinutes}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (!Number.isFinite(value) || value < 1) return
                setBreakDuration(value * 60)
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Long Break Duration (minutes)</label>
            <Input
              type="number"
              min={5}
              max={60}
              value={longBreakMinutes}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (!Number.isFinite(value) || value < 5) return
                setLongBreakDuration(value * 60)
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sessions Before Long Break</label>
            <Input
              type="number"
              min={2}
              max={12}
              value={sessionsUntilLongBreak}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (!Number.isFinite(value) || value < 2) return
                setSessionsUntilLongBreak(value)
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
