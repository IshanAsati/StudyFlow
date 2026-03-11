import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface WeeklyProgressProps {
  sessionsThisWeek: number
  weeklyGoal: number
}

export function WeeklyProgress({ sessionsThisWeek, weeklyGoal }: WeeklyProgressProps) {
  const percentage = Math.min((sessionsThisWeek / weeklyGoal) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sessions</span>
          <span className="font-medium">{sessionsThisWeek} / {weeklyGoal}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {percentage >= 100 ? 'Goal achieved!' : `${Math.round(percentage)}% of weekly goal`}
        </p>
      </CardContent>
    </Card>
  )
}
