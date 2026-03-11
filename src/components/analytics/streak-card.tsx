import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useSessionStore } from '@/store/app-store'
import { getStreak } from '@/lib/utils'

interface StreakCardProps {
  sessions?: { started_at: string }[]
}

export function StreakCard({ sessions: sessionsProp }: StreakCardProps) {
  const { sessions } = useSessionStore()
  const streak = getStreak((sessionsProp as { started_at: string }[] | undefined) || sessions)

  return (
    <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium opacity-90">Current Streak</p>
            <p className="text-3xl font-bold">{streak} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
