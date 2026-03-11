import { AnalyticsPanel } from '@/components/analytics/analytics-panel'
import { DistractionsLog } from '@/components/analytics/distractions-log'
import { AchievementsPanel } from '@/components/analytics/achievements-panel'

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsPanel />
      <AchievementsPanel />
      <DistractionsLog />
    </div>
  )
}
