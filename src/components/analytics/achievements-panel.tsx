import { useProgressStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Lock } from 'lucide-react'

const BADGES = [
  { id: 'first-focus', label: 'First Focus', description: 'Complete your first focus session' },
  { id: 'sessions-10', label: 'Deep Work Starter', description: 'Complete 10 focus sessions' },
  { id: 'sessions-50', label: 'Focus Veteran', description: 'Complete 50 focus sessions' },
  { id: 'tasks-25', label: 'Task Finisher', description: 'Complete 25 tasks' },
  { id: 'streak-7', label: '7-Day Streak', description: 'Study 7 consecutive days' },
  { id: 'xp-500', label: 'XP Explorer', description: 'Reach 500 XP' },
]

export function AchievementsPanel() {
  const { unlockedBadges } = useProgressStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {BADGES.map((badge) => {
          const unlocked = unlockedBadges.includes(badge.id)
          return (
            <div
              key={badge.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
            >
              <div>
                <p className="font-medium text-sm">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
              <Badge variant={unlocked ? 'default' : 'outline'} className="shrink-0">
                {unlocked ? 'Unlocked' : <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" />Locked</span>}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
