import { useTaskStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TasksWidget() {
  const { tasks } = useTaskStore()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const completedToday = tasks.filter((task) => {
    if (!task.completed || !task.completed_at) return false
    return new Date(task.completed_at) >= startOfToday
  }).length
  const pendingTasks = tasks.filter((t) => !t.completed).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Tasks</CardTitle>
        <Link to="/tasks">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">{completedToday} completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">{pendingTasks} pending</span>
          </div>
        </div>

        {tasks.filter((t) => !t.completed).slice(0, 3).map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 rounded-lg border bg-muted/40"
          >
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate flex-1">{task.title}</span>
          </div>
        ))}

        {pendingTasks === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            All caught up! Great job!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
