import { useTheme } from '@/hooks/use-theme'
import { useTimerStore, useProgressStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { dailyGoalMinutes, weeklyGoalSessions, setDailyGoalMinutes, setWeeklyGoalSessions } = useProgressStore()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-1">
          <section className="space-y-3">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  onClick={() => setTheme(option)}
                  className={cn(
                    'capitalize',
                    theme === option && 'border-primary text-primary'
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Pomodoro</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Focus Duration (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={Math.floor(focusDuration / 60)}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!Number.isFinite(value) || value < 1) return
                    setFocusDuration(value * 60)
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Break Duration (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={Math.floor(breakDuration / 60)}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!Number.isFinite(value) || value < 1) return
                    setBreakDuration(value * 60)
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Long Break Duration (minutes)</label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={Math.floor(longBreakDuration / 60)}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!Number.isFinite(value) || value < 5) return
                    setLongBreakDuration(value * 60)
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Sessions Before Long Break</label>
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
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Goals</h3>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Daily Study Goal (minutes)</label>
              <Input
                type="number"
                min={15}
                max={600}
                value={dailyGoalMinutes}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (!Number.isFinite(value) || value < 15) return
                  setDailyGoalMinutes(value)
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Weekly Sessions Goal</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={weeklyGoalSessions}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (!Number.isFinite(value) || value < 1) return
                  setWeeklyGoalSessions(value)
                }}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
