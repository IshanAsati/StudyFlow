import { useDistractionStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MonitorOff } from 'lucide-react'

interface DistractionsLogProps {
  limit?: number
}

export function DistractionsLog({ limit = 10 }: DistractionsLogProps) {
  const { events } = useDistractionStore()
  const visibleEvents = events.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distraction Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 p-2 rounded-lg border bg-muted/40"
            >
              {event.type === 'tab-switch' ? (
                <MonitorOff className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm">
                {event.type === 'tab-switch'
                  ? 'Tab switch detected'
                  : event.type === 'idle'
                    ? 'Idle timeout'
                    : 'Notification interruption'}
              </span>
              <Badge variant="outline" className="ml-auto">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No distractions recorded. Great focus!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
