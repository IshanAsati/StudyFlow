import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'

interface ActivityHeatmapProps {
  sessions: { started_at: string; duration: number }[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, index) => index)

function getCellLabel(day: string, hour: number, minutes: number) {
  const endHour = (hour + 1) % 24
  const start = `${hour.toString().padStart(2, '0')}:00`
  const end = `${endHour.toString().padStart(2, '0')}:00`
  return `${day} ${start}-${end} | ${minutes} min`
}

function getIntensityClass(intensity: number) {
  if (intensity === 0) return 'bg-muted/40'
  if (intensity < 0.2) return 'bg-primary/20'
  if (intensity < 0.4) return 'bg-primary/35'
  if (intensity < 0.7) return 'bg-primary/55'
  return 'bg-primary/80'
}

export function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
  const buckets: Record<string, number> = {}

  for (const session of sessions) {
    const date = new Date(session.started_at)
    const day = date.getDay()
    const hour = date.getHours()
    const key = `${day}-${hour}`
    buckets[key] = (buckets[key] || 0) + session.duration
  }

  const maxMinutes = Math.max(...Object.values(buckets), 1)

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Activity Heatmap</CardTitle>
        <p className="text-xs text-muted-foreground">
          Weekly focus density by hour. Darker blocks indicate more study time.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[760px] rounded-xl border bg-card p-3">
            <div className="grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-1.5">
              <div />
              {HOURS.map((hour) => (
                <div
                  key={`hour-${hour}`}
                  className="text-[10px] text-center text-muted-foreground"
                >
                  {hour % 3 === 0 ? hour : ''}
                </div>
              ))}

              {DAYS.map((day, dayIndex) => (
                <Fragment key={`row-${day}`}>
                  <div
                    className="text-xs font-medium text-muted-foreground pr-1 flex items-center"
                  >
                    {day}
                  </div>

                  {HOURS.map((hour) => {
                    const key = `${dayIndex}-${hour}`
                    const minutes = buckets[key] || 0
                    const intensity = minutes / maxMinutes

                    return (
                      <div
                        key={`cell-${key}`}
                        title={getCellLabel(day, hour, minutes)}
                        className={cn(
                          'h-6 rounded-md border border-border/60 transition-all hover:scale-105 hover:border-primary/60',
                          getIntensityClass(intensity)
                        )}
                      />
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="h-3 w-6 rounded bg-muted/40 border border-border/60" />
          <div className="h-3 w-6 rounded bg-primary/20 border border-border/60" />
          <div className="h-3 w-6 rounded bg-primary/35 border border-border/60" />
          <div className="h-3 w-6 rounded bg-primary/55 border border-border/60" />
          <div className="h-3 w-6 rounded bg-primary/80 border border-border/60" />
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  )
}
